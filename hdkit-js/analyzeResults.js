#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// --- Load JSON helper ---
function loadJSON(filePath) {
  const full = path.resolve(filePath);
  if (!fs.existsSync(full)) {
    console.error(`❌ File not found: ${full}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

// --- Main data processing ---
function findBestMeditativeScores(data, topN = 10, filterMeditate = true) {
  if (!data || !Array.isArray(data.scores)) {
    console.error('❌ Invalid file format. Expected .scores array.');
    process.exit(1);
  }

  let filtered = data.scores;

  // Optional filter for meditate flag
  if (filterMeditate) {
    filtered = filtered.filter(entry => entry.score.meditate === true);
  }

  // Always filter stability 6–8
  filtered = filtered.filter(entry => entry.score.stability >= 6 && entry.score.stability <= 8);

  // Map derived values
  filtered = filtered.map(entry => {
    const avgFirePeace = (entry.score.fire + entry.score.peace) / 2;
    const difference = Math.abs(entry.score.fire - entry.score.peace);
    return {
      date: entry.date,
      fire: entry.score.fire,
      peace: entry.score.peace,
      growth: entry.score.growth,
      stability: entry.score.stability,
      diversity: entry.score.diversity,
      meditate: entry.score.meditate,
      avgFirePeace,
      difference
    };
  });

  // Sort descending by avgFirePeace
  filtered.sort((a, b) => b.avgFirePeace - a.avgFirePeace);

  return filtered.slice(0, topN);
}

// --- Main entry point ---
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node bestMeditative.js <path-to-pair-time.json> [--top N] [--meditate true|false]');
    process.exit(1);
  }

  const filePath = args[0];
  const topNIdx = args.indexOf('--top');
  const meditateIdx = args.indexOf('--meditate');

  const topN = topNIdx !== -1 && args.length > topNIdx + 1 ? parseInt(args[topNIdx + 1]) : 10;
  const filterMeditate =
    meditateIdx !== -1 && args.length > meditateIdx + 1
      ? args[meditateIdx + 1].toLowerCase() === 'true'
      : true; // default true

  const data = loadJSON(filePath);
  const bestScores = findBestMeditativeScores(data, topN, filterMeditate);

  // --- Prepare output ---
  let output = `🧘‍♂️ Top ${bestScores.length} ${
    filterMeditate ? 'meditative' : 'all'
  } days (stability 6–8, highest (fire+peace)/2):\n\n`;

  bestScores.forEach((entry, i) => {
    output +=
      `${String(i + 1).padStart(2, '0')}. ${entry.date}` +
      ` | meditate=${entry.meditate}` +
      ` | fire=${entry.fire}` +
      ` | peace=${entry.peace}` +
      ` | stability=${entry.stability}` +
      ` | growth=${Number(entry.growth).toFixed(2)}` +
      ` | avgFirePeace=${entry.avgFirePeace.toFixed(2)}\n`;
  });

  console.log('\n' + output);

  // --- Save to results/ folder ---
  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // ✅ One clean timestamp: YYYY-MM-DD_HH-MM
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;

  // ✅ Clean base name
  let baseName = path.basename(filePath, path.extname(filePath));
  baseName = baseName.replace(/^bestMeditative[_-]?/i, '');

  const mode = filterMeditate ? 'meditativeOnly' : 'all';

  // ✅ Only one datetime per file name
  //const outputFile = path.join(resultsDir, `${baseName}_${mode}_${timestamp}.txt`);
  const outputFile = path.join(resultsDir, `${baseName}_${mode}.txt`);

  fs.writeFileSync(outputFile, output, 'utf8');
  console.log(`✅ Results saved to: ${outputFile}\n`);
}

main();
