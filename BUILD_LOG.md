# AI and Build Log

This log separates generated work, automated checks, and human verification. It does not treat AI output or automated tests as customer evidence.

| Date | Owner/tool | Specification or prompt | What changed | Inspection or test | Human judgment/status |
|---|---|---|---|---|---|
| Sep. 15, 2026 | Francie Pedoto and Grace Pavloff | Define the customer, costly problem, payer, causal claim, behavioral metric, denominator, decision thresholds, and ethical safeguards before testing. | Replaced the starter experiment with the SyllabusSync precommitment. | Team reviewed the written framework before collecting evidence. | Completed before testing. |
| Sep. 15, 2026 | Codex (AI) | Build a professional MVP that tests whether students complete syllabus-to-calendar conversion and click a transparent $4.99 offer. | Replaced the starter with a paste → extract → review → calendar download → paid-interest path. Added local-only processing, accessibility labels, mobile layout, and edge-state messages. | Automated parsing, decision-rule, validation, and calendar-format tests added. | Human end-to-end verification required before recruiting. |
| Sep. 15, 2026 | Codex (AI) | Make the evidence package match the rubric without inventing results. | Added unit economics, a 20-person observation table, moderator script, denominator rules, two-wave revision fields, README, and revision receipt. | Checked arithmetic and document consistency against `EXPERIMENT.md`. | All numbers labeled assumptions; evidence fields intentionally blank until observed. |
| Sep. 16, 2026 | Francie report + Codex (AI) | Fix a calendar download that did not start reliably. | Replaced the hidden automatic download with a visible native `.ics` download link and kept its file URL active for the session. | Six automated tests passed; browser walkthrough confirmed the link contains a generated calendar file. | Pre-test reliability repair; do not count as the evidence-driven Wave 1 revision. |
| Sep. 16, 2026 | Francie specification + Codex (AI) | Use the current year when none is written and exclude dated chapter/week/topic rows that are not assessed work. | Added current-year defaults and an assessment-focused filter for assignments, homework, projects, papers, quizzes, tests, midterms, finals, and exams; review-only rows are excluded. | Added regression tests for year inference and schedule-topic filtering. | Users still review results because no rules-based parser can interpret every syllabus format. |
| Sep. 16, 2026 | Francie-provided syllabus example + Codex (AI) | Support imperfect Canvas exports containing Markdown tables, links, week ranges, topics, opening notices, and exact assignment rows. | Added table-aware title cleanup, Markdown-link removal, week-range rejection, and exact dated-row extraction. | A sanitized regression fixture modeled on the supplied format extracts 10/10 exact assignment rows and no topic rows; all nine automated checks pass. | The parser does not invent dates for schedule cells that state an item but provide only a week range; it uses the exact Canvas assignment schedule when present. |
| ____ | Francie | Run the complete path on phone and laptop using sample text and a non-sensitive real syllabus; verify downloaded file opens in a calendar. | | | |
| ____ | Grace | Independently repeat the path and inspect mobile readability, keyboard use, wording, privacy claim, and errors. | | | |
| ____ | Francie and Grace | Observe Wave 1, choose one evidence-driven revision, deploy it, and observe Wave 2. | | | |

## Team ownership

- **Team members:** Francie Pedoto and Grace Pavloff
- **Proposed product-path owner:** Francie; Grace independently verifies the full path
- **Proposed test/evidence owner:** Grace; both partners moderate and record observations
- **Proposed economics owner:** Francie; Grace checks every formula and assumption
- **Shared command requirement:** Before submission, both partners must be able to demonstrate the workflow, state both decision thresholds, reproduce the economics, explain the revision, and identify limitations without reading this file.
- **Important limitation:** This MVP recognizes common text dates but is not a complete syllabus parser. It cannot reliably interpret tables, relative dates, recurring schedules, time zones, or every PDF format. Users must review every extracted date. A paid-offer click signals interest but does not prove willingness to pay.

Confirm or edit the proposed ownership labels before submission so they reflect the work actually performed.
