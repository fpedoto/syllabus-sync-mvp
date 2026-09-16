import test from "node:test";
import assert from "node:assert/strict";
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
test("calendar output contains escaped all-day events", () => { const ics = buildIcs([{ title: "Exam, Part 1", date: "2026-10-03" }]); assert.match(ics, /DTSTART;VALUE=DATE:20261003/); assert.match(ics, /DTEND;VALUE=DATE:20261004/); assert.match(ics, /SUMMARY:Exam\\, Part 1/); });
