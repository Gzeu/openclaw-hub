// test/e2b-context-injection.test.js
const { test, mock } = require('node:test');
const assert = require('node:assert');
const { fetch } = require('undici');

// Mock the fetch function to simulate the delegation endpoint
mock.method(global, 'fetch', async (url, options) => {
  if (url.endsWith('/api/agents/chat')) {
    const { task, e2bOutput } = JSON.parse(options.body);
    if (e2bOutput) {
      return new Response(JSON.stringify({
        success: true,
        context: task.context.includes(e2bOutput),
      }), {
        status: 200,
      });
    }
    return new Response(JSON.stringify({ success: false, error: 'No E2B output provided' }), {
      status: 400,
    });
  }
  return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
    status: 404,
  });
});

test('E2B output should be appended to task context', async () => {
  const e2bOutput = 'Hello, E2B!';
  const task = {
    taskId: 'test-task',
    prompt: 'Analyze this code',
    context: 'Initial context',
  };

  const response = await fetch('http://localhost:3000/api/agents/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, e2bOutput, delegateTo: 'Vex:op' }),
  });

  const data = await response.json();
  assert.strictEqual(data.success, true, 'Delegation should succeed');
  assert.strictEqual(data.context, true, 'E2B output should be included in context');
});

test('Delegation without E2B output should fail', async () => {
  const task = {
    taskId: 'test-task',
    prompt: 'Analyze this code',
    context: 'Initial context',
  };

  const response = await fetch('http://localhost:3000/api/agents/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, delegateTo: 'Vex:op' }),
  });

  const data = await response.json();
  assert.strictEqual(data.success, false, 'Delegation should fail without E2B output');
});