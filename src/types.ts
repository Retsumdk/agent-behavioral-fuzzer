export type FuzzStrategy = "random" | "adversarial" | "boundary" | "mixed";

export interface FuzzerConfig {
  endpoint: string;
  iterations: number;
  strategy: FuzzStrategy;
  output: string;
  timeout?: number;
}

export interface FuzzInput {
  payload: any;
  metadata: {
    type: string;
    strategy: string;
    timestamp: number;
  };
}

export interface FuzzResult {
  input: FuzzInput;
  output: any;
  latency: number;
  status: "success" | "failure";
  error?: string;
  anomalies: string[];
}

export interface FuzzSummary {
  total: number;
  successes: number;
  failures: number;
  anomalies: number;
  avgLatency: number;
  startTime: number;
  endTime: number;
}

export interface FuzzReport {
  summary: FuzzSummary;
  results: FuzzResult[];
}
