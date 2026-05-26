# Agent Behavioral Fuzzer

Stress-test AI agent logic with randomized, adversarial, and boundary inputs to discover hidden failures and edge cases.

## Overview

The Agent Behavioral Fuzzer is designed to probe the reliability and safety of AI agents. By subjecting an agent endpoint to a high volume of varied inputs, the fuzzer helps identify:

- **Logic Failures**: Cases where the agent produces nonsensical or contradictory responses.
- **Safety Violations**: Successful jailbreaks or reveals of sensitive system instructions.
- **Performance Issues**: Inputs that cause high latency or service crashes.
- **Format Corruption**: Responses that break expected data formats (e.g., malformed JSON).

## Installation

```bash
git clone https://github.com/Retsumdk/agent-behavioral-fuzzer
cd agent-behavioral-fuzzer
bun install
```

## Usage

### CLI

Start a fuzzing session against an endpoint:

```bash
bun start fuzz --endpoint https://api.example.com/agent --iterations 500 --strategy mixed
```

### Options

- `-e, --endpoint <url>`: Target agent endpoint (required)
- `-n, --iterations <number>`: Total inputs to test (default: 100)
- `-s, --strategy <strategy>`: `random`, `adversarial`, `boundary`, or `mixed` (default: `mixed`)
- `-o, --output <path>`: Results JSON path (default: `fuzz-results.json`)

## Fuzzing Strategies

1. **Random**: Generated strings, numbers, and objects to test general robustness.
2. **Adversarial**: Prompt injection patterns, jailbreak attempts, and "ignore instructions" commands.
3. **Boundary**: Empty strings, massive payloads, unexpected nulls, and extreme numerical values.
4. **Mixed**: A balanced combination of all strategies.

## Anomaly Detection

The fuzzer automatically monitors responses for:
- **Security Leaks**: Presence of system prompts or API keys in output.
- **Infinte Loops**: Repetitive character patterns or excessive length.
- **Format Errors**: Invalid JSON or malformed content.
- **Performance Drift**: Significant changes in response latency over time.

## License

MIT
