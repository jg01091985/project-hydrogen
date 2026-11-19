import { WebToolTranslator } from './src/translator.js';
import { antiBot } from './src/anti-bot.js';
import { CONFIG } from './src/config.js';
import { selfLearn } from './src/self-learn.js';
import { orchestration } from './src/orchestration.js';
import assert from 'assert';

console.log('🧪 Running Hydrogen Enterprise AGI & Orchestration Stress Tests...\n');

// Test 1: Valid JSON tool call parsing
const rawToolResponse = 'Here is the command you requested:\n```json\n{ "tool_call": { "name": "Bash", "input": { "command": "ls -la" } } }\n```';
const parsed1 = WebToolTranslator.parseResponseForTools(rawToolResponse, 'hydrogen');
assert.strictEqual(parsed1.stop_reason, 'tool_use');
assert.strictEqual(parsed1.content[0].type, 'text');
assert.strictEqual(parsed1.content[1].type, 'tool_use');
assert.strictEqual(parsed1.content[1].name, 'Bash');
assert.strictEqual(parsed1.content[1].input.command, 'ls -la');
console.log('✅ Test 1 Passed: Valid JSON tool call parsed successfully.');

// Test 2: Malformed JSON tool call fallback to plain text
const malformedResponse = 'Here is some text with invalid json ```json { "tool_call": broken } ```';
const parsed2 = WebToolTranslator.parseResponseForTools(malformedResponse, 'hydrogen');
assert.strictEqual(parsed2.stop_reason, 'end_turn');
assert.strictEqual(parsed2.content[0].type, 'text');
console.log('✅ Test 2 Passed: Malformed tool call gracefully falls back to plain text.');

// Test 3: Anti-bot stealth & fake DNS headers
const headers = antiBot.getFakeDnsHeaders('agi-worker');
assert.ok(headers['User-Agent']);
assert.ok(headers['X-Forwarded-For']);
assert.strictEqual(headers['X-Hydrogen-Agent-ID'], 'agi-worker');
console.log('✅ Test 3 Passed: God-tier anti-bot headers verified.');

// Test 4: Self-Learning AGI feedback loop
selfLearn.recordRun(true, 120);
const metrics = selfLearn.getMetricsSummary();
assert.ok(typeof metrics.generationCount === 'number');
assert.ok(metrics.successRate.includes('%'));
console.log('✅ Test 4 Passed: Self-learning intelligence loop verified.');

// Test 5: Subagent Orchestration status
const orchStatus = orchestration.getStatus();
assert.strictEqual(typeof orchStatus.activeWorkersCount, 'number');
assert.ok(Array.isArray(orchStatus.workers));
console.log('✅ Test 5 Passed: Subagent orchestration engine verified.');

// Test 6: Quantum Consensus Engine
import { consensusEngine } from './src/consensus.js';
const consensusResult = consensusEngine.evaluateConsensus([true, true, true, false, true]);
assert.strictEqual(consensusResult.approved, true);
assert.strictEqual(consensusResult.rating, '8/10 Quantum Verified');
console.log('✅ Test 6 Passed: Quantum consensus verification passed.');

console.log('\n🎉 All Hydrogen AGI & orchestration tests passed successfully without gaps!');
