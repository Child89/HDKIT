using System;
using System.Linq;
using SharpAstrology.DataModels;
using SharpAstrology.Ephemerides;
using SharpAstrology.Interfaces;
using SharpAstrology.Enums;

namespace HDKitSample
{
    public static class Processor
    {
        public static void ProcessSingle(PersonInput inp)
        {
            DateTime utcDt;
            if (inp.Longitude.HasValue)
            {
                var offsetHours = (int)Math.Round(inp.Longitude.Value / 15.0);
                var dto = new DateTimeOffset(inp.LocalDateTime, TimeSpan.FromHours(offsetHours));
                utcDt = dto.UtcDateTime;
                Console.WriteLine($"Using longitude {inp.Longitude.Value} -> offset {offsetHours:+#;-#;0}h (approx). Converted local {inp.LocalDateTime} to UTC {utcDt}.");
            }
            else
            {
                utcDt = DateTime.SpecifyKind(inp.LocalDateTime, DateTimeKind.Utc);
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
                    Console.WriteLine($"\t\tDescription: {GateInfo.Descriptions.GetValueOrDefault(act.Gate, "No description available.")}");
                }

                Console.WriteLine("\nDesign Activations (planet -> gate.line.color.tone.base):");
                foreach (var kv in chart.DesignActivation.OrderBy(k => k.Key))
                {
                    var planet = kv.Key;
                    var act = kv.Value;
                    Console.WriteLine($"\t{planet,-10} -> Gate {act.Gate.ToNumber(),2} Line {act.Line.ToNumber()}  ({act})");
                    Console.WriteLine($"\t\tDescription: {GateInfo.Descriptions.GetValueOrDefault(act.Gate, "No description available.")}");
                }

                var activeGates = chart.PersonalityActivation.Values.Select(a => a.Gate).Union(chart.DesignActivation.Values.Select(a => a.Gate)).OrderBy(g => g.ToNumber());
                Console.WriteLine("\nAll Active Gates:");
                foreach (var g in activeGates)
                {
                    Console.WriteLine($"\tGate {g.ToNumber()} ({g})");
                    Console.WriteLine($"\t\t{GateInfo.Descriptions.GetValueOrDefault(g, "No description available.")}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating chart: {ex.Message}");
            }
        }
    }
}
