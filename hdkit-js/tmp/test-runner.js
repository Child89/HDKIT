const { runDotnet } = require('../lib/runner');
(async () => {
  try {
    const projectPath = require('path').resolve(__dirname, '..', 'HDKitSample', 'HDKitSample.csproj');
    const res = await runDotnet(projectPath, ['single', '1989-06-04T14:10', '46.6581', '16.1610']);
    console.log('stdout length', res.stdout.length);
  } catch (ex) {
    console.error('RUN ERROR', ex.message);
    if (ex.stderr) console.error('STDERR:', ex.stderr);
  }
})();
