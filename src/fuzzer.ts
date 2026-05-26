import { FuzzerConfig, FuzzReport, FuzzResult, FuzzSummary, FuzzInput } from "./types";
import { InputGenerator } from "./generators";
import { ResponseMonitor } from "./monitor";
import * as fs from "fs";
import * as path from "path";

export class Fuzzer {
  private config: FuzzerConfig;
  private generator: InputGenerator;
  private monitor: ResponseMonitor;
  private results: FuzzResult[] = [];

  constructor(config: FuzzerConfig) {
    this.config = config;
    this.generator = new InputGenerator();
    this.monitor = new ResponseMonitor();
  }

  public async run(): Promise<FuzzReport> {
    const startTime = Date.now();
    console.log(`\n🧵 Starting execution loop for ${this.config.iterations} iterations...`);

    for (let i = 0; i < this.config.iterations; i++) {
      const input = this.generator.generate(this.config.strategy);
      
      process.stdout.write(`\rProgress: [${i + 1}/${this.config.iterations}] `);

      const result = await this.executeSingle(input);
      this.results.push(result);

      // Periodically check for drift
      if (i > 0 && i % 20 === 0) {
        const drift = this.monitor.detectDrift(this.results);
        if (drift.length > 0) {
          console.log(`\n⚠️ Drift Alert: ${drift.join(", ")}`);
        }
      }

      // Small delay to avoid hammering the endpoint too fast if it's local
      if (this.config.iterations > 100) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    const endTime = Date.now();
    const report = this.generateReport(startTime, endTime);
    this.saveReport(report);
    
    return report;
  }

  private async executeSingle(input: FuzzInput): Promise<FuzzResult> {
    const start = Date.now();
    let output: any = null;
    let status: "success" | "failure" = "success";
    let error: string | undefined;

    try {
      output = await this.callEndpoint(input);
    } catch (e: any) {
      status = "failure";
      error = e.message;
      output = { error: e.message, stack: e.stack };
    }

    const latency = Date.now() - start;
    const anomalies = this.monitor.analyze(input, output, latency);

    return {
      input,
      output,
      latency,
      status,
      error,
      anomalies
    };
  }

  private async callEndpoint(input: FuzzInput): Promise<any> {
    const isUrl = this.config.endpoint.startsWith("http");

    if (isUrl) {
      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input.payload),
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        return await response.text();
      }
    } else {
      // Assume local mock for testing or local script execution
      return this.mockEndpoint(input);
    }
  }

  private mockEndpoint(input: FuzzInput): any {
    // A simple mock that simulates agent behavior for internal testing
    const p = input.payload;
    if (typeof p === "string") {
      if (p.includes("rm -rf")) return { error: "Permission denied", code: 13 };
      if (p.includes("system prompt")) return "You are a helpful assistant.";
      if (p.length > 10000) return p.substring(0, 100) + "...[truncated]";
      return `Echo: ${p}`;
    }
    return { received: p, timestamp: Date.now() };
  }

  private generateReport(startTime: number, endTime: number): FuzzReport {
    const total = this.results.length;
    const successes = this.results.filter(r => r.status === "success").length;
    const failures = total - successes;
    const anomalies = this.results.reduce((acc, r) => acc + r.anomalies.length, 0);
    const avgLatency = this.results.reduce((acc, r) => acc + r.latency, 0) / total;

    const summary: FuzzSummary = {
      total,
      successes,
      failures,
      anomalies,
      avgLatency,
      startTime,
      endTime
    };

    return {
      summary,
      results: this.results
    };
  }

  private saveReport(report: FuzzReport): void {
    const outputPath = path.resolve(this.config.output);
    const dir = path.dirname(outputPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  }
}
