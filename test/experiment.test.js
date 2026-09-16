import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildIcs, createExperiment, evaluateExperiment, extractDeadlines } from "../experiment.js";

test("precommitted rule requires the full denominator", () => assert.equal(evaluateExperiment(createExperiment({ visitors: 19, downloads: 12, offerClicks: 8 })), "insufficient-data"));
test("precommitted outcomes are deterministic", () => {
  assert.equal(evaluateExperiment(createExperiment({ visitors: 20, downloads: 8, offerClicks: 4 })), "continue");
  assert.equal(evaluateExperiment(createExperiment({ visitors: 20, downloads: 8, offerClicks: 3 })), "change");
  assert.equal(evaluateExperiment(createExperiment({ visitors: 20, downloads: 5, offerClicks: 5 })), "change");
  assert.equal(evaluateExperiment(createExperiment({ visitors: 20, downloads: 3, offerClicks: 3 })), "stop-or-pivot");
});
test("invalid counts are rejected", () => { assert.throws(() => createExperiment({ visitors: -1 }), /visitors/); assert.throws(() => createExperiment({ visitors: 5, downloads: 6 }), /actions/); });
test("extracts, sorts, and deduplicates dates", () => {
  const result = extractDeadlines("Oct. 3: Midterm exam\n9/18/2026 Problem Set due\n9/18/2026 Problem Set due", 2026);
  assert.deepEqual(result.map(({ title, date }) => ({ title, date })), [{ title: "Problem Set", date: "2026-09-18" }, { title: "Midterm exam", date: "2026-10-03" }]);
});
test("rejects impossible dates and identifies assumed years", () => { assert.equal(extractDeadlines("February 30 — Impossible", 2026).length, 0); assert.equal(extractDeadlines("September 18 — Quiz", 2026)[0].assumedYear, true); });
test("yearless deadlines use the current year by default", () => {
  const result = extractDeadlines("September 18 — Quiz");
  assert.equal(result[0].date, `${new Date().getFullYear()}-09-18`);
});
test("keeps assessed work and excludes dated course topics", () => {
  const result = extractDeadlines(`
    September 1 — Week 1: Chapter 1, Introduction
    September 8 — Topic: Financial statements
    September 15 — Chapter 3 lecture
    September 18 — Homework 1 due
    October 3 — Midterm exam
    October 10 — Midterm review
    October 17 — Week 7: Research proposal due
  `, 2026);
  assert.deepEqual(result.map(({ title }) => title), ["Homework 1", "Midterm exam", "Week 7: Research proposal"]);
});
test("extracts exact deadlines from messy copied Canvas Markdown tables", () => {
  const fixture = readFileSync(new URL("./fixtures/challenging-syllabus.txt", import.meta.url), "utf8");
  const result = extractDeadlines(fixture, 2026);
  assert.equal(result.length, 10);
  assert.deepEqual(result.slice(0, 3).map(({ title, date }) => ({ title, date })), [
    { title: "Syllabus Quiz", date: "2026-08-28" },
    { title: "Apply It: Chapter 2 Assignment", date: "2026-09-01" },
    { title: "Weekly Quiz (Chapter 2)", date: "2026-09-02" },
  ]);
  assert.equal(result.at(-1).title, "Quiz 2");
  assert.equal(result.some(({ title }) => /Flow of Funds|Evolution|Financial Mkts/.test(title)), false);
});
test("calendar output contains escaped all-day events", () => { const ics = buildIcs([{ title: "Exam, Part 1", date: "2026-10-03" }]); assert.match(ics, /DTSTART;VALUE=DATE:20261003/); assert.match(ics, /DTEND;VALUE=DATE:20261004/); assert.match(ics, /SUMMARY:Exam\\, Part 1/); });
