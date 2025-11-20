# ClassCount - Session Tracking Solution

A low-cost solution to automatically track remaining sessions for students and send email reminders when sessions are running low.

## Problem Statement

An English language teacher needs to:
- Track how many sessions remain in each student's subscription (10-session packages)
- Students are listed in Google Sheets
- Sessions are booked via Calendly and appear in Google Calendar
- Automate the count of remaining sessions
- Send email with Revolut payment link when only 3 sessions remain

## Solution Options

### Option 1: Google Apps Script (Recommended - FREE)
- **Cost**: Completely free
- **Pros**: Native Google integration, no hosting needed, easy to set up
- **Cons**: Limited to Google ecosystem, execution time limits

### Option 2: Python Script with Google APIs
- **Cost**: Free (Google APIs are free, hosting on free tier services)
- **Pros**: More flexible, can be extended easily
- **Cons**: Requires hosting setup, more technical knowledge

## Setup Instructions

See the respective folders for detailed setup instructions:
- `google-apps-script/` - For Google Apps Script solution
- `python-solution/` - For Python solution

## Features

- ✅ Automatic session counting from Google Calendar
- ✅ Email notifications when 3 sessions remain
- ✅ Revolut payment link integration
- ✅ Google Sheets integration for student management
- ✅ Calendly event detection


