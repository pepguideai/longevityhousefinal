# Longevity House — Zelle order log (Google Sheet setup)

Every checkout posts one row to a Google Sheet so you can match Zelle payments
to orders. One-time setup, about 5 minutes, no coding.

## 1. Create the sheet
1. Go to sheets.google.com (signed in as cole@longevityhousellc.com) → Blank sheet
2. Name it **Longevity House — Orders**
3. In row 1, type these headers across A–K exactly:

   Order | Status | Placed | Sent | Name | Email | Phone | Note | Items | Total | Paid?

## 2. Add the receiver script
1. In the sheet: **Extensions → Apps Script**
2. Delete whatever is in the editor and paste the script below
3. Click the disk icon to save (name it anything)

```javascript
function doPost(e) {
  var p = e.parameter;
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  sh.appendRow([
    p.order || "", p.status || "", p.placed || "", p.sent || "",
    p.name || "", p.email || "", p.phone || "", p.note || "",
    p.items || "", Number(p.total) || 0, ""
  ]);
  return ContentService.createTextOutput("ok");
}
```

## 3. Publish it as a web app
1. Top right: **Deploy → New deployment**
2. Click the gear next to "Select type" → **Web app**
3. Execute as: **Me**  ·  Who has access: **Anyone**
4. **Deploy** → authorize when asked (choose the cole@ account, click Advanced → Go to… if it warns) 
5. Copy the **Web app URL** (ends in `/exec`)

## 4. Connect the site
Open `content/site.js`, find `sheetWebhook: ""` and paste the URL between the quotes.
Push the change. Done.

## Day to day
- A new row appears the moment a client taps "I've sent my payment."
- Check the Zelle account for a payment with that **Order** number in the memo.
- Put a **Y** in the **Paid?** column once it lands, then email the client to schedule.

If you ever edit the script, you must **Deploy → Manage deployments → Edit → New version**
for the change to go live — saving alone isn't enough.
