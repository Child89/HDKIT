
const gateConnections = {
  1: [8],
  2: [14],
  3: [60],
  4: [63],
  5: [15],
  6: [59],
  7: [31],
  9: [52],
  10: [20, 34, 57],
  11: [56],
  12: [22],
  13: [33],
  14: [2],
  15: [5],
  16: [48],
  17: [62],
  18: [58],
  19: [49],
  20: [10, 34, 57],
  21: [45],
  22: [12],
  23: [43],
  24: [61],
  25: [51],
  26: [44],
  27: [50],
  28: [38],
  29: [46],
  30: [41],
  31: [7],
  32: [54],
  33: [13],
  34: [10, 20, 57],
  35: [36],
  36: [35],
  37: [40],
  38: [28],
  39: [55],
  40: [37],
  41: [30],
  42: [53],
  43: [23],
  44: [26],
  45: [21],
  46: [29],
  47: [64],
  48: [16],
  49: [19],
  50: [27],
  51: [25],
  52: [9],
  53: [42],
  54: [32],
  55: [39],
  56: [11],
  57: [10, 20, 34],
  58: [18],
  59: [6],
  60: [3],
  61: [24],
  62: [17],
  63: [4],
  64: [47]
};

const centerGates = {
  head:        [61, 63, 64],
  ajna:        [11, 17, 24, 43, 47],
  throat:      [8, 12, 16, 20, 23, 31, 33, 35, 45, 56],
  g:           [1, 2, 7, 10, 13, 15, 25, 46],
  ego:         [21, 26, 40, 51],
  solarPlexus: [6, 22, 30, 36, 37, 49, 55],
  spleen:      [18, 28, 32, 44, 48, 50, 57],
  sacral:      [3, 5, 9, 14, 27, 29, 34, 42, 59],
  root:        [19, 39, 41, 52, 53, 54, 58, 60]
};

function getCenterForGate(gate) {
  const gateNum = Number(gate);
  for (const [center, gates] of Object.entries(centerGates)) {
    if (gates.includes(gateNum)) return center;
  }
  // Warn if missing (you can disable this later)
  console.warn(`⚠️ Gate ${gate} not found in centerGates`);
  return null;
}

function analyzeCenters(gates) {
  const centerLinks = {};

  // Initialize connection map between centers
  for (const center of Object.keys(centerGates)) {
    centerLinks[center] = new Set();
  }

  for (const g of gates) {
    const sourceCenter = getCenterForGate(g);
    if (!sourceCenter) continue; // 🧱 skip invalid gate

    const links = gateConnections[g] || [];
    for (const linkGate of links) {
      if (!gates.includes(linkGate)) continue;

      const targetCenter = getCenterForGate(linkGate);
      if (!targetCenter || sourceCenter === targetCenter) continue;

      // ✅ Now safe to add
      centerLinks[sourceCenter].add(targetCenter);
      centerLinks[targetCenter].add(sourceCenter);
    }
  }

  // Convert all Sets to Arrays
  const centerLinksObj = Object.fromEntries(
    Object.entries(centerLinks).map(([k, v]) => [k, Array.from(v)])
  );

  // Centers that have at least one connection
  const activeCenters = Object.entries(centerLinksObj)
    .filter(([_, arr]) => arr.length > 0)
    .map(([center]) => center);

  // Count active centers
  const centerLinksActiveCount = activeCenters.length;

  return {
    centerLinks: centerLinksObj,
    centerLinksActiveCount,
    activeCenters
  };
}


async function analyzeConnections(pairData) 
{
  const { person1, person2 } = pairData;

  const gates1 = person1.allActiveGates.map(g => g.gate);
  const gates2 = person2.allActiveGates.map(g => g.gate);

  function findInternalConnections(gates) {
    const connected = [];
    for (const g of gates) {
      const links = gateConnections[g] || [];
      for (const link of links) {
        if (gates.includes(link)) {
          const pair = [g, link].sort((a, b) => a - b).join("-");
          if (!connected.includes(pair)) connected.push(pair);
        }
      }
    }
    return connected;
  }

  function findInterConnections(gatesA, gatesB) {
    const connections = [];
    for (const g of gatesA) {
      const links = gateConnections[g] || [];
      for (const link of links) {
        if (gatesB.includes(link)) {
          const pair = [g, link].sort((a, b) => a - b).join("-");
          if (!connections.includes(pair)) connections.push(pair);
        }
      }
    }
    return connections;
  }

  const person1Connections = findInternalConnections(gates1);
  const person2Connections = findInternalConnections(gates2);
  const betweenConnections = findInterConnections(gates1, gates2);

  // 🔹 New: Equal connections (same full channel in both people)
  const equalConnections = person1Connections.filter(c => person2Connections.includes(c));

  const person1Centers = analyzeCenters(gates1);
  const person2Centers = analyzeCenters(gates2);
  const allGates = Array.from(new Set([...gates1, ...gates2]));
  const mergedCenters = analyzeCenters(allGates);
 
  return {
    person1Connections,
    person2Connections,
    betweenConnections,
    equalConnections,
    person1Centers:person1Centers,
    person2Centers:person2Centers,
    mergedCenters:mergedCenters,
    summary: {
      person1ConnectedChannels: person1Connections.length,
      person2ConnectedChannels: person2Connections.length,
      betweenConnectedChannels: betweenConnections.length,
      equalConnectedChannels: equalConnections.length
    }
  };
}

async function analyzePair(pairData) 
{
  const { person1, person2, sharedGates } = pairData;

  if (!person1 || !person2 || !sharedGates) {
    throw new Error("Invalid pair data structure: must contain person1, person2, and sharedGates");
  }

  // Extract gate numbers
  const p1Gates = person1.allActiveGates.map(g => g.gate);
  const p2Gates = person2.allActiveGates.map(g => g.gate);
  const shared = sharedGates.all.map(g => g.gate);

  // Basic counts
  const total1 = p1Gates.length;
  const total2 = p2Gates.length;
  const sharedCount = shared.length;

  // Unique gate counts
  const unique1 = p1Gates.filter(g => !shared.includes(g));
  const unique2 = p2Gates.filter(g => !shared.includes(g));

  // Overlap ratios
  const overlapRatio1 = sharedCount / total1;
  const overlapRatio2 = sharedCount / total2;
  const avgOverlap = (overlapRatio1 + overlapRatio2) / 2;

  // Simple similarity score (0–100)
  const similarityScore = Math.round(avgOverlap * 100);

  return {
    stats: 
    {
        totalGates1: total1,
        totalGates2: total2,
        sharedCount,
        uniqueToPerson1: unique1.length,
        uniqueToPerson2: unique2.length,
        overlapRatio1: + overlapRatio1.toFixed(3),
        overlapRatio2: + overlapRatio2.toFixed(3),
        similarityScore,
        },
            uniqueGates: {
            person1: unique1,
            person2: unique2,
        }
    }
}

module.exports = { analyzePair, analyzeConnections };