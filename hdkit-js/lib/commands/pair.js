const { runDotnet } = require('../runner');
const { parseHdOutput } = require('../parser');
const path = require('path');
const fs = require('fs');

async function runPair(args, options = { json: false }) {
  // args: ['pair', dt1, lat1, lon1, dt2, lat2, lon2] or with 'pair-time'
  const a = args[0] === 'pair' || args[0] === 'pair-time' ? args.slice(1) : args;
  if (a.length < 6) throw new Error('pair requires: <datetime1> <lat1> <lon1> <datetime2|time2> <lat2> <lon2>');

  const candidates = [
    path.resolve(__dirname, '..', '..', 'HDKitSample', 'HDKitSample.csproj'), // relative to hdkit-js/lib
    path.resolve(__dirname, '..', '..', '..', 'HDKitSample', 'HDKitSample.csproj'), // one more up
    path.resolve(process.cwd(), 'HDKitSample', 'HDKitSample.csproj'), // repo root
  ];
  const projectPath = candidates.find(p => fs.existsSync(p)) || candidates[0];

  const cmd = args[0] || 'pair';
  const { stdout } = await runDotnet(projectPath, [cmd, ...a]);

  // Split the output into two person blocks using the header lines written by the C# commands.
  // C# prints: "--- Person 1 ---" and "--- Person 2 ---" (or "--- Person 2 (date implicit) ---").
  const parts = stdout.split(/--- Person \d(?: .*?)? ---/g).map(s => s.trim()).filter(Boolean);
  // The split above will remove the headers; instead find the blocks by searching for header indices.
  const headerRegex = /--- Person \d(?: .*?)? ---/g;
  const headers = [];
  let m;
  while ((m = headerRegex.exec(stdout)) !== null) headers.push({ idx: m.index, text: m[0] });

  const results = [];
  for (let i = 0; i < headers.length; i++) {
    const start = headers[i].idx + headers[i].text.length;
    const end = i + 1 < headers.length ? headers[i + 1].idx : stdout.length;
    const block = stdout.slice(start, end).trim();
    if (block) results.push(parseHdOutput(block));
  }

  // If parser didn't find headers, try fallback: split by two charts sequentially by searching for 'Chart for:' occurrences
  if (results.length === 0) {
    const charts = stdout.split(/Chart for:/).map(s => s.trim()).filter(Boolean);
    for (const c of charts) {
      results.push(parseHdOutput('Chart for:' + c));
    }
  }

  const person1 = results[0] || null;
  const person2 = results[1] || null;

  // Helper to get sets of gates from activation arrays (we only have allActiveGates now)
  const toGateSet = (acts) => new Set((acts || []).map(a => a.gate));
  const p1All = toGateSet(person1 && person1.allActiveGates);
  const p2All = toGateSet(person2 && person2.allActiveGates);

  // Intersection helpers
  const intersection = (a, b) => [...a].filter(x => b.has(x));
  const uniq = (arr) => Array.from(new Set(arr));

  const sharedAll = uniq(intersection(p1All, p2All));

  // Map gate -> description preferentially from person1 then person2
  const gateDescription = (gate) => {
    const g1 = (person1 && person1.allActiveGates || []).find(x => x.gate === gate);
    if (g1 && g1.description) return g1.description;
    const g2 = (person2 && person2.allActiveGates || []).find(x => x.gate === gate);
    return g2 ? g2.description : null;
  };

  const toGateObjects = (arr) => arr.map(g => ({ gate: g, description: gateDescription(g) }));

  const shared = {
    all: toGateObjects(sharedAll),
    count: sharedAll.length
  };

  return { person1, person2, sharedGates: shared };
}

module.exports = { runPair };
