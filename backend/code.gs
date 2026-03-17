/**
 * Google Apps Script Backend for Portfolio CMS
 *
 * INSTRUCTIONS:
 * 1. Create a Google Spreadsheet.
 * 2. Create sheets: "profile", "projects", "skills", "experience", "blog".
 * 3. Add headers in the first row as specified in the README/Documentation.
 * 4. Open Extensions > Apps Script.
 * 5. Paste this code and Deploy as "Web App".
 * 6. Set "Execute as: Me" and "Who has access: Anyone".
 */

const ADMIN_PASSWORD = "sidik2003"; // Change this!

function doGet(e) {
  const route = e.parameter.route;
  const id = e.parameter.id;
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    if (!route) {
      return response({ success: false, message: "Route parameter missing" });
    }

    const sheet = ss.getSheetByName(route);
    if (!sheet) {
      return response({ success: false, message: "Sheet not found: " + route });
    }

    const data = getSheetData(sheet);

    if (id) {
      const item = data.find((i) => i.id == id);
      return response(item || { success: false, message: "Item not found" });
    }

    return response(data);
  } catch (err) {
    return response({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const params = JSON.parse(e.postData.contents);
  const { action, route, data, password, id } = params;

  if (password !== ADMIN_PASSWORD) {
    return response({ success: false, message: "Unauthorized" });
  }

  const sheet = ss.getSheetByName(route);
  if (!sheet) {
    return response({ success: false, message: "Sheet not found" });
  }

  try {
    switch (action) {
      case "CREATE":
        return createRecord(sheet, data);
      case "UPDATE":
        return updateRecord(sheet, id, data);
      case "DELETE":
        return deleteRecord(sheet, id);
      case "LOGIN":
        return response({ success: true, message: "Login successful" });
      default:
        return response({ success: false, message: "Invalid action" });
    }
  } catch (err) {
    return response({ success: false, error: err.toString() });
  }
}

function getSheetData(sheet) {
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = rows[i][j];
    }
    data.push(obj);
  }
  return data;
}

function createRecord(sheet, data) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = headers.map((h) => data[h] || "");

  // Auto-generate ID if missing and "id" column exists
  if (headers.includes("id") && !data.id) {
    const idIndex = headers.indexOf("id");
    const lastId =
      sheet.getLastRow() > 1
        ? parseInt(
            sheet.getRange(sheet.getLastRow(), idIndex + 1).getValue(),
          ) || 0
        : 0;
    newRow[idIndex] = lastId + 1;
  }

  sheet.appendRow(newRow);
  return response({ success: true, message: "Created successfully" });
}

function updateRecord(sheet, id, data) {
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idIndex = headers.indexOf("id");

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idIndex] == id) {
      const range = sheet.getRange(i + 1, 1, 1, headers.length);
      const updatedRow = headers.map((h) =>
        data[h] !== undefined ? data[h] : rows[i][headers.indexOf(h)],
      );
      range.setValues([updatedRow]);
      return response({ success: true, message: "Updated successfully" });
    }
  }
  return response({ success: false, message: "Record not found" });
}

function deleteRecord(sheet, id) {
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idIndex = headers.indexOf("id");

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idIndex] == id) {
      sheet.deleteRow(i + 1);
      return response({ success: true, message: "Deleted successfully" });
    }
  }
  return response({ success: false, message: "Record not found" });
}

function response(content) {
  return ContentService.createTextOutput(JSON.stringify(content)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
