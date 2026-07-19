import fs from "node:fs";
import path from "node:path";

const MIN_GLOBAL_LINES = 90;
const MIN_PER_FILE_LINES = 80;
const COVERAGE_EXEMPTIONS = [];

const summaryPath = path.resolve(process.cwd(), "coverage", "coverage-summary.json");

if (!fs.existsSync(summaryPath)) {
  console.error(`Coverage summary not found: ${summaryPath}`);
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));

if (!summary.total?.lines?.pct && summary.total?.lines?.pct !== 0) {
  console.error("Coverage summary is missing total lines percentage.");
  process.exit(1);
}

const globalLines = Number(summary.total.lines.pct);
const failingFiles = [];

for (const [filePath, metrics] of Object.entries(summary)) {
  if (filePath === "total") continue;
  if (!filePath.includes(`${path.sep}src${path.sep}`)) continue;
  if (COVERAGE_EXEMPTIONS.some((entry) => filePath.endsWith(entry))) continue;

  const fileLines = Number(metrics?.lines?.pct);
  if (Number.isNaN(fileLines)) continue;

  if (fileLines < MIN_PER_FILE_LINES) {
    failingFiles.push({ filePath, fileLines });
  }
}

if (globalLines < MIN_GLOBAL_LINES || failingFiles.length > 0) {
  if (globalLines < MIN_GLOBAL_LINES) {
    console.error(
      `Global line coverage ${globalLines.toFixed(2)}% is below required ${MIN_GLOBAL_LINES.toFixed(2)}%.`
    );
  }

  if (failingFiles.length > 0) {
    console.error(`Per-file line coverage must be >= ${MIN_PER_FILE_LINES.toFixed(2)}%. Failed files:`);
    for (const failure of failingFiles) {
      console.error(`- ${failure.filePath}: ${failure.fileLines.toFixed(2)}%`);
    }
  }

  process.exit(1);
}

console.log(
  `Coverage gate passed: global lines ${globalLines.toFixed(2)}%, per-file lines >= ${MIN_PER_FILE_LINES.toFixed(2)}%.`
);
