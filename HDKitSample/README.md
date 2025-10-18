# HDKitSample

Simple CLI wrapper around SharpAstrology.HumanDesign for computing Human Design gates.

Usage examples:

- Single person:

  dotnet run --project HDKitSample -c Release -- single "1989-06-04T14:10" 46.6581 16.1610

- Pair (two full profiles):

  dotnet run --project HDKitSample -c Release -- pair "1989-06-04T14:10" 46.6581 16.1610 "1988-06-04T14:10" 46.6581 16.1610

- Pair-time (second person only supplies time, date inferred from first person):

  dotnet run --project HDKitSample -c Release -- pair-time "1989-06-04T14:10" 46.6581 16.1610 T14:10 46.6581 16.1610

Notes:
- The program currently uses a simple offline heuristic to convert local time to UTC when coordinates are provided: it approximates timezone offset as round(longitude / 15). This is fast and offline but can be inaccurate (it ignores political boundaries and DST).
- Matching calculations for pairs are TODO; currently the pair commands print both persons' charts sequentially. You said you'd provide the specific matching logic in a follow-up.


dotnet run --project /home/buddha/Documents/HDKIT/HDKitSample/HDKitSample.csproj -c Release -- single "1989-06-04T14:10" 46.6581 16.1610