// look up budget category for last transaction
// look up remaining budget for this category
// post to slack with remaining budget for that category
function doPost(e) {
  var payload = JSON.parse(e.postData.contents);
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(e.parameter.sheet || 'My Logs');

  // Ensure that a row Array is in the payload
  if(payload.row && payload.row.length > 0) {

    // Insert the row from the payload
    var range = sheet.getRange(sheet.getLastRow() + 1, 1, 1, payload.row.length);
    range.setValues([payload.row]);

    // Get category
    var sheet = spreadsheet.getSheetByName("My Transactions");
    var lastRow = parseInt(sheet.getRange("k1").getValue())
    var category = sheet.getRange("f" + lastRow).getValue();

    // Get budget
    var budgetSheet = spreadsheet.getSheetByName("Budgets");
    var budgets = budgetSheet.getRange("A:E").getValues()
    var budgetValue = null
    for (var j = 0; j < budgets.length; j++) {
      if (budgets[j][0] === category) {
        budgetValue = budgets[j][4]
        break
      }
    }

    // Respond gracefully
    var JSONOutput = ContentService.createTextOutput(JSON.stringify({ error: false, category: category, budgetValue: budgetValue }));
    JSONOutput.setMimeType(ContentService.MimeType.JSON);
    return JSONOutput;
  }

  // Respond with error message
  var JSONOutput = ContentService.createTextOutput(JSON.stringify({ error: true, message: 'No "row" of type Array in request payload.' }));
  JSONOutput.setMimeType(ContentService.MimeType.JSON);
  return JSONOutput;
}

function doGet(e) {
  if (e.parameter.range) {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = e.parameter.sheet || 'My Logs';
    var sheet = spreadsheet.getSheetByName(sheetName);

    // Get the data
    var range = sheet.getRange(e.parameter.range);
    var data = range.getValues();

    // Respond with success message
    var JSONOutput = ContentService.createTextOutput(JSON.stringify({ error: false, data: data, sheet: sheetName }));
    JSONOutput.setMimeType(ContentService.MimeType.JSON);
    return JSONOutput;

  } else {

    // Respond with error message
    var JSONOutput = ContentService.createTextOutput(JSON.stringify({ error: true, message: 'No query parameter "range" in request.' }));
    JSONOutput.setMimeType(ContentService.MimeType.JSON);
    return JSONOutput;

  }
}
