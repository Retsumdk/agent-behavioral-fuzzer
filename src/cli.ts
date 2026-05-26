import { Fuzzer } from "./fuzzer";
import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";

const program = new Command();

program
  .name("agent-fuzzer")
  .description("Stress-test AI agent logic with randomized and adversarial inputs")
  .version("1.0.0");

program
  .command("fuzz")
  .description("Start a fuzzing session")
  .requiredOption("-e, --endpoint <url>", "Agent endpoint URL or local script path")
  .option("-n, --iterations <number>", "Number of iterations", "100")
  .option("-s, --strategy <strategy>", "Fuzzing strategy (random, adversarial, boundary, mixed)", "mixed")
  .option("-c, --config <path>", "Path to fuzzer configuration file")
  .option("-o, --output <path>", "Path to save results", "fuzz-results.json")
  .action(async (options) => {
    console.log(`🚀 Starting fuzzer on ${options.endpoint}...`);
    console.log(`📊 Strategy: ${options.strategy} | Iterations: ${options.iterations}`);

    const fuzzer = new Fuzzer({
      endpoint: options.endpoint,
      iterations: parseInt(options.iterations),
      strategy: options.strategy as any,
      output: options.output
    });

    try {
      const results = await fuzzer.run();
      console.log(`\n✅ Fuzzing complete!`);
      console.log(`📈 Successes: ${results.summary.successes}`);
      console.log(`⚠️ Failures: ${results.summary.failures}`);
      console.log(`🔍 Anomalies Detected: ${results.summary.anomalies}`);
      console.log(`📄 Results saved to: ${options.output}`);
    } catch (error) {
      console.error(`❌ Fuzzer failed:`, error);
      process.exit(1);
    }
  });

program.parse();
