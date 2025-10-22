const { spawn } = require('child_process');
const { StringDecoder } = require('string_decoder');
const fs = require('fs');
const path = require('path');

function runProcess(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args);
    const decoder = new StringDecoder('utf8');
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (c) => { stdout += decoder.write(c); });
    child.stderr.on('data', (c) => { stderr += decoder.write(c); });
    child.on('error', (err) => reject(err));
    child.on('close', (code) => {
      stdout += decoder.end() || '';
      if (code !== 0) {
        const err = new Error(stderr || (cmd + ' exited with code ' + code));
        err.code = code;
        err.stderr = stderr;
        return reject(err);
      }
      resolve({ stdout, stderr });
    });
  });
}

async function runDotnet(projectPath, args) {
  const projectDir = path.dirname(projectPath);
  const projectName = path.basename(projectPath, path.extname(projectPath));
  const dllPath = path.join(projectDir, 'bin', 'Release', 'net8.0', projectName + '.dll');

  // First try to build the project (explicit project path avoids MSBuild confusion with flags)
  try {
    const buildRes = await runProcess('dotnet', ['build', projectPath, '-c', 'Release']);
  } catch (buildErr) {
    // If build fails, fall back to `dotnet run --project` which internally builds as needed.
    // If build fails, fall back to `dotnet run --project` which internally builds as needed.
    return runProcess('dotnet', ['run', '--project', projectPath, '-c', 'Release', '--', ...args]);
  }

  // If the DLL exists after build, run it directly with `dotnet <dll>` to avoid additional restore/build messages.
  if (fs.existsSync(dllPath)) {
    return runProcess('dotnet', [dllPath, ...args]);
  }

  // Last resort: use `dotnet run` with project flag.
  return runProcess('dotnet', ['run', '--project', projectPath, '-c', 'Release', '--', ...args]);
}

module.exports = { runDotnet };
