// Parser for HDKit .NET CLI output

function parseHdOutput(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const out = {};

  const getLine = (prefix) => {
    const re = new RegExp('^' + prefix + "\\s*:(.*)$");
    for (const l of lines) {
      const m = l.match(re);
      if (m) return m[1].trim();
    }
    return null;
  };

  out.type = getLine('Type');
  out.profile = getLine('Profile');
  out.strategy = getLine('Strategy');
  out.incarnationCross = getLine('Incarnation Cross');

  const sectionText = (startHeader, endHeader) => {
    const start = lines.findIndex(l => l.includes(startHeader));
    if (start === -1) return [];
    const end = endHeader ? lines.findIndex((l, i) => i > start && l.includes(endHeader)) : lines.length;
    return lines.slice(start + 1, end);
  };

  // Personality and Design activation blocks are no longer printed by the C# CLI.

  const allBlock = sectionText('All Active Gates', null);
  const gates = [];
  for (let i = 0; i < allBlock.length; i++) {
    const l = allBlock[i];
    const mg = l.match(/^\s*Gate\s+(\d+)\s*\(([^)]+)\)/);
    if (mg) {
      const gateNum = parseInt(mg[1], 10);
      let desc = null;
      if (i + 1 < allBlock.length) {
        const next = allBlock[i + 1].trim();
        const md = next.match(/^(.+)$/);
        if (md) { desc = md[1].trim(); i += 1; }
      }
      gates.push({ gate: gateNum, description: desc });
    }
  }
  out.allActiveGates = gates;

  return out;
}

module.exports = { parseHdOutput };
