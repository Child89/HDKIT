const { spawn } = require('child_process');
const { runDotnet } = require('../runner');
const { parseHdOutput } = require('../parser');
const path = require('path');

async function runSingle(args, options = { json: false }) {
  // args: [ 'single', datetime, lat, lon ] or [datetime, lat, lon]
  // normalize
  const a = args[0] === 'single' ? args.slice(1) : args;
  if (a.length < 3) throw new Error('single requires <datetime> <lat> <lon>');

  // Resolve the HDKitSample project path. Try known locations and pick the one that exists.
  const candidates = [
    path.resolve(__dirname, '..', '..', 'HDKitSample', 'HDKitSample.csproj'), // relative to hdkit-js/lib
    path.resolve(__dirname, '..', '..', '..', 'HDKitSample', 'HDKitSample.csproj'), // one more up
    path.resolve(process.cwd(), 'HDKitSample', 'HDKitSample.csproj'), // repo root
    path.resolve(process.cwd(), 'HDKitSample.csproj')
  ];
  let projectPath = candidates.find(p => require('fs').existsSync(p));
  if (!projectPath) {
    // fallback: use first candidate (will likely fail with clear error)
    projectPath = candidates[0];
  }

  if (!options.json) {
    // stream directly using spawn so user sees live output
    const proc = spawn('dotnet', ['run', '--project', projectPath, '-c', 'Release', '--', 'single', ...a], { stdio: 'inherit' });
    return new Promise((resolve, reject) => {
      proc.on('exit', (code) => {
        if (code === 0) resolve(null);
        else reject(new Error('dotnet exited with code ' + code));
      });
      proc.on('error', reject);
    });
  }

  // json mode: run and parse
  const { stdout } = await runDotnet(projectPath, ['single', ...a]);
  const parsed = parseHdOutput(stdout);
  return parsed;
}

module.exports = { runSingle };
