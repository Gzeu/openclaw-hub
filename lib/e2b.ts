import { Sandbox } from '@e2b/code-interpreter'

export interface SandboxRunResult {
  sandboxId: string
  stdout: string
  stderr: string
  error?: string
  executionTime: number
}

export async function runInSandbox(
  code: string,
  language: 'python' | 'javascript' = 'python',
  timeoutMs = 30000
): Promise<SandboxRunResult> {
  const startTime = Date.now()
  const sandbox = await Sandbox.create({
    apiKey: process.env.E2B_API_KEY,
    timeoutMs,
  })

  try {
    const execution = await sandbox.runCode(code, { language })
    return {
      sandboxId: sandbox.sandboxId,
      stdout: execution.logs.stdout.join('\n'),
      stderr: execution.logs.stderr.join('\n'),
      error: execution.error?.value,
      executionTime: Date.now() - startTime,
    }
  } finally {
    await sandbox.kill()
  }
}

export async function createPersistentSandbox(agentId: string): Promise<string> {
  const sandbox = await Sandbox.create({
    apiKey: process.env.E2B_API_KEY,
    metadata: { agentId },
  })
  return sandbox.sandboxId
}

export async function resumeSandbox(sandboxId: string) {
  return Sandbox.connect(sandboxId, {
    apiKey: process.env.E2B_API_KEY,
  })
}
