/**
 * ClassCount - Google Apps Script Solution
 * 
 * This script:
 * 1. Reads student list from Google Sheets
 * 2. Counts sessions from Google Calendar
 * 3. Calculates remaining sessions
 * 4. Sends email with Revolut link when 3 sessions remain
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets with your student list
 * 2. Go to Extensions > Apps Script
 * 3. Paste this code
 * 4. Update the configuration section below
 * 5. Set up a time-driven trigger (Tools > Triggers)
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
  // Google Sheets Configuration
  SHEET_NAME: 'Sheet1', // Name of your sheet tab
  STUDENT_NAME_COL: 1, // Column A (1)
  EMAIL_COL: 2, // Column B (2)
  TOTAL_SESSIONS_COL: 3, // Column C (3) - Total sessions in package
  REVOLUT_LINK_COL: 4, // Column D (4) - Revolut payment link
  
  // Calendar Configuration
  CALENDAR_NAME: 'primary', // Use 'primary' for default calendar, or calendar name
  CALENDLY_KEYWORD: 'Podcast Call', // CDLangServices Keyword to identify Calendly events (in event title/description)
  MONTHS_BACK: 12, // How many months back to check for sessions (default: 12 months)
  
  // Email Configuration
  SENDER_NAME: 'HAII',
  SENDER_EMAIL: 'wearehaiipodcast@gmail.com', // Your Gmail address
  WARNING_THRESHOLD: 3, // Send email when this many sessions remain
  
  // Email Template
  EMAIL_SUBJECT: 'Reminder: Only {remaining} sessions remaining',
  EMAIL_BODY: `
Hi {studentName},

This is an automated reminder that you have {remaining} session(s) remaining in your current package.

To purchase more sessions, please use this payment link:
{revolutLink}

Thank you!
{teacherName}
  `.trim()
};

// ==================== MAIN FUNCTION ====================

/**
 * Main function to check all students and send reminders
 * Run this manually or set up a time-driven trigger
 */
function checkAllStudents() {
  Logger.log('=== checkAllStudents() started ===');
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    Logger.log('Error: No data rows found in sheet (only header row or empty)');
    return;
  }
  
  // Log header row for debugging
  const headers = data[0];
  Logger.log(`Header row: ${headers.join(' | ')}`);
  Logger.log(`Looking for columns: Name=${CONFIG.STUDENT_NAME_COL}, Email=${CONFIG.EMAIL_COL}, Sessions=${CONFIG.TOTAL_SESSIONS_COL}, Link=${CONFIG.REVOLUT_LINK_COL}`);
  Logger.log('');
  
  let processedCount = 0;
  let skippedCount = 0;
  
  // Skip header row (row 1)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const studentName = row[CONFIG.STUDENT_NAME_COL - 1];
    const studentEmail = row[CONFIG.EMAIL_COL - 1];
    const totalSessions = row[CONFIG.TOTAL_SESSIONS_COL - 1];
    const revolutLink = row[CONFIG.REVOLUT_LINK_COL - 1];
    
    // Skip empty rows
    if (!studentName || (typeof studentName === 'string' && !studentName.trim())) {
      skippedCount++;
      Logger.log(`Row ${i + 1}: Skipping - no student name`);
      continue;
    }
    
    // Check email more carefully
    let emailValue = null;
    if (studentEmail) {
      emailValue = studentEmail.toString().trim();
    }
    
    if (!emailValue || emailValue === '' || !emailValue.includes('@')) {
      skippedCount++;
      Logger.log(`Row ${i + 1}: Error - Student "${studentName}" has invalid email in column ${CONFIG.EMAIL_COL}`);
      Logger.log(`  Email value: "${studentEmail}" (type: ${typeof studentEmail})`);
      Logger.log(`  Full row: ${row.map(cell => `"${cell}"`).join(' | ')}`);
      continue;
    }
    
    // Trim and validate
    const trimmedEmail = emailValue;
    const trimmedName = studentName.toString().trim();
    const sessions = totalSessions ? parseInt(totalSessions) : 10;
    
    processedCount++;
    Logger.log(`Row ${i + 1}: Processing ${trimmedName} (${trimmedEmail})`);
    
    // Get remaining sessions
    const remainingSessions = calculateRemainingSessions(trimmedName, trimmedEmail, sessions);
    
    // Check if we need to send a warning email
    if (remainingSessions <= CONFIG.WARNING_THRESHOLD && remainingSessions > 0) {
      sendReminderEmail(trimmedName, trimmedEmail, remainingSessions, revolutLink);
    }
  }
  
  Logger.log('');
  Logger.log(`Summary: ${processedCount} students processed, ${skippedCount} rows skipped`);
}

/**
 * Calculate remaining sessions for a student
 * Checks by email only in event description and attendees
 */
function calculateRemainingSessions(studentName, studentEmail, totalSessions) {
  // Get calendar - use default if 'primary', otherwise get by ID
  let calendar;
  if (CONFIG.CALENDAR_NAME === 'primary') {
    calendar = CalendarApp.getDefaultCalendar();
  } else {
    calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_NAME);
  }
  
  if (!calendar) {
    Logger.log('Calendar not found: ' + CONFIG.CALENDAR_NAME);
    return totalSessions;
  }
  
  // Normalize email for comparison (trim and lowercase)
  const normalizedStudentEmail = studentEmail ? studentEmail.trim().toLowerCase() : '';
  if (!normalizedStudentEmail) {
    Logger.log(`No email provided for ${studentName}`);
    return totalSessions;
  }
  
  // Get events from the configured months back to now
  const now = new Date();
  const startDate = new Date(now.getTime() - (CONFIG.MONTHS_BACK * 30 * 24 * 60 * 60 * 1000));
  
  const events = calendar.getEvents(startDate, now);
  let sessionCount = 0;
  
  // Count sessions for this student
  // Since events are titled "Podcast Call", we check description and attendees
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const title = event.getTitle();
    const description = event.getDescription() || '';
    
    // Only process "Podcast Call" events
    if (title !== CONFIG.CALENDLY_KEYWORD) continue;
    
    // Check if student email appears in description (case-insensitive)
    if (normalizedStudentEmail && description.toLowerCase().includes(normalizedStudentEmail)) {
      sessionCount++;
      continue;
    }
    
    // Check attendees (guests) by email only
    const guests = event.getGuestList();
    if (guests && guests.length > 0) {
      for (let j = 0; j < guests.length; j++) {
        const guest = guests[j];
        const guestEmail = guest.getEmail() || '';
        const normalizedGuestEmail = guestEmail.trim().toLowerCase();
        
        // Check if guest email matches student email
        if (normalizedGuestEmail === normalizedStudentEmail) {
          sessionCount++;
          break;
        }
      }
    }
  }
  
  const remaining = totalSessions - sessionCount;
  Logger.log(`${studentName}: ${sessionCount} sessions used, ${remaining} remaining`);
  
  return remaining;
}

/**
 * Send reminder email to student
 * DO NOT CALL THIS DIRECTLY - it's called automatically by checkAllStudents()
 */
function sendReminderEmail(studentName, studentEmail, remainingSessions, revolutLink) {
  // Prevent direct calls - validate all parameters first
  if (!studentName || !studentEmail || remainingSessions === undefined) {
    Logger.log(`ERROR: sendReminderEmail was called incorrectly!`);
    Logger.log(`This function should NOT be called directly.`);
    Logger.log(`Please run checkAllStudents() instead.`);
    Logger.log(`Parameters received: name="${studentName}", email="${studentEmail}", sessions=${remainingSessions}`);
    return;
  }
  
  const trimmedEmail = studentEmail.toString().trim();
  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    Logger.log(`Error: Invalid email address "${studentEmail}" for ${studentName || 'student'}`);
    return;
  }
  
  if (!studentName) {
    Logger.log(`Error: No student name provided for email ${trimmedEmail}`);
    return;
  }
  
  const trimmedName = studentName.toString().trim();
  if (!trimmedName) {
    Logger.log(`Error: Empty student name for email ${trimmedEmail}`);
    return;
  }
  
  const subject = CONFIG.EMAIL_SUBJECT.replace('{remaining}', remainingSessions);
  const body = CONFIG.EMAIL_BODY
    .replace(/{studentName}/g, trimmedName)
    .replace(/{remaining}/g, remainingSessions)
    .replace(/{revolutLink}/g, revolutLink || 'Contact me for payment link')
    .replace(/{teacherName}/g, CONFIG.SENDER_NAME);
  
  try {
    MailApp.sendEmail({
      to: trimmedEmail,
      subject: subject,
      body: body,
      name: CONFIG.SENDER_NAME
    });
    
    Logger.log(`Reminder email sent to ${trimmedName} (${trimmedEmail})`);
  } catch (error) {
    Logger.log(`Error sending email to ${trimmedName}: ${error.toString()}`);
  }
}

/**
 * Test function - check a single student
 * Replace with actual student email from your sheet
 */
function testSingleStudent() {
  const studentName = 'Test Student'; // Replace with actual name (for logging)
  const studentEmail = 'student@example.com'; // Replace with actual email from sheet
  const totalSessions = 10;
  Logger.log('=== TESTING SINGLE STUDENT ===');
  Logger.log(`Student: ${studentName}`);
  Logger.log(`Email: ${studentEmail}`);
  Logger.log(`Total Sessions: ${totalSessions}`);
  Logger.log('');
  const remaining = calculateRemainingSessions(studentName, studentEmail, totalSessions);
  Logger.log('');
  Logger.log(`=== RESULT: ${remaining} sessions remaining ===`);
}

/**
 * Helper function to check sheet structure and find email column
 * Run this to see what columns are in your sheet
 */
function debugSheetStructure() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  if (data.length === 0) {
    Logger.log('Sheet is empty');
    return;
  }
  
  Logger.log('=== SHEET STRUCTURE DEBUG ===');
  Logger.log(`Sheet name: ${sheet.getName()}`);
  Logger.log(`Total rows: ${data.length}`);
  Logger.log('');
  
  // Show header row
  const headers = data[0];
  Logger.log('Header row:');
  for (let i = 0; i < headers.length; i++) {
    const colLetter = String.fromCharCode(65 + i); // A, B, C, etc.
    Logger.log(`  Column ${colLetter} (${i + 1}): "${headers[i] || '(empty)'}"`);
  }
  Logger.log('');
  
  // Show first data row
  if (data.length > 1) {
    Logger.log('First data row:');
    for (let i = 0; i < data[1].length; i++) {
      const colLetter = String.fromCharCode(65 + i);
      Logger.log(`  Column ${colLetter} (${i + 1}): "${data[1][i] || '(empty)'}"`);
    }
  }
  
  Logger.log('');
  Logger.log('Current CONFIG settings:');
  Logger.log(`  STUDENT_NAME_COL: ${CONFIG.STUDENT_NAME_COL} (Column ${String.fromCharCode(64 + CONFIG.STUDENT_NAME_COL)})`);
  Logger.log(`  EMAIL_COL: ${CONFIG.EMAIL_COL} (Column ${String.fromCharCode(64 + CONFIG.EMAIL_COL)})`);
  Logger.log(`  TOTAL_SESSIONS_COL: ${CONFIG.TOTAL_SESSIONS_COL} (Column ${String.fromCharCode(64 + CONFIG.TOTAL_SESSIONS_COL)})`);
  Logger.log(`  REVOLUT_LINK_COL: ${CONFIG.REVOLUT_LINK_COL} (Column ${String.fromCharCode(64 + CONFIG.REVOLUT_LINK_COL)})`);
}

/**
 * Debug function - inspect all "Podcast Call" events
 * This helps identify what emails are in the events
 */
function debugAllPodcastCallEvents() {
  let calendar;
  if (CONFIG.CALENDAR_NAME === 'primary') {
    calendar = CalendarApp.getDefaultCalendar();
  } else {
    calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_NAME);
  }
  
  if (!calendar) {
    Logger.log('Calendar not found: ' + CONFIG.CALENDAR_NAME);
    return;
  }
  
  const now = new Date();
  const startDate = new Date(now.getTime() - (CONFIG.MONTHS_BACK * 30 * 24 * 60 * 60 * 1000));
  
  const events = calendar.getEvents(startDate, now);
  Logger.log(`=== DEBUGGING ALL PODCAST CALL EVENTS ===`);
  Logger.log(`Date range: ${startDate.toDateString()} to ${now.toDateString()}`);
  Logger.log(`Total events found: ${events.length}`);
  Logger.log('');
  
  let podcastCallCount = 0;
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const title = event.getTitle();
    
    if (title === CONFIG.CALENDLY_KEYWORD) {
      podcastCallCount++;
      const description = event.getDescription() || '';
      const guests = event.getGuestList();
      const guestEmails = guests ? guests.map(g => g.getEmail()).filter(e => e).join(', ') : 'None';
      
      Logger.log(`Event #${podcastCallCount}: ${title}`);
      Logger.log(`  Date: ${event.getStartTime()}`);
      Logger.log(`  Description length: ${description.length} chars`);
      Logger.log(`  Description preview: ${description.substring(0, 100)}...`);
      Logger.log(`  Attendees: ${guestEmails}`);
      Logger.log('');
      
      // Limit output to first 10 events
      if (podcastCallCount >= 10) {
        Logger.log(`... (showing first 10, there may be more)`);
        break;
      }
    }
  }
  
  Logger.log(`Total "Podcast Call" events found: ${podcastCallCount}`);
}

/**
 * Manual function to update remaining sessions in sheet
 * Adds/updates a column with remaining session counts
 */
function updateRemainingSessionsInSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Add header if column doesn't exist (assumes column E)
  if (data[0][4] !== 'Remaining Sessions') {
    sheet.getRange(1, 5).setValue('Remaining Sessions');
  }
  
  // Update each row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const studentName = row[CONFIG.STUDENT_NAME_COL - 1];
    const totalSessions = row[CONFIG.TOTAL_SESSIONS_COL - 1];
    
    if (!studentName) continue;
    
    // Get student email from sheet for email matching
    const studentEmail = row[CONFIG.EMAIL_COL - 1] || '';
    const remaining = calculateRemainingSessions(studentName, studentEmail, totalSessions);
    sheet.getRange(i + 1, 5).setValue(remaining);
  }
  
  Logger.log('Sheet updated with remaining session counts');
}

