function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'delete') {
      return handleDelete(data.timestamp);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Write header row on first submission
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'College/Unit', 'Campus/Station', 'Age Group', 'Sex at Birth', 'Gender',
        'Employment Type', 'Academic Rank', 'Teaching Load (Previous Sem.)', 'Employment Status', 'Salary Grade', 'Walkable Spaces Available',
        'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7',
        'Q8', 'Q9', 'Q10', 'Q11', 'Q12',
        'PCS-12', 'MCS-12',
        'PCS Interpretation', 'MCS Interpretation'
      ]);
    }

    const r = data.rawResponses;

    function interpret(score) {
      if (score >= 55) return 'Above Average';
      if (score >= 45) return 'Average';
      return 'Below Average';
    }

    sheet.appendRow([
      data.timestamp,
      data.collegeUnit,
      data.campus,
      data.ageGroup,
      data.sexAtBirth,
      data.gender,
      data.employmentType,
      data.academicRank || '',
      data.teachingLoad || '',
      data.employmentStatus,
      data.salaryGrade,
      data.walkableSpaces,
      r.Q1, r.Q2, r.Q3, r.Q4, r.Q5, r.Q6, r.Q7,
      r.Q8, r.Q9, r.Q10, r.Q11, r.Q12,
      data.pcs12,
      data.mcs12,
      interpret(data.pcs12),
      interpret(data.mcs12)
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleDelete(timestamp) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();

    for (var i = lastRow; i >= 2; i--) {
      const cellVal = sheet.getRange(i, 1).getValue();
      const cellStr = cellVal instanceof Date
        ? cellVal.toISOString()
        : String(cellVal);
      if (cellStr === timestamp) {
        sheet.deleteRow(i);
        return ContentService
          .createTextOutput(JSON.stringify({ success: true, deletedRow: i }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Row not found' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
