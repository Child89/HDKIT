#!/usr/bin/env node
const { runSingle } = require('./lib/commands/single');
const { runPair } = require('./lib/commands/pair');
const { analyzePair, analyzeConnections } = require('./algorithm');


async function main(argv) {
  const start = process.hrtime.bigint(); // 🕒 start timing

  const args = argv.slice(2);
  if (args.length === 0) {
    console.log(JSON.stringify({ error: 'Usage: hdkit single <datetime> <lat> <lon>' }));
    return 1;
  }

  const cmd = args[0];
  // handle flags: --json (default), --save, --out <path>
  const jsonIdx = args.indexOf('--json');
  if (jsonIdx !== -1) args.splice(jsonIdx, 1);
  const saveIdx = args.indexOf('--save');
  const outIdx = args.indexOf('--out');
  const prettyIdx = args.indexOf('--pretty');
  const save = saveIdx !== -1;
  const pretty = prettyIdx !== -1;
  let outPath = null;
  if (outIdx !== -1 && args.length > outIdx + 1) {
    outPath = args[outIdx + 1];
    args.splice(outIdx, 2);
  }
  if (save) args.splice(saveIdx, 1);
  if (pretty) args.splice(prettyIdx, 1);

  try {
    let parsed;
    if (cmd === 'single') {
      parsed = await runSingle(args, { json: true });
    } else if (cmd === 'pair' || cmd === 'pair-time') {
      parsed = await runPair(args, { json: true });

     //  const result = await analyzePair(parsed);
      const result2 = await analyzeConnections(parsed);

      // console.log(JSON.stringify(result, null, 2));
        console.log(JSON.stringify(result2, null, 2));

    } else {
      console.log(JSON.stringify({ error: 'Only `single`, `pair`, and `pair-time` are supported' }));
      return 1;
    }

    // 🕒 calculate elapsed time in seconds
    const end = process.hrtime.bigint();
    const elapsedSec = Number(end - start) / 1e9;
    parsed._meta = { elapsed_seconds: +elapsedSec.toFixed(3) };

    const json = pretty ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed);
    console.log(json);

    if (save || outPath) {
      const fs = require('fs');
      const os = require('os');
      const p = require('path');
      const resultsDir = p.resolve(__dirname, 'results');
      if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fname = outPath ? outPath : p.join(resultsDir, `${timestamp}-${cmd}.json`);
      fs.writeFileSync(fname, json + os.EOL, 'utf8');
      console.log(JSON.stringify({ saved: fname }));
    }

    return 0;
  } catch (ex) {
    const end = process.hrtime.bigint();
    const elapsedSec = Number(end - start) / 1e9;
    const payload = {
      error: ex && ex.message ? ex.message : String(ex),
      elapsed_seconds: +elapsedSec.toFixed(3),
    };
    if (ex && ex.stderr) payload.stderr = ex.stderr;
    console.log(JSON.stringify(payload));
    return 1;
  }
}

function usage() {
  console.log('Usage: hdkit single <datetime> <lat> <lon> [--json]');
}

if (require.main === module) {
  main(process.argv).then(code => process.exit(code));
}

module.exports = { main };