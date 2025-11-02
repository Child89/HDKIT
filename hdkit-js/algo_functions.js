
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

  // Helper: get both direct + reverse linked gates
  function getLinkedGatesBothDirections(gate) {
    const direct = gateConnections[gate] || [];
    const reverse = Object.entries(gateConnections)
      .filter(([_, links]) => links.includes(gate))
      .map(([g]) => Number(g));
    return Array.from(new Set([...direct, ...reverse]));
  }

/**
 * Find unique fire gates that only Person A has with Person B —
 * meaning A’s gate connects to B’s gate, but that connection
 * does not already exist within A’s own gates.
 *
 * @param {number[]} gatesA - Gates for Person A
 * @param {number[]} gatesB - Gates for Person B
 * @returns {Array<{ gateA: number, gateB: number, pair: string }>}
 */
function getUniqFireGates1(gatesA, gatesB) {
  const matchedPairs = [];
  const seenPairs = new Set();

  // 1️⃣ Determine Person A’s internal connections
  const internalA = new Set();
  for (const g of gatesA) {
    //const linked = gateConnections[g] || [];
    const linked = getLinkedGatesBothDirections(g);

    for (const linkedGate of linked) {
      if (gatesA.includes(linkedGate)) {
        const pair = [g, linkedGate].sort((a, b) => a - b).join("-");
        internalA.add(pair);
      }
    }
  }

  // 2️⃣ Check only cross-person connections (A→B) not already internal to A
  for (const gateA of gatesA) {
    //const linkedGates = gateConnections[gateA] || [];
    const linkedGates = getLinkedGatesBothDirections(gateA);

    for (const gateB of linkedGates) {
      if (gatesB.includes(gateB)) {
        const pair = [gateA, gateB].sort((a, b) => a - b).join("-");
        if (!internalA.has(pair) && !seenPairs.has(pair)) {
          seenPairs.add(pair);
          matchedPairs.push({ gateA, gateB, pair });
        }
      }
    }
  }

  return matchedPairs;
}
/**
 * Find unique "fire" gates — where one person's gate connects to another's
 * using the Human Design channel map.
 * 
 * @param {number[]} gatesA - Gates for person A
 * @param {number[]} gatesB - Gates for person B
 * @returns {Array<{ gateA: number, gateB: number, pair: string }>}
 */

function getUniqFireGates2(gatesA, gatesB) {
  const matchedPairs = [];
  const seenPairs = new Set();

  for (const gateA of gatesA) {
    //const linkedGates = gateConnections[gateA] || [];
    const linkedGates = getLinkedGatesBothDirections(gateA);

    //const linked = getLinkedGatesBothDirections(gateA);
    for (const gateB of linkedGates) {
      if (gatesB.includes(gateB)) {
        const pair = [gateA, gateB].sort((a, b) => a - b).join("-");
        if (!seenPairs.has(pair)) {
          seenPairs.add(pair);
          matchedPairs.push({ gateA, gateB, pair });
        }
      }
    }
  }

  return matchedPairs;
}

function getEqualIsolatedGates(gatesA, gatesB) {
  const equalIsolated = [];

  for (const gate of gatesA) {
    // Must be in both A and B
    if (!gatesB.includes(gate)) continue;

    //const linked = gateConnections[gate] || [];
    const linked = getLinkedGatesBothDirections(gate);

    // Skip if *either side* has the linked gate (means it’s part of a full channel)
    const hasLinked =
      linked.some(linkedGate => gatesA.includes(linkedGate) || gatesB.includes(linkedGate));

    if (!hasLinked) {
      equalIsolated.push(gate);
    }
  }

  return {
    count: equalIsolated.length,
    gates: equalIsolated
  };
}

function getFullyIsolatedGates(gatesA, gatesB) {
  const allGates = Array.from(new Set([...gatesA, ...gatesB]));
  const isolated = [];

for (const gate of gatesA) {
    // 1️⃣ Skip if this gate also exists in person B
    if (gatesB.includes(gate)) continue;

    // 2️⃣ Get all possible linked gates (both directions)
    const linkedGates = getLinkedGatesBothDirections(gate);

    // 3️⃣ Skip if any of those linked gates appear in A or B
    const hasLinked = linkedGates.some(g => allGates.includes(g));
    if (hasLinked) continue;

    // ✅ Gate is fully isolated
    isolated.push(gate);
  }

  return {
    count: isolated.length,
    gates: isolated
  };
}

function getFullyConnectedExclusiveGates(gatesA, gatesB) {
  const exclusive = [];
  const seen = new Set();

  for (const gate of gatesA) {
    // Skip if B already has this gate
    if (gatesB.includes(gate)) continue;

    const linkedGates = getLinkedGatesBothDirections(gate);

    // Check if gate is part of an internal A connection
    const hasInternalConnection = linkedGates.some(lg => gatesA.includes(lg));

    // Skip if there is no full connection inside A
    if (!hasInternalConnection) continue;

    // Skip if any linked gate is present in B
    const connectedToB = linkedGates.some(lg => gatesB.includes(lg));
    if (connectedToB) continue;

    // Add both sides of the connection once (avoid duplicates)
    for (const lg of linkedGates) {
      if (gatesA.includes(lg) && !gatesB.includes(lg)) {
        const pair = [gate, lg].sort((a, b) => a - b).join("-");
        if (!seen.has(pair)) {
          seen.add(pair);
          exclusive.push({ gateA: gate, linkedGate: lg, pair });
        }
      }
    }
  }

  return {
    count: exclusive.length,
    pairs: exclusive
  };
}


module.exports = { gateConnections, centerGates, getUniqFireGates1, 
    getUniqFireGates2, getEqualIsolatedGates, getFullyIsolatedGates, getFullyConnectedExclusiveGates};