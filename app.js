import { buildIcs, extractDeadlines } from "./experiment.js";

const textArea = document.querySelector("#syllabus-text");
const pastePanel = document.querySelector("#paste-panel");
const reviewPanel = document.querySelector("#review-panel");
const successPanel = document.querySelector("#success-panel");
const deadlineList = document.querySelector("#deadline-list");
let latestIcs = "";
let latestDownloadUrl = "";
const exampleText = `September 18 — Problem Set 2 due\nOct. 3: Midterm exam\nOctober 17 — Research proposal due\n11/12/2026 Final project presentation\nDecember 8 — Final exam`;

function setStep(step) {
  for (const item of document.querySelectorAll("[data-progress]")) item.classList.toggle("active", item.dataset.progress === step);
  pastePanel.hidden = step !== "paste"; reviewPanel.hidden = step !== "review"; successPanel.hidden = step !== "download";
}
function showMessage(selector, message) { const el = document.querySelector(selector); el.textContent = message; el.hidden = !message; }
function addDeadlineRow(deadline = { title: "", date: "" }) {
  const fragment = document.querySelector("#deadline-template").content.cloneNode(true);
  const row = fragment.querySelector(".deadline-row");
  row.querySelector(".deadline-title").value = deadline.title; row.querySelector(".deadline-date").value = deadline.date;
  row.querySelector(".remove-button").addEventListener("click", () => { row.remove(); updateSummary(); });
  deadlineList.append(fragment);
}
function updateSummary() {
  const count = deadlineList.querySelectorAll(".deadline-row").length;
  document.querySelector("#review-summary").textContent = `${count} deadline${count === 1 ? "" : "s"} ready for review. Check every date against the syllabus before downloading.`;
}
function currentDeadlines() { return [...deadlineList.querySelectorAll(".deadline-row")].map((row) => ({ title: row.querySelector(".deadline-title").value.trim(), date: row.querySelector(".deadline-date").value })); }
function prepareDownload() {
  if (latestDownloadUrl) URL.revokeObjectURL(latestDownloadUrl);
  latestDownloadUrl = URL.createObjectURL(new Blob([latestIcs], { type: "text/calendar;charset=utf-8" }));
  document.querySelector("#download-link").href = latestDownloadUrl;
}

textArea.addEventListener("input", () => { document.querySelector("#character-count").textContent = `${textArea.value.length.toLocaleString()} characters`; showMessage("#paste-error", ""); });
document.querySelector("#sample-button").addEventListener("click", () => { textArea.value = exampleText; textArea.dispatchEvent(new Event("input")); textArea.focus(); });
document.querySelector("#extract-button").addEventListener("click", () => {
  const value = textArea.value.trim();
  if (value.length < 20) { showMessage("#paste-error", "Paste at least one dated syllabus entry before continuing."); textArea.focus(); return; }
  const deadlines = extractDeadlines(value, new Date().getFullYear()); deadlineList.replaceChildren();
  if (deadlines.length) deadlines.forEach(addDeadlineRow); else addDeadlineRow();
  const assumed = deadlines.filter((item) => item.assumedYear).length;
  const message = deadlines.length ? (assumed ? `${assumed} date${assumed === 1 ? "" : "s"} did not include a year, so we used ${new Date().getFullYear()}. Verify before downloading.` : "") : "No recognizable dates were found. Add a deadline manually below.";
  showMessage("#review-message", message); updateSummary(); setStep("review"); reviewPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});
document.querySelector("#back-button").addEventListener("click", () => setStep("paste"));
document.querySelector("#add-deadline").addEventListener("click", () => { addDeadlineRow(); updateSummary(); deadlineList.lastElementChild.querySelector("input").focus(); });
document.querySelector("#download-button").addEventListener("click", () => {
  const deadlines = currentDeadlines(); const invalid = deadlines.find((item) => !item.title || !item.date);
  if (!deadlines.length || invalid) { showMessage("#review-error", !deadlines.length ? "Add at least one deadline before downloading." : "Every deadline needs both a name and a valid date."); return; }
  if (new Set(deadlines.map((item) => `${item.date}|${item.title.toLowerCase()}`)).size !== deadlines.length) { showMessage("#review-error", "Remove duplicate deadline rows before downloading."); return; }
  showMessage("#review-error", ""); latestIcs = buildIcs(deadlines); prepareDownload();
  document.querySelector("#success-copy").textContent = `${deadlines.length} reviewed deadline${deadlines.length === 1 ? " is" : "s are"} ready to download.`;
  setStep("download"); successPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});
document.querySelector("#download-link").addEventListener("click", () => {
  document.querySelector("#download-help").textContent = "Download started. Open syllabus-sync-deadlines.ics from your browser downloads to add the dates to your calendar.";
});
document.querySelector("#offer-button").addEventListener("click", (event) => { event.currentTarget.disabled = true; event.currentTarget.textContent = "Interest recorded on this device"; document.querySelector("#offer-response").textContent = "Thank you. No payment or contact information was collected. Please tell the test moderator that you selected this option."; });
