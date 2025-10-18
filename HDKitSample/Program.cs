using System;
using HDKitSample.Commands;

namespace HDKitSample
{
    public static class Program
    {
        static void PrintHelp()
        {
            Console.WriteLine("HDKitSample - Human Design CLI");
            Console.WriteLine();
            Console.WriteLine("Usage:");
            Console.WriteLine("  single <datetime> <lat> <lon>         Calculate chart for one person (local datetime)");
            Console.WriteLine("  pair <datetime1> <lat1> <lon1> <datetime2> <lat2> <lon2>");
            Console.WriteLine("                                       Calculate matching for two full profiles");
            Console.WriteLine("  pair-time <datetime1> <lat1> <lon1> <time2> <lat2> <lon2>");
            Console.WriteLine("                                       Second person: only time (no date), same local time & coords");
            Console.WriteLine();
            Console.WriteLine("Examples:");
            Console.WriteLine("  single \"1989-06-04T14:10\" 46.6581 16.1610");
            Console.WriteLine("  pair \"1989-06-04T14:10\" 46.6581 16.1610 \"1988-06-04T14:10\" 46.6581 16.1610");
            Console.WriteLine("  pair-time \"1989-06-04T14:10\" 46.6581 16.1610 T14:10 46.6581 16.1610");
        }

        public static int Main(string[] args)
        {
            if (args.Length == 0)
            {
                PrintHelp();
                return 0;
            }

            var cmd = args[0].ToLowerInvariant();
            if (cmd == "single") return new SingleCommand(args).Run();
            if (cmd == "pair") return new DualCommand(args).Run();
            if (cmd == "pair-time") return new PartialDualCommand(args).Run();
            if (cmd == "help" || cmd == "-h" || cmd == "--help") { PrintHelp(); return 0; }

            Console.WriteLine($"Unknown command: {args[0]}");
            PrintHelp();
            return 1;
        }
    }
}
