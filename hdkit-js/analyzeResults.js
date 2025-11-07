#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * 🧘 CONFIGURATION (edit this section)
 * You can still tweak filters, sorting, etc.
 */
const config = {
  filter: {
    meditate: false,   // Only include meditate == true entries
    stabilityMin: 5,   // Minimum stability
    stabilityMax: 8,   // Maximum stability
    fireMin: 2,     // Minimum fire value (null = disabled)
    peaceMin: 3,    // Minimum peace value (null = disabled)
    growthMin: null    // Minimum growth (null = disabled)
  },

  sort: {
    field: 'avgFirePeace',     // Sort by: 'fire', 'peace', or 'avgFirePeace'
    order: 'desc'      // 'desc' or 'asc'
  },

  topN: 3000           // Number of top results to show
};

/**
 * --- Load JSON helper ---
 */
function loadJSON(filePath) {
  const full = path.resolve(filePath);
  if (!fs.existsSync(full)) {
    console.error(`❌ File not found: ${full}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

/**
 * --- Core processing ---
 */
function findBestScores(data, cfg) {
  if (!data || !Array.isArray(data.scores)) {
    console.error('❌ Invalid file format. Expected .scores array.');
    process.exit(1);
  }

  let filtered = data.scores;

  // --- Filtering ---
  if (cfg.filter.meditate) {
    filtered = filtered.filter(entry => entry.score.meditate === true);
  }

  filtered = filtered.filter(entry =>
    entry.score.stability >= cfg.filter.stabilityMin &&
    entry.score.stability <= cfg.filter.stabilityMax
  );

  if (cfg.filter.fireMin !== null) {
    filtered = filtered.filter(entry => entry.score.fire >= cfg.filter.fireMin);
  }
  if (cfg.filter.peaceMin !== null) {
    filtered = filtered.filter(entry => entry.score.peace >= cfg.filter.peaceMin);
  }
  if (cfg.filter.growthMin !== null) {
    filtered = filtered.filter(entry => entry.score.growth >= cfg.filter.growthMin);
  }

  // --- Derived values ---
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

  // --- Sorting ---
  const validSorts = ['fire', 'peace', 'avgFirePeace'];
  let field = cfg.sort.field;
  if (!validSorts.includes(field)) {
    console.warn(`⚠️ Invalid sort field "${field}", defaulting to avgFirePeace`);
    field = 'avgFirePeace';
  }

  filtered.sort((a, b) =>
    cfg.sort.order === 'asc' ? a[field] - b[field] : b[field] - a[field]
  );

  return filtered.slice(0, cfg.topN);
}

/**
 * --- Main ---
 */
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node bestMeditative.js <path-to-pair-time.json>');
    process.exit(1);
  }

  const inputFile = args[0];
  const data = loadJSON(inputFile);
  const bestScores = findBestScores(data, config);

  // --- Prepare output ---
  let output = `🧘‍♂️ Top ${bestScores.length} ${
    config.filter.meditate ? 'meditative' : 'all'
  } days (stability ${config.filter.stabilityMin}-${config.filter.stabilityMax}, sorted by ${config.sort.field} ${config.sort.order}):\n\n`;

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

  //console.log('\n' + output);

  // --- Save to results/ folder ---
  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;

  const baseName = path.basename(inputFile, path.extname(inputFile));
  const mode = config.filter.meditate ? 'meditativeOnly' : 'all';
  const outputFile = path.join(resultsDir, `${baseName}_${mode}_${config.sort.field}_${timestamp}.txt`);

  fs.writeFileSync(outputFile, output, 'utf8');
  console.log(`✅ Results saved to: ${outputFile}\n`);
}

main();
