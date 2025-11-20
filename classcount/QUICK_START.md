# Quick Start Guide

## 🚀 Recommended: Google Apps Script (5 minutes setup)

### Step 1: Prepare Your Google Sheet
Create a sheet with 4 columns:
```
A: Student Name
B: Email
C: Total Sessions (10)
D: Revolut Link
```

### Step 2: Install Script
1. Open your Google Sheet
2. **Extensions** → **Apps Script**
3. Copy code from `google-apps-script/Code.gs`
4. Update CONFIG section with your details
5. Save and authorize

### Step 3: Test
1. Run `testSingleStudent` function
2. Check logs to verify it works

### Step 4: Automate
1. **Triggers** → **Add Trigger**
2. Function: `checkAllStudents`
3. Time-driven: Daily at 9 AM
4. Save

**Done!** The script will now:
- ✅ Count sessions from Google Calendar daily
- ✅ Send email when 3 sessions remain
- ✅ Include Revolut payment link

---

## 📋 Important Notes

### Event Detection (Podcast Call Events)
Since all events are titled "Podcast Call", the script looks for student names in:
- Event description, OR
- Event attendees/guests (by email or name)

**Make sure Calendly includes student names in event descriptions or adds them as attendees!**

### Google Sheet Format
Example row:
```
John Doe | john@example.com | 10 | https://revolut.me/yourlink
```

### Email Template
Customize the email in the CONFIG section of the script.

---

## 🔧 Troubleshooting

**No events found?**
- Check calendar name in CONFIG
- Verify student names match exactly
- Check if events are within last 6 months

**Emails not sending?**
- Verify sender email in CONFIG
- Check Gmail daily limits (100 emails/day)

**Need help?**
- See detailed setup: `google-apps-script/SETUP.md`
- Compare solutions: `SOLUTIONS_COMPARISON.md`

---

## 💰 Cost: FREE

Google Apps Script is completely free with generous limits perfect for 5 students.

