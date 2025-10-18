using System;
using System.Globalization;

namespace HDKitSample.Commands
{
    using HDKitSample;

    public class PartialDualCommand
    {
        private readonly string[] _args;
        public PartialDualCommand(string[] args) { _args = args; }

        public int Run()
        {
            if (_args.Length < 7)
            {
                Console.WriteLine("pair-time requires: <datetime1> <lat1> <lon1> <time2> <lat2> <lon2>");
                return 1;
            }
            if (!DateTime.TryParse(_args[1], out var dt1)) { Console.WriteLine("Unable to parse datetime1"); return 1; }
            double.TryParse(_args[2], NumberStyles.Float, CultureInfo.InvariantCulture, out var lat1);
            double.TryParse(_args[3], NumberStyles.Float, CultureInfo.InvariantCulture, out var lon1);
            var time2 = _args[4];
            double.TryParse(_args[5], NumberStyles.Float, CultureInfo.InvariantCulture, out var lat2);
            double.TryParse(_args[6], NumberStyles.Float, CultureInfo.InvariantCulture, out var lon2);
            var timeStr = time2.TrimStart('T');
            if (!TimeSpan.TryParse(timeStr, out var ts2)) { Console.WriteLine("Unable to parse time2"); return 1; }
            var dt2 = new DateTime(dt1.Year, dt1.Month, dt1.Day, ts2.Hours, ts2.Minutes, ts2.Seconds);
            var p1 = new PersonInput(dt1, lat1, lon1);
            var p2 = new PersonInput(dt2, lat2, lon2);
            Console.WriteLine("--- Person 1 ---");
            Processor.ProcessSingle(p1);
            Console.WriteLine("--- Person 2 (date implicit) ---");
            Processor.ProcessSingle(p2);
            return 0;
        }
    }
}
