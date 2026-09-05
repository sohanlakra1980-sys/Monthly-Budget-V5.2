/**
 * My Budget V5.2 - Google Sheets Backend
 * Copy this file into Google Apps Script.
 *
 * Deployment:
 * Execute as: Me
 * Who has access: Anyone
 */

const V52_SHEETS = [
  "Expenses","Income","Loans","LoanPayments","CreditCards",
  "CardPayments","Bills","BillPayments","Recurring","MonthlySummary"
];

const V52_HEADERS = {
  Expenses:["id","date","category","description","amount","paymentMode","notes","createdAt","updatedAt"],
  Income:["id","date","source","description","amount","notes","createdAt","updatedAt"],
  Loans:["id","name","type","principal","annualRate","tenureMonths","emi","startDate","status","notes","createdAt","updatedAt"],
  LoanPayments:["id","loanId","date","amount","principal","interest","paymentMode","notes","createdAt","updatedAt"],
  CreditCards:["id","name","bank","last4","creditLimit","statementDay","dueDay","status","notes","createdAt","updatedAt"],
  CardPayments:["id","cardId","date","amount","paymentMode","notes","createdAt","updatedAt"],
  Bills:["id","name","type","provider","amount","dueDay","frequency","status","autoCarryForward","notes","createdAt","updatedAt"],
  BillPayments:["id","billId","date","amount","paymentMode","notes","createdAt","updatedAt"],
  Recurring:["id","name","category","amount","dueDay","frequency","paymentMode","status","notes","createdAt","updatedAt"],
  MonthlySummary:["id","month","income","expense","balance","notes","createdAt","updatedAt"]
};

function doGet() {
  return json_({ok:true,version:"5.2",message:"My Budget V5.2 backend is running"});
}

function doPost(e) {
  try {
    var body = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    return json_(handleV52_(JSON.parse(body)));
  } catch(err) {
    return json_({ok:false,error:String(err && err.message ? err.message : err)});
  }
}

function handleV52_(p) {
  var action = String(p.action || "").toLowerCase();

  if(action === "setup") {
    setupV52();
    return {ok:true,action:"setup",sheets:V52_SHEETS};
  }

  if(action === "listall") {
    return {ok:true,data:readAllV52_()};
  }

  if(action === "list") {
    var sheet = requireSheet_(p.sheet);
    return {ok:true,sheet:sheet,data:readSheetV52_(sheet)};
  }

  if(action === "upsert") {
    var s = requireSheet_(p.sheet);
    var record = p.record || {};
    if(!record.id) throw new Error("record.id is required");
    upsertV52_(s,record);
    return {ok:true,action:"upsert",sheet:s,id:String(record.id)};
  }

  if(action === "delete") {
    var ds = requireSheet_(p.sheet);
    if(!p.id) throw new Error("id is required");
    deleteV52_(ds,String(p.id));
    return {ok:true,action:"delete",sheet:ds,id:String(p.id)};
  }

  throw new Error("Unknown action: " + action);
}

function setupV52() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  V52_SHEETS.forEach(function(name) {
    var sh = ss.getSheetByName(name);
    if(!sh) sh = ss.insertSheet(name);

    var headers = V52_HEADERS[name];

    if(sh.getMaxColumns() < headers.length) {
      sh.insertColumnsAfter(sh.getMaxColumns(),headers.length-sh.getMaxColumns());
    }

    sh.getRange(1,1,1,headers.length).setValues([headers]);
    sh.setFrozenRows(1);
  });

  return true;
}

function requireSheet_(name) {
  if(!name || V52_SHEETS.indexOf(String(name)) === -1)
    throw new Error("Invalid sheet: " + name);
  return String(name);
}

function readAllV52_() {
  var out = {};
  V52_SHEETS.forEach(function(name) {
    out[name] = readSheetV52_(name);
  });
  return out;
}

function readSheetV52_(name) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if(!sh) throw new Error("Sheet not found: " + name);

  var values = sh.getDataRange().getValues();
  if(values.length <= 1) return [];

  var headers = values[0].map(String);

  return values.slice(1).filter(function(row) {
    return row.some(function(v){ return v !== "" && v !== null; });
  }).map(function(row) {
    var obj = {};
    headers.forEach(function(h,i) {
      var v = row[i];
      if(v instanceof Date) {
        v = Utilities.formatDate(v,Session.getScriptTimeZone(),"yyyy-MM-dd");
      }
      obj[h] = v;
    });
    return obj;
  });
}

function upsertV52_(name,record) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if(!sh) throw new Error("Sheet not found: " + name);

  var headers = V52_HEADERS[name];
  var lastRow = sh.getLastRow();
  var rowNumber = -1;

  if(lastRow >= 2) {
    var ids = sh.getRange(2,1,lastRow-1,1).getValues();
    for(var i=0;i<ids.length;i++) {
      if(String(ids[i][0]) === String(record.id)) {
        rowNumber = i + 2;
        break;
      }
    }
  }

  var row = headers.map(function(h) {
    return record[h] !== undefined && record[h] !== null ? record[h] : "";
  });

  if(rowNumber === -1) sh.appendRow(row);
  else sh.getRange(rowNumber,1,1,headers.length).setValues([row]);
}

function deleteV52_(name,id) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if(!sh) throw new Error("Sheet not found: " + name);

  var lastRow = sh.getLastRow();
  if(lastRow < 2) return;

  var ids = sh.getRange(2,1,lastRow-1,1).getValues();
  for(var i=ids.length-1;i>=0;i--) {
    if(String(ids[i][0]) === String(id)) {
      sh.deleteRow(i+2);
      return;
    }
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function testV52() {
  setupV52();

  var id = "TEST-" + new Date().getTime();

  upsertV52_("Expenses",{
    id:id,
    date:Utilities.formatDate(new Date(),Session.getScriptTimeZone(),"yyyy-MM-dd"),
    category:"Test",
    description:"V5.2 backend test",
    amount:1,
    paymentMode:"Test",
    notes:"Delete this test row after testing",
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString()
  });

  Logger.log("V5.2 test row created: " + id);
}
