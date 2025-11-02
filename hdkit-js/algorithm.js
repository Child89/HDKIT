const { gateConnections, centerGates, getUniqFireGates1, getUniqFireGates2, getEqualIsolatedGates, getFullyIsolatedGates } = require('./algo_functions');


function getEqualGates(gatesA, gatesB) {
  const setB = new Set(gatesB);
  return gatesA.filter(g => setB.has(g));
}


 


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


async function analyzeConnections(pairData) {
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

  // 🔹 Count how many gates of person1 connect to person2’s gates and vice versa
function countCrossGateConnections(gatesA, gatesB) {
  const matchedPairs = [];

  // Compute internal connections for A and B
  const internalA = new Set();
  const internalB = new Set();

  for (const g of gatesA) {
    const links = gateConnections[g] || [];
    for (const linkedGate of links) {
      if (gatesA.includes(linkedGate)) {
        internalA.add([g, linkedGate].sort((a, b) => a - b).join("-"));
      }
    }
  }

  for (const g of gatesB) {
    const links = gateConnections[g] || [];
    for (const linkedGate of links) {
      if (gatesB.includes(linkedGate)) {
        internalB.add([g, linkedGate].sort((a, b) => a - b).join("-"));
      }
    }
  }

  // Now check cross-person connections
  for (const gateA of gatesA) {
    const linkedGates = gateConnections[gateA] || [];

    // Skip gateA if it is part of an internal connection
    const gateAInternal = Array.from(internalA).some(pair => pair.split("-").includes(String(gateA)));
    if (gateAInternal) continue;

    for (const linkedGate of linkedGates) {
      // Skip linkedGate if it is part of an internal connection in person B
      const gateBInternal = Array.from(internalB).some(pair => pair.split("-").includes(String(linkedGate)));
      if (gateBInternal) continue;

      if (gatesB.includes(linkedGate)) {
        const pairKey = [gateA, linkedGate].sort((a, b) => a - b).join("-");
        if (!matchedPairs.some(p => p.pair === pairKey)) {
          matchedPairs.push({
            pair: pairKey,
            gateA,
            gateB: linkedGate
          });
        }
      }
    }
  }

  return {
    count: matchedPairs.length,
    pairs: matchedPairs
  };
}

function countCrossGateConnectionsBFree(gatesA, gatesB) {
  const matchedPairs = [];

  // Step 1: Detect internal connections in B
  const internalB = new Set();
  for (const g of gatesB) {
    const links = gateConnections[g] || [];
    for (const linkedGate of links) {
      if (gatesB.includes(linkedGate)) {
        internalB.add([g, linkedGate].sort((a, b) => a - b).join("-"));
      }
    }
  }

  // Step 2: Identify which gates in B are already internally connected
  const busyGatesB = new Set();
  for (const pair of internalB) {
    const [g1, g2] = pair.split("-").map(Number);
    busyGatesB.add(g1);
    busyGatesB.add(g2);
  }

  // Step 3: Iterate through A’s gates and check cross-connections
  for (const gateA of gatesA) {
    const linkedGates = gateConnections[gateA] || [];

    for (const linkedGate of linkedGates) {
      // Skip if linkedGate in B is already internally connected
      if (!gatesB.includes(linkedGate) || busyGatesB.has(linkedGate)) continue;

      const pairKey = [gateA, linkedGate].sort((a, b) => a - b).join("-");
      if (!matchedPairs.some(p => p.pair === pairKey)) {
        matchedPairs.push({
          pair: pairKey,
          gateA,
          gateB: linkedGate
        });
      }
    }
  }

  return {
    count: matchedPairs.length,
    pairs: matchedPairs
  };
}

  // Individual and shared connections
  const person1Connections = findInternalConnections(gates1);
  const person2Connections = findInternalConnections(gates2);
  const betweenConnections = findInterConnections(gates1, gates2);
  const equalConnections = person1Connections.filter(c => person2Connections.includes(c));

  // 🔹 Cross-person gate link counting
  const p1ToP2 = countCrossGateConnections(gates1, gates2);
  const p2ToP1 = countCrossGateConnections(gates2, gates1);
  
  const p1ToP2_free = countCrossGateConnectionsBFree(gates2, gates1); //torder of args is corrected in replaced order
  const p2ToP1_free = countCrossGateConnectionsBFree(gates1, gates2);

  const person1Centers = analyzeCenters(gates1);
  const person2Centers = analyzeCenters(gates2);
  const allGates = Array.from(new Set([...gates1, ...gates2]));
  const mergedCenters = analyzeCenters(allGates);



  //todo: from gates 1 seach if match has gates 2 so
  const sharedGates = getEqualGates(gates1, gates2); //
    const uniqueFireGates1p1= getUniqFireGates1(gates1, gates2); //
    const uniqueFireGates1p2= getUniqFireGates1( gates2,gates1); //

    const uniqueFireGates2 = getUniqFireGates2(gates1, gates2); //
    
    const uniqueEqualGates = getEqualIsolatedGates(gates1, gates2); //
    const uniqueGates1p1 = getFullyIsolatedGates(gates1, gates2); //
    const uniqueGates1p2 = getFullyIsolatedGates(gates2, gates1); //

 
  return {
    sharedGates:sharedGates,
    uniqueFireGates1p1:uniqueFireGates1p1,
    uniqueFireGates1p2:uniqueFireGates1p2,
    uniqueEqualGates:uniqueEqualGates,
    uniqueGates1p1:uniqueGates1p1,
    uniqueGates1p2:uniqueGates1p2

   // mergedCenters:mergedCenters,
    /*person1Connections,
    person2Connections,
    betweenConnections,
    equalConnections,
    person1Centers,
    person2Centers,
    mergedCenters,
    crossConnections: {
      totalSharedGates:sharedGates.length,
      person1ToPerson2: p1ToP2,
      person2ToPerson1: p2ToP1,
      person1ToPerson2_free: p1ToP2_free,
      person2ToPerson1_free: p2ToP1_free,
      totalCrossConnections: p1ToP2.count + p2ToP1.count,
      uniqueCrossPairs: Array.from(new Set([...p1ToP2.pairs, ...p2ToP1.pairs]))
    },
    summary: {
      person1ConnectedChannels: person1Connections.length,
      person2ConnectedChannels: person2Connections.length,
      betweenConnectedChannels: betweenConnections.length,
      equalConnectedChannels: equalConnections.length,
      crossConnections: p1ToP2.count + p2ToP1.count
    }*/
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