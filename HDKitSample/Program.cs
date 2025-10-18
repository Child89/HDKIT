using System;
using SharpAstrology.DataModels;
using SharpAstrology.Ephemerides;
using SharpAstrology.Interfaces;
using SharpAstrology.Enums;

// Minimal sample that creates a HumanDesignChart for a given UTC date
// and prints a few properties. Uses the built-in Moshier ephemeris implementation
// (EphType.Moshier) which does not require external ephemeris files.

// Usage:
// dotnet run --project . -c Release -- "2024-01-01T12:00" 52.52 13.405
// (datetime in local time for the provided coordinates)

string? dateArg = args.Length > 0 ? args[0] : null;
string? latArg = args.Length > 1 ? args[1] : null;
string? lonArg = args.Length > 2 ? args[2] : null;

if (string.IsNullOrWhiteSpace(dateArg))
{
	Console.Write("Enter local datetime (e.g. 1988-09-04T01:15) or press Enter for 2024-01-01T00:00: ");
	dateArg = Console.ReadLine();
}

if (string.IsNullOrWhiteSpace(latArg))
{
	Console.Write("Enter latitude (decimal) or press Enter to skip: ");
	latArg = Console.ReadLine();
}

if (string.IsNullOrWhiteSpace(lonArg))
{
	Console.Write("Enter longitude (decimal) or press Enter to skip: ");
	lonArg = Console.ReadLine();
}

if (string.IsNullOrWhiteSpace(dateArg)) dateArg = "2024-01-01T00:00:00";

// Parse local datetime
if (!DateTime.TryParse(dateArg, out var localDt))
{
	Console.WriteLine($"Unable to parse datetime: '{dateArg}'");
	return;
}

// Determine UTC datetime. If coordinates provided, compute offset from longitude (approx)
DateTime utcDt;
if (!string.IsNullOrWhiteSpace(latArg) && !string.IsNullOrWhiteSpace(lonArg) &&
	double.TryParse(lonArg, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out var lon))
{
	// Simple offline timezone approximation: 15 degrees per hour
	var offsetHours = (int)Math.Round(lon / 15.0);
	var offset = TimeSpan.FromHours(offsetHours);
	var dto = new DateTimeOffset(localDt, offset);
	utcDt = dto.UtcDateTime;
	Console.WriteLine($"Using longitude {lon} -> offset {offsetHours:+#;-#;0}h (approx). Converted local {localDt} to UTC {utcDt}.");
}
else
{
	// No coordinates: assume input is UTC
	utcDt = DateTime.SpecifyKind(localDt, DateTimeKind.Utc);
}

try
{
	using IEphemerides eph = new SwissEphemeridesService(ephType: EphType.Moshier).CreateContext();
	var chart = new HumanDesignChart(utcDt, eph);

	Console.WriteLine($"Chart for: {utcDt:O} (UTC)");
	Console.WriteLine($"Type: {chart.Type}");
	Console.WriteLine($"Profile: {chart.Profile.ToText()}");
	Console.WriteLine($"Strategy: {chart.Strategy}");
	Console.WriteLine($"Incarnation Cross: {chart.IncarnationCross}");

	Console.WriteLine("\nPersonality Activations (planet -> gate.line.color.tone.base):");
	foreach (var kv in chart.PersonalityActivation.OrderBy(k => k.Key))
	{
		var planet = kv.Key;
		var act = kv.Value;
		Console.WriteLine($"\t{planet,-10} -> Gate {act.Gate.ToNumber(),2} Line {act.Line.ToNumber()}  ({act})");
	}

	Console.WriteLine("\nDesign Activations (planet -> gate.line.color.tone.base):");
	foreach (var kv in chart.DesignActivation.OrderBy(k => k.Key))
	{
		var planet = kv.Key;
		var act = kv.Value;
		Console.WriteLine($"\t{planet,-10} -> Gate {act.Gate.ToNumber(),2} Line {act.Line.ToNumber()}  ({act})");
	}

	// Print all active gates (union of personality and design)
	var activeGates = chart.PersonalityActivation.Values.Select(a => a.Gate).Union(chart.DesignActivation.Values.Select(a => a.Gate)).OrderBy(g => g.ToNumber());
	Console.WriteLine("\nAll Active Gates:");
	foreach (var g in activeGates)
	{
		Console.WriteLine($"\tGate {g.ToNumber()} ({g})");
	}
}
catch (Exception ex)
{
	Console.WriteLine($"Error creating chart: {ex}");
}
