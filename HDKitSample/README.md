# HDKitSample

Simple CLI wrapper around SharpAstrology.HumanDesign for computing Human Design gates.

Usage examples (from repository root):

- Build the projects (one-time):

  cd /home/buddha/Documents/HDKIT/SharpAstrology.HumanDesign && dotnet restore && dotnet build -c Release
  cd /home/buddha/Documents/HDKIT/HDKitSample && dotnet add reference ../SharpAstrology.HumanDesign/SharpAstrology.HumanDesign.csproj
  dotnet add package SharpAstrology.SwissEph && dotnet restore && dotnet build -c Release

- Single person (C#):

  dotnet run --project /home/buddha/Documents/HDKIT/HDKitSample/HDKitSample.csproj -c Release -- single "1989-06-04T14:10" 46.6581 16.1610

- Pair (two full profiles, C#):

  dotnet run --project /home/buddha/Documents/HDKIT/HDKitSample/HDKitSample.csproj -c Release -- pair "1989-06-04T14:10" 46.6581 16.1610 "1988-06-04T14:10" 46.6581 16.1610

- Pair-time (second person only supplies time, date inferred from first person, C#):

  dotnet run --project /home/buddha/Documents/HDKIT/HDKitSample/HDKitSample.csproj -c Release -- pair-time "1989-06-04T14:10" 46.6581 16.1610 T14:10 46.6581 16.1610

Node wrapper (JSON output):

The Node wrapper (`hdkit-js/hdkit.js`) provides JSON output suitable for programmatic use.

Examples:

  node /home/buddha/Documents/HDKIT/hdkit-js/hdkit.js single "1989-06-04T14:10" 46.6581 16.1610
  node /home/buddha/Documents/HDKIT/hdkit-js/hdkit.js pair "1989-06-04T14:10" 46.6581 16.1610 "1988-06-04T14:10" 46.6581 16.1610

Notes:
- The program uses a simple longitude -> timezone heuristic (offset ≈ round(longitude / 15)) when coordinates are provided. This is offline and fast but may be imprecise for DST or political timezone boundaries.
- Matching calculations for pairs are implemented in the Node wrapper by intersecting the active gates from both charts (sharedGates). If you want richer matching metrics (e.g., personality vs design intersection, counts, descriptions), tell me and I can add them.