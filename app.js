let entries =
JSON.parse(localStorage.getItem("uberEntries")) || [];

let editingIndex = null;

document.getElementById("date").value =
new Date().toISOString().split("T")[0];

function normalizeEntry(entry) {
 let fuel = entry.fuel ?? 0;
 let rentEmi = entry.rentEmi ?? 0;
 let foodTeaWater = entry.foodTeaWater ?? 0;
 let toll = entry.toll ?? 0;
 let dailyExpense = entry.dailyExpense ?? 0;
 let otherExpense = entry.otherExpense ?? 0;
 let otherEarnings = entry.otherEarnings ?? 0;
 let earnings = entry.earnings ?? 0;
 let narration = (entry.narration ?? "").trim();

 if (entry.fuel === undefined && entry.dailyExpense === undefined &&
     entry.otherExpense === undefined && entry.expenses != null) {
  dailyExpense = entry.expenses;
 }

 let expenses = fuel + rentEmi + foodTeaWater + toll + dailyExpense + otherExpense;
 let totalEarnings = earnings + otherEarnings;
 let profit = entry.profit ?? (totalEarnings - expenses);

 return {
  date: entry.date,
  earnings,
  otherEarnings,
  fuel,
  rentEmi,
  foodTeaWater,
  toll,
  dailyExpense,
  otherExpense,
  narration,
  expenses,
  profit
 };
}

entries = entries.map(normalizeEntry);

function saveData() {
 localStorage.setItem(
  "uberEntries",
  JSON.stringify(entries)
 );

 renderTable();
 updateSummary();
}

function readFormValues() {
 return {
  date: document.getElementById("date").value,
  earnings: Number(document.getElementById("earnings").value) || 0,
  otherEarnings: Number(document.getElementById("otherEarnings").value) || 0,
  fuel: Number(document.getElementById("fuel").value) || 0,
  rentEmi: Number(document.getElementById("rentEmi").value) || 0,
  foodTeaWater: Number(document.getElementById("foodTeaWater").value) || 0,
  toll: Number(document.getElementById("toll").value) || 0,
  dailyExpense: Number(document.getElementById("dailyExpense").value) || 0,
  otherExpense: Number(document.getElementById("otherExpense").value) || 0,
  narration: document.getElementById("narration").value.trim()
 };
}

function buildEntry(values) {
 let expenses =
  values.fuel + values.rentEmi + values.foodTeaWater + values.toll +
  values.dailyExpense + values.otherExpense;
 let totalEarnings = values.earnings + values.otherEarnings;

 return {
  date: values.date,
  earnings: values.earnings,
  otherEarnings: values.otherEarnings,
  fuel: values.fuel,
  rentEmi: values.rentEmi,
  foodTeaWater: values.foodTeaWater,
  toll: values.toll,
  dailyExpense: values.dailyExpense,
  otherExpense: values.otherExpense,
  narration: values.narration,
  expenses,
  profit: totalEarnings - expenses
 };
}

function clearForm() {
 document.getElementById("earnings").value = "";
 document.getElementById("otherEarnings").value = "";
 document.getElementById("fuel").value = "";
 document.getElementById("rentEmi").value = "";
 document.getElementById("foodTeaWater").value = "";
 document.getElementById("toll").value = "";
 document.getElementById("dailyExpense").value = "";
 document.getElementById("otherExpense").value = "";
 document.getElementById("narration").value = "";
}

function setEditMode(index) {
 editingIndex = index;
 let entry = entries[index];

 document.getElementById("date").value = entry.date;
 document.getElementById("earnings").value = entry.earnings || "";
 document.getElementById("otherEarnings").value = entry.otherEarnings || "";
 document.getElementById("fuel").value = entry.fuel || "";
 document.getElementById("rentEmi").value = entry.rentEmi || "";
 document.getElementById("foodTeaWater").value = entry.foodTeaWater || "";
 document.getElementById("toll").value = entry.toll || "";
 document.getElementById("dailyExpense").value = entry.dailyExpense || "";
 document.getElementById("otherExpense").value = entry.otherExpense || "";
 document.getElementById("narration").value = entry.narration || "";

 document.getElementById("saveBtn").innerText = "Update";
 document.getElementById("cancelEditBtn").classList.remove("hidden");
 window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
 editingIndex = null;
 document.getElementById("date").value =
  new Date().toISOString().split("T")[0];
 clearForm();
 document.getElementById("saveBtn").innerText = "Save";
 document.getElementById("cancelEditBtn").classList.add("hidden");
}

function addEntry() {
 let values = readFormValues();
 let entry = buildEntry(values);

 if (editingIndex !== null) {
  entries[editingIndex] = entry;
  cancelEdit();
 } else {
  entries.push(entry);
  clearForm();
 }

 saveData();
}

function profitClass(value) {
 return value < 0 ? "profit-negative" : "profit-positive";
}

function formatMoney(value) {
 return "₹" + value;
}

function escapeHtml(text) {
 return String(text)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");
}

function csvEscape(value) {
 let text = String(value ?? "");
 if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
 return text;
}

function getDailyTotals() {
 let byDate = {};

 entries.forEach(e => {
  if (!byDate[e.date]) {
   byDate[e.date] = { earnings: 0, expenses: 0 };
  }
  byDate[e.date].earnings += e.earnings + e.otherEarnings;
  byDate[e.date].expenses += e.expenses;
 });

 Object.keys(byDate).forEach(date => {
  let day = byDate[date];
  day.profit = day.earnings - day.expenses;
 });

 return byDate;
}

function deleteEntry(index) {
 if (!confirm("Delete this entry?")) return;
 entries.splice(index, 1);
 if (editingIndex === index) cancelEdit();
 else if (editingIndex !== null && editingIndex > index) editingIndex--;
 saveData();
}

function editEntry(index) {
 setEditMode(index);
}

function getLastEntryIndexByDate() {
 let last = {};
 entries.forEach((entry, index) => {
  if (last[entry.date] === undefined || index > last[entry.date]) {
   last[entry.date] = index;
  }
 });
 return last;
}

function getTableTotals() {
 let totals = {
  uber: 0,
  otherEarnings: 0,
  earnings: 0,
  fuel: 0,
  rentEmi: 0,
  foodTeaWater: 0,
  toll: 0,
  daily: 0,
  otherExpense: 0,
  expenses: 0,
  profit: 0
 };

 entries.forEach(entry => {
  totals.uber += entry.earnings;
  totals.otherEarnings += entry.otherEarnings;
  totals.earnings += entry.earnings + entry.otherEarnings;
  totals.fuel += entry.fuel;
  totals.rentEmi += entry.rentEmi;
  totals.foodTeaWater += entry.foodTeaWater;
  totals.toll += entry.toll;
  totals.daily += entry.dailyExpense;
  totals.otherExpense += entry.otherExpense;
  totals.expenses += entry.expenses;
  totals.profit += entry.profit;
 });

 return totals;
}

function getSortedEntries() {
 return entries
  .map((entry, index) => ({ entry, index }))
  .sort((a, b) => {
   let dateDiff = new Date(b.entry.date) - new Date(a.entry.date);
   if (dateDiff !== 0) return dateDiff;
   return a.index - b.index;
  });
}

function actionButtonsHtml(index) {
 return `
 <button type="button" class="btn-edit" onclick="editEntry(${index})">Edit</button>
 <button type="button" class="btn-delete" onclick="deleteEntry(${index})">Delete</button>
 `;
}

function metricRow(label, value, isTotal) {
 let totalClass = isTotal ? " metric-total" : "";
 return `
 <div class="metric-row${totalClass}">
  <span class="metric-label">${label}</span>
  <span class="metric-value">${formatMoney(value)}</span>
 </div>
 `;
}

function entryCardHtml({ entry, index }, lastByDate, dailyTotals, includeActions) {
 let rowEarnings = entry.earnings + entry.otherEarnings;
 let isLastOfDay = index === lastByDate[entry.date];
 let dayProfit = dailyTotals[entry.date]?.profit ?? 0;
 let profitBlock = isLastOfDay
  ? `<div class="entry-card-profit ${profitClass(dayProfit)}">
     <span>Daily profit</span>
     <strong>${formatMoney(dayProfit)}</strong>
    </div>`
  : "";
 let actionsBlock = includeActions
  ? `<div class="entry-card-actions">${actionButtonsHtml(index)}</div>`
  : "";
 let narrationBlock = entry.narration
  ? `<div class="entry-card-narration">
     <strong>Narration</strong>
     ${escapeHtml(entry.narration)}
    </div>`
  : "";

 return `
 <article class="entry-card">
  <header class="entry-card-date">${entry.date}</header>
  <section class="entry-card-section earnings-section">
   <h4>Earnings</h4>
   ${metricRow("Uber", entry.earnings, false)}
   ${metricRow("Other", entry.otherEarnings, false)}
   ${metricRow("Total", rowEarnings, true)}
  </section>
  <section class="entry-card-section expenses-section">
   <h4>Expenses</h4>
   ${metricRow("Fuel", entry.fuel, false)}
   ${metricRow("Rent/EMI", entry.rentEmi, false)}
   ${metricRow("Food, Tea, Water", entry.foodTeaWater, false)}
   ${metricRow("Toll", entry.toll, false)}
   ${metricRow("Other Expenses", entry.dailyExpense, false)}
   ${metricRow("Service", entry.otherExpense, false)}
   ${metricRow("Total", entry.expenses, true)}
  </section>
  ${narrationBlock}
  ${profitBlock}
  ${actionsBlock}
 </article>
 `;
}

function summaryCardHtml(totals) {
 return `
 <article class="summary-card">
  <h3 class="summary-card-title">Total</h3>
  <section class="entry-card-section earnings-section">
   <h4>Earnings</h4>
   ${metricRow("Uber", totals.uber, false)}
   ${metricRow("Other", totals.otherEarnings, false)}
   ${metricRow("Total", totals.earnings, true)}
  </section>
  <section class="entry-card-section expenses-section">
   <h4>Expenses</h4>
   ${metricRow("Fuel", totals.fuel, false)}
   ${metricRow("Rent/EMI", totals.rentEmi, false)}
   ${metricRow("Food, Tea, Water", totals.foodTeaWater, false)}
   ${metricRow("Toll", totals.toll, false)}
   ${metricRow("Other Expenses", totals.daily, false)}
   ${metricRow("Service", totals.otherExpense, false)}
   ${metricRow("Total", totals.expenses, true)}
  </section>
  <div class="entry-card-profit summary-total-profit ${profitClass(totals.profit)}">
   <span>Total profit</span>
   <strong>${formatMoney(totals.profit)}</strong>
  </div>
 </article>
 `;
}

function buildReportCardsHtml(includeActions) {
 let lastByDate = getLastEntryIndexByDate();
 let dailyTotals = getDailyTotals();
 let sorted = getSortedEntries();
 let totals = getTableTotals();

 let cards = sorted
  .map(item => entryCardHtml(item, lastByDate, dailyTotals, includeActions))
  .join("");

 return cards + summaryCardHtml(totals);
}

function renderDesktopTable(sorted, lastByDate, dailyTotals) {
 let tbody = document.getElementById("tableBody");
 tbody.innerHTML = "";

 sorted.forEach(({ entry, index }) => {
  let rowEarnings = entry.earnings + entry.otherEarnings;
  let isLastOfDay = index === lastByDate[entry.date];
  let dayProfit = dailyTotals[entry.date]?.profit ?? 0;
  let profitCell = isLastOfDay
   ? `<td class="${profitClass(dayProfit)}">${formatMoney(dayProfit)}</td>`
   : `<td class="profit-cell-empty"></td>`;

  tbody.innerHTML += `
 <tr>
 <td>${entry.date}</td>
 <td>${formatMoney(entry.earnings)}</td>
 <td>${formatMoney(entry.otherEarnings)}</td>
 <td class="amount-total">${formatMoney(rowEarnings)}</td>
 <td>${formatMoney(entry.fuel)}</td>
 <td>${formatMoney(entry.rentEmi)}</td>
 <td>${formatMoney(entry.foodTeaWater)}</td>
 <td>${formatMoney(entry.toll)}</td>
 <td>${formatMoney(entry.dailyExpense)}</td>
 <td>${formatMoney(entry.otherExpense)}</td>
 <td class="amount-total">${formatMoney(entry.expenses)}</td>
 ${profitCell}
 <td class="narration-cell">${entry.narration ? escapeHtml(entry.narration) : ""}</td>
 <td class="actions-cell">${actionButtonsHtml(index)}</td>
 </tr>
 `;
 });
}

function renderMobileCards(sorted, lastByDate, dailyTotals, totals) {
 let container = document.getElementById("mobileEntries");
 let summary = document.getElementById("mobileSummary");

 if (!sorted.length) {
  container.innerHTML =
   `<p class="entries-empty">No entries yet. Add your first transaction above.</p>`;
  summary.innerHTML = "";
  return;
 }

 container.innerHTML = sorted
  .map(item => entryCardHtml(item, lastByDate, dailyTotals, true))
  .join("");

 summary.innerHTML = summaryCardHtml(totals);
}

function updateDesktopTotals(totals) {
 document.getElementById("totalUber").innerText = formatMoney(totals.uber);
 document.getElementById("totalOtherEarnings").innerText =
  formatMoney(totals.otherEarnings);
 document.getElementById("totalEarnings").innerText =
  formatMoney(totals.earnings);
 document.getElementById("totalFuel").innerText = formatMoney(totals.fuel);
 document.getElementById("totalRentEmi").innerText = formatMoney(totals.rentEmi);
 document.getElementById("totalFoodTeaWater").innerText =
  formatMoney(totals.foodTeaWater);
 document.getElementById("totalToll").innerText = formatMoney(totals.toll);
 document.getElementById("totalDaily").innerText = formatMoney(totals.daily);
 document.getElementById("totalOtherExpense").innerText =
  formatMoney(totals.otherExpense);
 document.getElementById("totalExpenses").innerText =
  formatMoney(totals.expenses);

 let profitEl = document.getElementById("totalProfit");
 profitEl.innerText = formatMoney(totals.profit);
 profitEl.className = profitClass(totals.profit);
}

function renderTable() {
 let lastByDate = getLastEntryIndexByDate();
 let dailyTotals = getDailyTotals();
 let sorted = getSortedEntries();
 let totals = getTableTotals();

 renderDesktopTable(sorted, lastByDate, dailyTotals);
 renderMobileCards(sorted, lastByDate, dailyTotals, totals);
 updateDesktopTotals(totals);
}

function localDateStr(date = new Date()) {
 let y = date.getFullYear();
 let m = String(date.getMonth() + 1).padStart(2, "0");
 let d = String(date.getDate()).padStart(2, "0");
 return `${y}-${m}-${d}`;
}

function getMonthRange(date = new Date()) {
 let year = date.getFullYear();
 let month = date.getMonth() + 1;
 let lastDay = new Date(year, date.getMonth() + 1, 0).getDate();
 let monthStr = String(month).padStart(2, "0");
 return {
  start: `${year}-${monthStr}-01`,
  end: `${year}-${monthStr}-${String(lastDay).padStart(2, "0")}`
 };
}

function updateSummary() {
 let today = new Date();
 let todayStr = localDateStr(today);
 let monthRange = getMonthRange(today);
 let totalProfit = 0;
 let todayProfit = 0;
 let monthProfit = 0;
 let dailyTotals = getDailyTotals();

 Object.entries(dailyTotals).forEach(([dateStr, day]) => {
  if (dateStr === todayStr) todayProfit = day.profit;
  else totalProfit += day.profit;

  if (dateStr >= monthRange.start && dateStr <= monthRange.end) {
   monthProfit += day.profit;
  }
 });

 let totalBalance = totalProfit + todayProfit;

 [
  ["totalBalance", totalBalance],
  ["todayProfit", todayProfit],
  ["monthlyProfit", monthProfit]
 ].forEach(([id, value]) => {
  let el = document.getElementById(id);
  el.innerText = "₹" + value;
  el.className = profitClass(value);
 });
}

function pdfScriptUrl() {
 return new URL("./libs/html2pdf.bundle.min.js", window.location.href).href;
}

function getHtml2PdfFn() {
 if (typeof window.html2pdf === "function") return window.html2pdf;
 return null;
}

let pdfLibLoadPromise = null;

function ensurePdfLibrary() {
 let fn = getHtml2PdfFn();
 if (fn) return Promise.resolve(fn);

 if (pdfLibLoadPromise) return pdfLibLoadPromise;

 pdfLibLoadPromise = new Promise((resolve, reject) => {
  function finish() {
   let loaded = getHtml2PdfFn();
   if (loaded) resolve(loaded);
   else reject(new Error("html2pdf not defined"));
  }

  let script = document.getElementById("html2pdfScript");
  if (script && !getHtml2PdfFn()) script.remove();

  script = document.createElement("script");
  script.id = "html2pdfScript";
  script.src = pdfScriptUrl();
  script.onload = finish;
  script.onerror = () => reject(new Error("script error"));
  document.head.appendChild(script);
 });

 return pdfLibLoadPromise.catch(err => {
  pdfLibLoadPromise = null;
  throw err;
 });
}

function buildPdfReportHtml(today) {
 return `
 <h2 class="pdf-report-title">Uber Earnings Report</h2>
 <p class="pdf-report-meta">Generated: ${today}</p>
 ${buildReportCardsHtml(false)}
 `;
}

function exportPDFViaPrint(today, reportHtml) {
 let styleHref = new URL("./style.css", window.location.href).href;
 let printWin = window.open("", "_blank");

 if (!printWin) {
  alert("Allow pop-ups to save PDF, or try again.");
  return;
 }

 printWin.document.open();
 printWin.document.write(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<title>Uber Report ${today}</title>
<link rel="stylesheet" href="${styleHref}">
<style>
body{background:#f4f6f9;padding:15px;}
.pdf-report{position:static;width:auto;left:auto;}
.mobile-entries,.mobile-summary{display:block;}
.entry-card-actions{display:none!important;}
</style>
</head><body class="pdf-print-body">
<div class="pdf-report">${reportHtml}</div>
</body></html>`);
 printWin.document.close();

 printWin.onload = () => {
  printWin.focus();
  printWin.print();
 };
}

async function exportPDF() {
 if (!entries.length) {
  alert("No entries to export.");
  return;
 }

 let today = new Date().toISOString().split("T")[0];
 let reportEl = document.getElementById("pdfReport");
 let reportHtml = buildPdfReportHtml(today);
 reportEl.innerHTML = reportHtml;

 let pdfBtn = document.querySelector(".btn-pdf");
 if (pdfBtn) pdfBtn.disabled = true;

 try {
  let html2pdfFn = await ensurePdfLibrary();

  await html2pdfFn()
   .set({
    margin: [8, 8, 8, 8],
    filename: `Uber_Report_${today}.pdf`,
    image: { type: "jpeg", quality: 0.95 },
    html2canvas: { scale: 2, logging: false },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"], avoid: ".entry-card" }
   })
   .from(reportEl)
   .save();
 } catch {
  exportPDFViaPrint(today, reportHtml);
 } finally {
  reportEl.innerHTML = "";
  if (pdfBtn) pdfBtn.disabled = false;
 }
}

function exportCSV() {
 let csv =
  "Date,Uber Earnings,Other Earnings,Total Earnings,Fuel,Rent/EMI,Food Tea Water,Toll,Other Expenses,Service Expense,Total Expenses,Profit,Narration\n";

 let lastByDate = getLastEntryIndexByDate();
 let dailyTotals = getDailyTotals();

 entries.forEach((entry, index) => {
  let total = entry.earnings + entry.otherEarnings;
  let profitCol = "";
  if (index === lastByDate[entry.date]) {
   profitCol = dailyTotals[entry.date]?.profit ?? 0;
  }
  csv +=
   `${entry.date},${entry.earnings},${entry.otherEarnings},${total},${entry.fuel},${entry.rentEmi},${entry.foodTeaWater},${entry.toll},${entry.dailyExpense},${entry.otherExpense},${entry.expenses},${profitCol},${csvEscape(entry.narration)}\n`;
 });

 let totals = getTableTotals();
 csv +=
  `Total,${totals.uber},${totals.otherEarnings},${totals.earnings},${totals.fuel},${totals.rentEmi},${totals.foodTeaWater},${totals.toll},${totals.daily},${totals.otherExpense},${totals.expenses},${totals.profit},\n`;

 let blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
 let link = document.createElement("a");
 let url = URL.createObjectURL(blob);
 link.href = url;
 let today = new Date().toISOString().split("T")[0];
 link.download = `Uber_Backup_${today}.csv`;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
}

renderTable();
updateSummary();
