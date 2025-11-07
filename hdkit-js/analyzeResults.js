#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function loadJSON(filePath) {
  const full = path.resolve(filePath);
  if (!fs.existsSync(full)) {
    console.error(`❌ File not found: ${full}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function findBestMeditativeScores(data, topN = 10) {
  if (!data || !Array.isArray(data.scores)) {
    console.error('❌ Invalid file format. Expected .scores array.');
    process.exit(1);
  }

  // Filter: meditate true and stability between 6 and 8
  const filtered = data.scores
    .filter(entry => entry.score.meditate === true)
    .filter(entry => entry.score.stability >= 6 && entry.score.stability <= 8)
    .map(entry => {
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
  //filtered.sort((a, b) => b.fire - a.fire);

  return filtered.slice(0, topN);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node bestMeditative.js <path-to-pair-time.json> [--top N]');
    process.exit(1);
  }

  const filePath = args[0];
  const topNIdx = args.indexOf('--top');
  const topN = topNIdx !== -1 && args.length > topNIdx + 1 ? parseInt(args[topNIdx + 1]) : 10;

  const data = loadJSON(filePath);
  const bestScores = findBestMeditativeScores(data, topN);

  // --- Prepare output ---
  let output = `🧘‍♂️ Top ${bestScores.length} meditative days (stability 6–8, highest (fire+peace)/2):\n\n`;
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

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(resultsDir, `bestMeditative_${timestamp}.txt`);

  fs.writeFileSync(outputFile, output, 'utf8');
  console.log(`✅ Results saved to: ${outputFile}\n`);
}

main();
