#!/usr/bin/env node

/**
 * sync_xlsx_to_json.js
 * Synchronizes 'நம்ம சாமி நம்ம கோவில் - full.xlsx' to 'namma_sami_namma_kovil_full.json'
 * Supports manual execution, real-time --watch mode, and --push to Git/GitHub.
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { execSync } = require('child_process');

// Parse CLI Arguments
const args = process.argv.slice(2);
let excelPath = path.resolve(__dirname, 'நம்ம சாமி நம்ம கோவில் - full.xlsx');
let jsonPath = path.resolve(__dirname, 'namma_sami_namma_kovil_full.json');
let isWatchMode = false;
let shouldPush = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--watch' || arg === '-w') {
    isWatchMode = true;
  } else if (arg === '--push' || arg === '-p') {
    shouldPush = true;
  } else if ((arg === '--file' || arg === '-f') && args[i + 1]) {
    excelPath = path.resolve(args[++i]);
  } else if ((arg === '--output' || arg === '-o') && args[i + 1]) {
    jsonPath = path.resolve(args[++i]);
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
Usage: node sync_xlsx_to_json.js [options]

Options:
  -f, --file <path>    Path to input .xlsx file (default: "நம்ம சாமி நம்ம கோவில் - full.xlsx")
  -o, --output <path>  Path to output .json file (default: "namma_sami_namma_kovil_full.json")
  -w, --watch          Watch input .xlsx file for updates and auto-sync
  -p, --push           Automatically git commit & push updated JSON to GitHub after sync
  -h, --help           Show help message
`);
    process.exit(0);
  }
}

function gitPushChanges() {
  try {
    console.log('\n🚀 Committing and pushing dataset changes to GitHub...');
    execSync('git add "நம்ம சாமி நம்ம கோவில் - full.xlsx" namma_sami_namma_kovil_full.json', { cwd: __dirname, stdio: 'inherit' });

    try {
      execSync('git diff --cached --quiet', { cwd: __dirname });
      console.log('ℹ️ No new changes detected. Git repository is already up to date.');
    } catch (e) {
      const commitMsg = `chore(data): auto-sync dataset [${new Date().toLocaleDateString()}]`;
      execSync(`git commit -m "${commitMsg}"`, { cwd: __dirname, stdio: 'inherit' });
      execSync('git push origin main', { cwd: __dirname, stdio: 'inherit' });
      console.log('✅ Successfully pushed updated dataset to GitHub main branch!');
    }
  } catch (err) {
    console.error(`⚠️ Git push operation note: ${err.message}`);
  }
}

function runSync() {
  const startTime = Date.now();
  console.log(`\n🔄 [${new Date().toLocaleTimeString()}] Starting synchronization...`);
  console.log(`   Source Excel: ${excelPath}`);
  console.log(`   Target JSON : ${jsonPath}`);

  if (!fs.existsSync(excelPath)) {
    console.error(`❌ Error: Excel file not found at path: ${excelPath}`);
    return false;
  }

  // Load existing JSON to preserve manual grades if not present in Excel
  const existingGradeMap = new Map();
  if (fs.existsSync(jsonPath)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      for (const item of existingData) {
        if (item.name && item.mobile) {
          const key = `${item.name.trim()}_${String(item.mobile).trim()}`;
          if (item.grade && item.grade !== 'Ungraded') {
            existingGradeMap.set(key, item.grade);
          }
        }
      }
      console.log(`   Loaded ${existingGradeMap.size} existing record grades from JSON for preservation.`);
    } catch (e) {
      console.warn(`⚠️ Note: Could not read existing JSON for grade preservation (${e.message}).`);
    }
  }

  try {
    const workbook = XLSX.readFile(excelPath, { cellFormula: false });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(sheet['!ref']);

    const records = [];
    for (let r = 1; r <= range.e.r; r++) {
      const getVal = (c) => {
        const cell = sheet[XLSX.utils.encode_cell({ r, c })];
        if (!cell || cell.v === undefined || cell.v === null) return '';
        return String(cell.v).trim();
      };

      const name = getVal(0); // Col A: பெயர்
      if (name && name !== '-') {
        const mobile = getVal(1);  // Col B: தொடர்பு எண்
        const region = getVal(2);  // Col C: மண்டலம்
        const district = getVal(3);// Col D: மாவட்டம்
        const union = getVal(4);   // Col E: ஒன்றியம்
        const pincode = getVal(5); // Col F: பின்கோடு
        const meaning = getVal(6); // Col G: தமிழ் பெயர் விளக்கம்
        const excelGrade = getVal(7); // Col H: Grade (if present)

        const recordKey = `${name}_${mobile}`;
        const finalGrade = excelGrade || existingGradeMap.get(recordKey) || 'Ungraded';

        records.push({
          name,
          mobile,
          region,
          district,
          union,
          pincode,
          meaning,
          grade: finalGrade
        });
      }
    }

    // Atomic write to JSON
    const tempJsonPath = `${jsonPath}.tmp`;
    fs.writeFileSync(tempJsonPath, JSON.stringify(records, null, 2), 'utf8');
    fs.renameSync(tempJsonPath, jsonPath);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    const fileSizeMB = (fs.statSync(jsonPath).size / (1024 * 1024)).toFixed(2);
    console.log(`✅ Sync Completed Successfully in ${elapsed}s!`);
    console.log(`   📊 Total Records Synced: ${records.length.toLocaleString()}`);
    console.log(`   📁 Output File Size   : ${fileSizeMB} MB`);

    if (shouldPush) {
      gitPushChanges();
    }

    return true;
  } catch (err) {
    console.error(`❌ Sync Failed: ${err.message}`);
    return false;
  }
}

// Execute initial sync
runSync();

// If --watch mode is enabled, set up file watcher
if (isWatchMode) {
  console.log(`\n👀 Live Watcher active. Monitoring changes to: ${excelPath}`);
  console.log(`   (Press Ctrl+C to stop watching)\n`);

  let debounceTimer = null;
  fs.watch(excelPath, (eventType) => {
    if (eventType === 'change' || eventType === 'rename') {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log(`\n⚡ File change detected in ${path.basename(excelPath)}! Triggering auto-sync...`);
        runSync();
      }, 1000); // 1-second debounce to allow Excel save to complete
    }
  });
}
