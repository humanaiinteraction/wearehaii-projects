"""
ClassCount - Python Solution
A Python script to track student sessions and send email reminders.

Requirements:
- pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
- pip install gspread oauth2client (for Google Sheets)
- pip install python-dotenv (for environment variables)
"""

import os
import json
from datetime import datetime, timedelta
from typing import List, Dict
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

# ==================== CONFIGURATION ====================
CONFIG = {
    'SCOPES': [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/gmail.send'
    ],
    'SHEET_ID': os.getenv('GOOGLE_SHEET_ID', ''),
    'SHEET_NAME': os.getenv('SHEET_NAME', 'Sheet1'),
    'CALENDAR_ID': os.getenv('CALENDAR_ID', 'primary'),
    'EVENT_TITLE': os.getenv('EVENT_TITLE', 'Podcast Call'),  # Title of all calendar events
    'WARNING_THRESHOLD': int(os.getenv('WARNING_THRESHOLD', '3')),
    'SENDER_EMAIL': os.getenv('SENDER_EMAIL', ''),
    'SENDER_NAME': os.getenv('SENDER_NAME', ''),
    'SMTP_SERVER': os.getenv('SMTP_SERVER', 'smtp.gmail.com'),
    'SMTP_PORT': int(os.getenv('SMTP_PORT', '587')),
    'SMTP_USERNAME': os.getenv('SMTP_USERNAME', ''),
    'SMTP_PASSWORD': os.getenv('SMTP_PASSWORD', ''),
}

# Column indices (0-based)
STUDENT_NAME_COL = 0
EMAIL_COL = 1
TOTAL_SESSIONS_COL = 2
REVOLUT_LINK_COL = 3


class SessionTracker:
    def __init__(self):
        self.calendar_service = None
        self.sheets_service = None
        self.credentials = self._authenticate()
        self._build_services()
    
    def _authenticate(self):
        """Authenticate with Google APIs"""
        creds = None
        token_file = 'token.json'
        
        # Load existing token
        if os.path.exists(token_file):
            creds = Credentials.from_authorized_user_file(token_file, CONFIG['SCOPES'])
        
        # If no valid credentials, get new ones
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', CONFIG['SCOPES'])
                creds = flow.run_local_server(port=0)
            
            # Save credentials
            with open(token_file, 'w') as token:
                token.write(creds.to_json())
        
        return creds
    
    def _build_services(self):
        """Build Google API service objects"""
        self.calendar_service = build('calendar', 'v3', credentials=self.credentials)
        self.sheets_service = build('sheets', 'v4', credentials=self.credentials)
    
    def get_students(self) -> List[Dict]:
        """Get student list from Google Sheets"""
        sheet = self.sheets_service.spreadsheets()
        result = sheet.values().get(
            spreadsheetId=CONFIG['SHEET_ID'],
            range=f"{CONFIG['SHEET_NAME']}!A:D"
        ).execute()
        
        values = result.get('values', [])
        students = []
        
        # Skip header row
        for row in values[1:]:
            if len(row) >= 3 and row[STUDENT_NAME_COL] and row[EMAIL_COL]:
                students.append({
                    'name': row[STUDENT_NAME_COL],
                    'email': row[EMAIL_COL],
                    'total_sessions': int(row[TOTAL_SESSIONS_COL]) if len(row) > TOTAL_SESSIONS_COL else 10,
                    'revolut_link': row[REVOLUT_LINK_COL] if len(row) > REVOLUT_LINK_COL else ''
                })
        
        return students
    
    def count_sessions(self, student_name: str, months_back: int = 6) -> int:
        """Count sessions for a student from Google Calendar"""
        now = datetime.utcnow()
        time_min = (now - timedelta(days=months_back * 30)).isoformat() + 'Z'
        time_max = now.isoformat() + 'Z'
        
        events_result = self.calendar_service.events().list(
            calendarId=CONFIG['CALENDAR_ID'],
            timeMin=time_min,
            timeMax=time_max,
            maxResults=1000,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        session_count = 0
        
        for event in events:
            title = event.get('summary', '')
            description = event.get('description', '') or ''
            
            # Only process events with the expected title
            if title != CONFIG['EVENT_TITLE']:
                continue
            
            # Check if student name appears in description
            if student_name.lower() in description.lower():
                session_count += 1
                continue
            
            # Also check attendees (guests) for student email or name
            attendees = event.get('attendees', [])
            if attendees:
                for attendee in attendees:
                    attendee_email = attendee.get('email', '').lower()
                    attendee_name = attendee.get('displayName', '').lower()
                    
                    # Check if attendee email or name matches student
                    if (student_name.lower() in attendee_email or 
                        student_name.lower() in attendee_name):
                        session_count += 1
                        break
        
        return session_count
    
    def calculate_remaining(self, student_name: str, total_sessions: int) -> int:
        """Calculate remaining sessions"""
        used = self.count_sessions(student_name)
        remaining = total_sessions - used
        print(f"{student_name}: {used} sessions used, {remaining} remaining")
        return remaining
    
    def send_reminder_email(self, student_name: str, student_email: str, 
                           remaining_sessions: int, revolut_link: str):
        """Send reminder email to student"""
        subject = f"Reminder: Only {remaining_sessions} session(s) remaining"
        
        body = f"""Hi {student_name},

This is an automated reminder that you have {remaining_sessions} session(s) remaining in your current package.

To purchase more sessions, please use this payment link:
{revolut_link or 'Contact me for payment link'}

Thank you!
{CONFIG['SENDER_NAME']}
"""
        
        msg = MIMEMultipart()
        msg['From'] = f"{CONFIG['SENDER_NAME']} <{CONFIG['SENDER_EMAIL']}>"
        msg['To'] = student_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        try:
            server = smtplib.SMTP(CONFIG['SMTP_SERVER'], CONFIG['SMTP_PORT'])
            server.starttls()
            server.login(CONFIG['SMTP_USERNAME'], CONFIG['SMTP_PASSWORD'])
            server.send_message(msg)
            server.quit()
            print(f"Reminder email sent to {student_name} ({student_email})")
        except Exception as e:
            print(f"Error sending email to {student_name}: {str(e)}")
    
    def check_all_students(self):
        """Check all students and send reminders if needed"""
        students = self.get_students()
        
        for student in students:
            remaining = self.calculate_remaining(
                student['name'], 
                student['total_sessions']
            )
            
            if (remaining <= CONFIG['WARNING_THRESHOLD'] and 
                remaining > 0):
                self.send_reminder_email(
                    student['name'],
                    student['email'],
                    remaining,
                    student['revolut_link']
                )


def main():
    """Main function"""
    tracker = SessionTracker()
    tracker.check_all_students()


if __name__ == '__main__':
    main()

