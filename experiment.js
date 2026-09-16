const MONTHS = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
  apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
  aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, october: 10,
  nov: 11, november: 11, dec: 12, december: 12,
};

export function createExperiment({ visitors = 0, downloads = 0, offerClicks = 0 } = {}) {
  for (const [name, value] of Object.entries({ visitors, downloads, offerClicks })) {
    if (!Number.isInteger(value) || value < 0) throw new Error(`${name} must be a nonnegative integer`);
  }
  if (downloads > visitors || offerClicks > visitors) throw new Error("actions cannot exceed visitors");
  return { visitors, downloads, offerClicks };
}

export function evaluateExperiment({ visitors, downloads, offerClicks }) {
  if (visitors < 20) return "insufficient-data";
  if (downloads < 4) return "stop-or-pivot";
  if (downloads >= 8 && offerClicks >= 4) return "continue";
  return "change";
}

export function normalizeYear(year, fallbackYear = new Date().getFullYear()) {
  if (!year) return fallbackYear;
  const value = Number(year);
  return value < 100 ? 2000 + value : value;
}

function isAcademicDeadline(line) {
  const value = line.toLowerCase();
  const reviewOnly = /\b(exam|test|midterm|final)\s+review\b|\breview\s+(?:for\s+)?(?:the\s+)?(exam|test|midterm|final)\b/;
  if (reviewOnly.test(value) && !/\bdue\b/.test(value)) return false;

  const assessedWork = /\b(assignments?|homeworks?|problem\s*sets?|projects?|papers?|essays?|proposals?|presentations?|reports?|labs?|quiz(?:zes)?|exams?|midterms?|finals?|tests?|submissions?|deliverables?|discussions?|reflections?|worksheets?|case\s+(?:study|analysis)|due)\b/;
  return assessedWork.test(value);
}

function validIso(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function cleanTitle(line, matchedText) {
  const readable = line
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/\[([^\]]+)]\((?:https?:\/\/[^)]+)\)/gi, "$1")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\\/g, " ");

  if (readable.includes("|")) {
    const cells = readable.split("|")
      .map((cell) => cell.replace(matchedText, " ").replace(/\s+/g, " ").trim())
      .filter(Boolean);
    const contentCell = cells.find((cell) =>
      !/^(assignment|quiz|exam|test|points?|date|name|assignment type)$/i.test(cell)
      && !/^\d+(?:\.\d+)?$/.test(cell)
      && !/^[-: ]+$/.test(cell)
    );
    if (contentCell) return contentCell.replace(/\b(?:is\s+)?due\b.*$/i, "").trim() || "Course deadline";
  }

  const withoutDate = readable.replace(matchedText, " ")
    .replace(/^[\s:;\-–—•*\d.)]+/, "")
    .replace(/\b(due|on|by)\b\s*[:\-–—]?/gi, " ")
    .replace(/[\s:;\-–—]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return withoutDate || "Course deadline";
}

export function extractDeadlines(text, fallbackYear = new Date().getFullYear()) {
  const lines = String(text).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const results = [];
  const seen = new Set();
  const monthPattern = Object.keys(MONTHS).sort((a, b) => b.length - a.length).join("|");
  const written = new RegExp(`\\b(${monthPattern})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{2,4}))?\\b`, "i");
  const numeric = /\b(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?\b/;
  for (const line of lines) {
    if (!isAcademicDeadline(line)) continue;
    if (/\b\d{1,2}[\/-]\d{1,2}\s*[-–—]\s*\d{1,2}[\/-]\d{1,2}\b/.test(line)) continue;
    if (/\bopens?\b/i.test(line) && !/\bdue\b/i.test(line)) continue;
    let match = line.match(written);
    let month; let day; let year;
    if (match) {
      month = MONTHS[match[1].toLowerCase()]; day = Number(match[2]); year = normalizeYear(match[3], fallbackYear);
    } else {
      match = line.match(numeric);
      if (!match) continue;
      month = Number(match[1]); day = Number(match[2]); year = normalizeYear(match[3], fallbackYear);
    }
    const date = validIso(year, month, day);
    if (!date) continue;
    const title = cleanTitle(line, match[0]);
    const key = `${date}|${title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ title, date, source: line, assumedYear: !match[3] });
  }
  return results.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

export function escapeIcs(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function buildIcs(deadlines) {
  const events = deadlines.map(({ title, date }) => {
    const compact = date.replaceAll("-", "");
    return ["BEGIN:VEVENT", `UID:${compact}-${stableId(title)}@syllabussync.local`, `DTSTART;VALUE=DATE:${compact}`, `DTEND;VALUE=DATE:${nextDayCompact(date)}`, `SUMMARY:${escapeIcs(title)}`, "DESCRIPTION:Created with SyllabusSync. Verify this deadline against the original syllabus.", "END:VEVENT"].join("\r\n");
  }).join("\r\n");
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SyllabusSync//MVP//EN", "CALSCALE:GREGORIAN", events, "END:VCALENDAR", ""].join("\r\n");
}

function stableId(value) {
  let hash = 2166136261;
  for (const char of value) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(16);
}

function nextDayCompact(iso) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}
