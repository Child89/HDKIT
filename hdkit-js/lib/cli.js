#!/usr/bin/env node
const { runSingle } = require('./commands/single');

async function main(argv) {
  const args = argv.slice(2);
  if (args.length === 0) {
    // return error as JSON
    console.log(JSON.stringify({ error: 'Usage: hdkit single <datetime> <lat> <lon>' }));
    return 1;
  }
  const cmd = args[0];
  // make JSON the default and remove any explicit flag
  const jsonIdx = args.indexOf('--json');
  if (jsonIdx !== -1) args.splice(jsonIdx, 1);

  try {
    if (cmd === 'single') {
      const parsed = await runSingle(args, { json: true });
      // Always print a single JSON object (stringified)
      console.log(JSON.stringify(parsed));
      return 0;
    }
    console.log(JSON.stringify({ error: 'Only `single` is supported' }));
    return 1;
  } catch (ex) {
    // Return error as JSON (include stderr if available for debugging)
    const payload = { error: ex && ex.message ? ex.message : String(ex) };
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
