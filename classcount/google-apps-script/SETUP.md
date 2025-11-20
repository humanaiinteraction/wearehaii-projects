# Google Apps Script Setup Instructions

## Step 1: Prepare Your Google Sheet

Create a Google Sheet with the following columns:
- **Column A**: Student Name
- **Column B**: Student Email
- **Column C**: Total Sessions (usually 10)
- **Column D**: Revolut Payment Link

Example:
```
| Student Name | Email              | Total Sessions | Revolut Link                    |
|--------------|-------------------|----------------|--------------------------------|
| John Doe     | john@example.com  | 10             | https://revolut.me/yourlink    |
| Jane Smith   | jane@example.com  | 10             | https://revolut.me/yourlink    |
```

## Step 2: Install the Script

1. Open your Google Sheet
2. Click **Extensions** → **Apps Script**
3. Delete any default code
4. Copy and paste the code from `Code.gs`
5. Update the `CONFIG` section at the top with your settings:
   - `SHEET_NAME`: Your sheet tab name
   - `CALENDAR_NAME`: Usually 'primary' for your default calendar
   - `CALENDLY_KEYWORD`: Keyword to identify Calendly events (default: 'Calendly')
   - `SENDER_NAME` and `SENDER_EMAIL`: Your name and email
   - `WARNING_THRESHOLD`: Number of sessions remaining before sending email (default: 3)

## Step 3: Authorize the Script

1. Click the **Save** icon (💾)
2. Give your project a name (e.g., "ClassCount")
3. Click **Run** → Select `testSingleStudent` function
4. You'll be prompted to authorize the script:
   - Click **Review Permissions**
   - Choose your Google account
   - Click **Advanced** → **Go to [Project Name] (unsafe)**
   - Click **Allow**
5. The script needs permissions to:
   - Read/write Google Sheets
   - Read Google Calendar
   - Send emails via Gmail

## Step 4: Test the Script

1. Update the `testSingleStudent` function with a real student name
2. Run `testSingleStudent` to verify it works
3. Check the execution log (View → Logs) for results

## Step 5: Set Up Automatic Triggers

1. In Apps Script, click **Triggers** (clock icon) → **Add Trigger**
2. Configure:
   - **Function**: `checkAllStudents`
   - **Event source**: Time-driven
   - **Type**: Day timer
   - **Time**: Choose when to run (e.g., daily at 9 AM)
3. Click **Save**

## Step 6: Event Detection (Podcast Call Events)

The script is configured for events titled **"Podcast Call"**. It identifies student sessions by:
- Event title is exactly "Podcast Call" AND
- Event description contains the student's name, OR
- Event attendees include the student (by email or name)

**Important**: 
- Make sure your Calendly events include the student's name in the event description
- Or ensure students are added as attendees/guests to the calendar event
- The script will only count events with the exact title "Podcast Call" (configured in CONFIG.EVENT_TITLE)

## Troubleshooting

### Script can't find calendar events
- Check that `CALENDAR_NAME` is correct ('primary' for default calendar)
- Verify events are in the correct calendar
- Check that events are within the last 6 months

### Events not being counted
- Ensure student names in the sheet match how they appear in event descriptions or attendee lists
- Verify events are titled exactly "Podcast Call" (or update CONFIG.EVENT_TITLE)
- Check that Calendly includes student names in event descriptions or adds them as attendees
- Review event descriptions in Google Calendar to see how student names appear

### Emails not sending
- Verify `SENDER_EMAIL` is correct
- Check Gmail sending limits (100 emails/day for free accounts)
- Review execution logs for errors

## Optional: Add Remaining Sessions Column

Run the `updateRemainingSessionsInSheet` function to add a column showing remaining sessions for each student. This updates Column E with the current count.

## Cost

**FREE** - Google Apps Script is completely free with:
- 6 hours/day execution time
- 20,000 API calls/day
- Unlimited email sends (subject to Gmail limits)

