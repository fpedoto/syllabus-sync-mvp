# SyllabusSync MVP

SyllabusSync tests whether undergraduate students managing at least four courses will turn pasted syllabus text into a reviewed calendar file—and whether they show purchase interest at **$4.99 per semester**.

- **Live product:** https://fpedoto.github.io/syllabus-sync-mvp/
- **Source:** https://github.com/fpedoto/syllabus-sync-mvp
- **Team:** Francie Pedoto and Grace Pavloff

## Meaningful user path

1. Paste non-sensitive syllabus text or load the sample.
2. Extract common written or numeric dates locally in the browser.
3. Review, edit, add, or remove every deadline.
4. Download a working `.ics` calendar file.
5. Choose whether to click a clearly labeled $4.99-per-semester offer; no payment or contact data is collected.

The product does not upload or store pasted text. It handles missing input, unrecognized and invalid dates, assumed years, incomplete fields, duplicate rows, and correction before download. The parser is intentionally limited and requires user review.

## Run and verify

Install Node.js, then run:

```bash
npm test
npm run serve
```

Open `http://localhost:8000`, complete the path with sample text, and open the downloaded file in a calendar application. Also test on a phone, keyboard-only, and in a private browser window.

## Submission package

- [`EXPERIMENT.md`](EXPERIMENT.md): precommitted causal claim, denominator, thresholds, and ethics
- [`EVIDENCE.md`](EVIDENCE.md): moderator protocol, 20-person denominator, behavioral funnel, and revision verification
- [`ECONOMICS.md`](ECONOMICS.md): price, variable costs, contribution, acquisition, retention, and cash logic
- [`BUILD_LOG.md`](BUILD_LOG.md): transparent AI contribution, human verification, limitations, and team ownership
- [`REVISION_RECEIPT.md`](REVISION_RECEIPT.md): consequential Wave 1 → Wave 2 revision record

## Deployment

Push to `main`. Under **Settings → Pages**, choose **GitHub Actions** if necessary. The included workflow tests the experiment logic and deploys the static site. Verify the public URL on a second device before inviting testers.
