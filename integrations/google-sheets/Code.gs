// Paste into the Apps Script project owned by your VHN Google account.
// Set SPREADSHEET_ID in Project Settings > Script properties, then run setupSheet.
const SHEET_NAME = "Enquiries";
const HEADERS = ["Received at", "Request ID", "Source", "Name", "Email", "Phone", "Subject", "Message", "Status"];

function enquirySheet_() {
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("Set SPREADSHEET_ID in Script properties.");
  const spreadsheet = SpreadsheetApp.openById(id);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  } else {
    const headers = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
    if (HEADERS.some((header, index) => headers[index] !== header)) {
      throw new Error("Enquiries headers do not match. Use a new sheet tab.");
    }
  }
  return sheet;
}

// Run once in the editor to authorize Sheets access and initialize the tab.
function setupSheet() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    enquirySheet_();
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  // Health check only. Never expose enquiry rows through the public web app.
  return json_({ success: true, service: "VHN Global enquiries" });
}

function field_(data, name, maximum, required) {
  const value = data[name] === undefined ? "" : data[name];
  if (typeof value !== "string") throw new Error("Invalid field.");
  const text = value.trim();
  if ((required && !text) || text.length > maximum) throw new Error("Invalid field.");
  return text;
}

function sheetText_(value) {
  // Prevent user input from becoming a spreadsheet formula; preserve phone +.
  return /^[\s]*[=+@-]/.test(value) ? "'" + value : value;
}

function doPost(event) {
  let lock;
  try {
    if (!event || !event.postData || event.postData.contents.length > 20000) {
      return json_({ success: false });
    }
    const data = JSON.parse(event.postData.contents);
    if (!data || typeof data !== "object" || Array.isArray(data)) return json_({ success: false });
    const requestId = field_(data, "requestId", 36, true);
    if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(requestId)) {
      return json_({ success: false });
    }
    const source = field_(data, "source", 7, true);
    if (source !== "contact" && source !== "product") return json_({ success: false });
    const name = field_(data, "name", 120, true);
    const email = field_(data, "email", 254, true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json_({ success: false });
    const phone = field_(data, "contact", 40, false);
    const subject = field_(data, "subject", 500, true);
    const message = field_(data, "message", source === "product" ? 3000 : 5000, true);

    lock = LockService.getScriptLock();
    lock.waitLock(10000);
    const sheet = enquirySheet_();
    const lastRow = sheet.getLastRow();
    const existing = lastRow > 1 && sheet.getRange(2, 2, lastRow - 1, 1)
      .createTextFinder(requestId).matchEntireCell(true).findNext();
    if (!existing) {
      sheet.appendRow([new Date(), requestId, source, ...[name, email, phone, subject, message].map(sheetText_), "New"]);
      SpreadsheetApp.flush();
    }
    return json_({ success: true, requestId });
  } catch (error) {
    // Do not return internal errors or log visitors' personal information.
    return json_({ success: false });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}
