# Python Solution Setup Instructions

## Prerequisites

- Python 3.7 or higher
- Google Cloud Project with APIs enabled
- Gmail account (for sending emails)

## Step 1: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable the following APIs:
   - Google Calendar API
   - Google Sheets API
   - Gmail API
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Choose **Desktop app**
   - Download the credentials JSON file
   - Rename it to `credentials.json` and place it in this directory

## Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your values:
   - `GOOGLE_SHEET_ID`: Get this from your Google Sheet URL
     - URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
   - `SENDER_EMAIL`: Your Gmail address
   - `SMTP_PASSWORD`: Gmail App Password (see Step 4)

## Step 4: Set Up Gmail App Password

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to **App passwords**
4. Generate a new app password for "Mail"
5. Copy the password to `.env` as `SMTP_PASSWORD`

## Step 5: Prepare Your Google Sheet

Create a Google Sheet with these columns:
- **Column A**: Student Name
- **Column B**: Student Email
- **Column C**: Total Sessions (usually 10)
- **Column D**: Revolut Payment Link

Make sure the sheet is shared with the Google account you're using for authentication.

## Step 6: Run the Script

1. First run (will open browser for authentication):
   ```bash
   python main.py
   ```
2. Authenticate in the browser
3. A `token.json` file will be created for future runs

## Step 7: Set Up Automation (Optional)

### Option A: Cron Job (Linux/Mac)
```bash
# Edit crontab
crontab -e

# Add line to run daily at 9 AM
0 9 * * * cd /path/to/python-solution && /usr/bin/python3 main.py
```

### Option B: Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (daily at 9 AM)
4. Set action to run `python main.py` in this directory

### Option C: Free Cloud Hosting
- **Google Cloud Functions**: Free tier available
- **Railway**: Free tier available
- **Heroku**: Free tier discontinued, but low-cost options available
- **PythonAnywhere**: Free tier available

## Troubleshooting

### Authentication Issues
- Delete `token.json` and re-run to re-authenticate
- Ensure `credentials.json` is in the same directory

### Can't Find Calendar Events
- Check `CALENDAR_ID` in `.env` (use 'primary' for default calendar)
- Verify events include student names in title or description

### Email Not Sending
- Verify Gmail App Password is correct
- Check SMTP settings in `.env`
- Ensure 2-Step Verification is enabled

## Cost

**FREE** (or very low cost):
- Google APIs: Free (generous quotas)
- Python hosting: Free tiers available on multiple platforms
- Email: Free with Gmail (100 emails/day limit)

## Alternative: Use Gmail API Instead of SMTP

For better reliability, you can modify the script to use Gmail API instead of SMTP. This requires:
- Gmail API enabled in Google Cloud Console
- Additional code changes (see Google's Gmail API documentation)


