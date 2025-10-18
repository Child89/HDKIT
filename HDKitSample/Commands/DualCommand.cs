using System;
using System.Globalization;

namespace HDKitSample.Commands
{
    using HDKitSample;

    public class DualCommand
    {
        private readonly string[] _args;
        public DualCommand(string[] args) { _args = args; }

        public int Run()
        {
            if (_args.Length < 7)
            {
                Console.WriteLine("pair requires: <datetime1> <lat1> <lon1> <datetime2> <lat2> <lon2>");
                return 1;
            }
            bool ok1 = DateTime.TryParse(_args[1], out var dt1);
            double.TryParse(_args[2], NumberStyles.Float, CultureInfo.InvariantCulture, out var lat1);
            double.TryParse(_args[3], NumberStyles.Float, CultureInfo.InvariantCulture, out var lon1);
            bool ok2 = DateTime.TryParse(_args[4], out var dt2);
            double.TryParse(_args[5], NumberStyles.Float, CultureInfo.InvariantCulture, out var lat2);
            double.TryParse(_args[6], NumberStyles.Float, CultureInfo.InvariantCulture, out var lon2);
            if (!ok1 || !ok2) { Console.WriteLine("Unable to parse one of the datetimes."); return 1; }
            var p1 = new PersonInput(dt1, lat1, lon1);
            var p2 = new PersonInput(dt2, lat2, lon2);
            Console.WriteLine("--- Person 1 ---");
            Processor.ProcessSingle(p1);
            Console.WriteLine("--- Person 2 ---");
            Processor.ProcessSingle(p2);
            return 0;
        }
    }
}
