#!/usr/bin/env node
const { main } = require('../lib/cli');
main(process.argv).then(code => process.exit(code));

function parseHdOutput(text) {
  // Normalize line endings
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const out = {};

  const getLine = (prefix) => {
    const re = new RegExp('^' + prefix + '\\s*:(.*)$');
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

  // Helper to extract blocks
  const sectionText = (startHeader, endHeader) => {
    const start = lines.findIndex(l => l.includes(startHeader));
    if (start === -1) return [];
    const end = endHeader ? lines.findIndex((l, i) => i > start && l.includes(endHeader)) : lines.length;
    return lines.slice(start + 1, end);
  };

  const parseActivations = (blockLines) => {
    const acts = [];
    for (let i = 0; i < blockLines.length; i++) {
      const line = blockLines[i];
      // match: planet -> Gate 35 Line 3  (35.3.5.1.3 ...)
      const m = line.match(/^\s*(\S+)\s*->\s*Gate\s+(\d+)\s+Line\s+(\d+)\s+\(([^)]+)\)/);
      if (m) {
        const planet = m[1].trim();
        const gate = parseInt(m[2], 10);
        const lineNo = parseInt(m[3], 10);
        const raw = m[4].trim();
        // next non-empty line may contain Description:
        let desc = null;
        if (i + 1 < blockLines.length) {
          const next = blockLines[i + 1].trim();
          const md = next.match(/^Description:\s*(.*)$/);
          if (md) { desc = md[1].trim(); i += 1; }
        }
        acts.push({ planet, gate, line: lineNo, raw, description: desc });
      }
    }
    return acts;
  };

  const personalityBlock = sectionText('Personality Activations', 'Design Activations');
  out.personalityActivations = parseActivations(personalityBlock);

  const designBlock = sectionText('Design Activations', 'All Active Gates');
  out.designActivations = parseActivations(designBlock);

  // Parse All Active Gates
  const allBlock = sectionText('All Active Gates', null);
  const gates = [];
  for (let i = 0; i < allBlock.length; i++) {
    const l = allBlock[i];
    const mg = l.match(/^\s*Gate\s+(\d+)\s*\(([^)]+)\)/);
    if (mg) {
      const gateNum = parseInt(mg[1], 10);
      let desc = null;
      // description is usually on the next line
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
