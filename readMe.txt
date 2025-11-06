go to HDKITSAMPLE
cd /home/buddha/Documents/HDKIT/SharpAstrology.HumanDesign && dotnet restore && dotnet build -c Release
cd /home/buddha/Documents/HDKIT/HDKitSample && dotnet add reference ../SharpAstrology.HumanDesign/SharpAstrology.HumanDesign.csproj
dotnet add package SharpAstrology.SwissEph && dotnet restore && dotnet run --project . -c Release
dotnet build -c Release --no-restore
dotnet run --project . -c Release


##HISTORY STEP BY STEP

  168  git clone https://github.com/CReizner/SharpAstrology.HumanDesign /home/buddha/Documents/HDKIT/SharpAstrology.HumanDesign
  169  ls -la /home/buddha/Documents/HDKIT/SharpAstrology.HumanDesign
  170  dotnet --info
  171  cd /home/buddha/Documents/HDKIT/SharpAstrology.HumanDesign && dotnet restore && dotnet build -c Release
  172  cd /home/buddha/Documents/HDKIT && dotnet new console -n HDKitSample -f net8.0 --output HDKitSample --language C# --no-restore
  173* cd /home/buddha/Documents/HDKIT/HDKitSample && dotnet add reference ../SharpAstrology.HumanDesign/SharpAstrology.HumanDesign.csproj
  174  dotnet restore && dotnet run --project . -c Release
  175  dotnet add package SharpAstrology.SwissEph && dotnet restore && dotnet run --project . -c Release
  176  dotnet run --project . -c Release
  177  dotnet build -c Release --no-restore
  178  dotnet run --project . -c Release

dotnet run --project . -c Release -- "1988-09-04T01:15" 52.52 13.405

dotnet run --project . -c Release -- "1989-06-04T14:10" 46.6581 16.1610

# Build and run

From the repository root do the following once to prepare the C# library and sample:

1. Build the library and sample (one-time):

  cd /home/buddha/Documents/HDKIT/SharpAstrology.HumanDesign && dotnet restore && dotnet build -c Release
  cd /home/buddha/Documents/HDKIT/HDKitSample && dotnet add reference ../SharpAstrology.HumanDesign/SharpAstrology.HumanDesign.csproj
  dotnet add package SharpAstrology.SwissEph && dotnet restore && dotnet build -c Release

2. Run the C# sample directly (example):

  dotnet run --project /home/buddha/Documents/HDKIT/HDKitSample/HDKitSample.csproj -c Release -- single "1989-06-04T14:10" 46.6581 16.1610

3. Or use the Node wrapper (recommended for JSON output):

  node /home/buddha/Documents/HDKIT/hdkit-js/hdkit.js single "1989-06-04T14:10" 46.6581 16.1610

  node /home/buddha/Documents/HDKIT/hdkit-js/hdkit.js pair "1989-06-04T14:10" 46.6581 16.1610 "1988-06-04T14:10" 46.6581 16.1610

Notes:
- The Node wrapper returns a JSON object (useful for programmatic consumption). The C# CLI prints a human-readable chart.
- The project uses a simple longitude -> timezone heuristic (offset ≈ round(longitude / 15)) when coordinates are provided; this is offline and fast but may be imprecise for DST or political timezone boundaries.

node /home/buddha/Documents/HDKIT/hdkit-js/lib/cli.js single "1989-06-04T14:10" 46.6581 16.1610
dotnet run --project /home/buddha/Documents/HDKIT/HDKitSample/HDKitSample.csproj -c Release -- single "1989-06-04T14:10" 46.6581 16.1610

 node /home/buddha/Documents/HDKIT/hdkit-js/hdkit.js single "1989-06-04T14:10" 46.6581 16.1610 --save --pretty
 node /home/buddha/Documents/HDKIT/hdkit-js/hdkit.js pair "1989-06-04T14:10" 46.6581 16.1610 "1988-06-04T14:10" 46.6581 16.1610 --save --pretty

 node /home/buddha/Documents/HDKIT/hdkit-js/hdkit.js pair "1989-06-04T14:10" 46.6581 16.1610 "1993-04-25T13:10" 46.1400 14.2200 --save --pretty

 node /home/buddha/Documents/HDKIT/hdkit-js/hdkit.js pair "1989-06-04T14:10" 46.6581 16.1610 "1993-04-25T13:10" 46.1400 14.2200

 node /home/buddha/Documents/HDKIT/hdkit-js/hdkit.js pair "1993-07-04T14:10" 46.1400 14.2200 "1993-04-25T13:10" 46.1400 14.2200 --save --pretty

 node /home/buddha/Documents/HDKIT/hdkit-js/hdkit.js pair "1989-06-04T14:10" 46.6581 16.1610 "1993-04-25T13:10" 46.1400 14.2200 --save --pretty

 node /home/buddha/Documents/HDKIT/hdkit-js/hdkit.js pair-time "1989-06-04T14:10" 46.6581 16.1610 1993 46.1400 14.2200 --save --pretty


 node /home/buddha/Documents/HDKIT/hdkit-js/analyzeResults.js ./results/2025-11-04T23-09-51-673Z-pair-time.json --top 50
