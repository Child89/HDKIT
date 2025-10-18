using System;
using System.Globalization;

namespace HDKitSample.Commands
{
    using HDKitSample;

    public class SingleCommand
    {
        private readonly string[] _args;
        public SingleCommand(string[] args) { _args = args; }

        public int Run()
        {
            if (_args.Length < 4)
            {
                Console.WriteLine("single requires: <datetime> <lat> <lon>");
                return 1;
            }
            var dateArg = _args[1];
            var latArg = _args[2];
            var lonArg = _args[3];
            if (!DateTime.TryParse(dateArg, out var localDt)) { Console.WriteLine($"Unable to parse datetime: {dateArg}"); return 1; }
            double.TryParse(latArg, NumberStyles.Float, CultureInfo.InvariantCulture, out var lat);
            double.TryParse(lonArg, NumberStyles.Float, CultureInfo.InvariantCulture, out var lon);
            var inp = new PersonInput(localDt, lat, lon);
            Processor.ProcessSingle(inp);
            return 0;
        }
    }
}
