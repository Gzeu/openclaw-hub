// E2B Desktop Sandbox — GUI environment for computer-use agents
// https://github.com/e2b-dev/desktop
import { Sandbox } from '@e2b/code-interpreter'

export interface DesktopSession {
  sandboxId: string
  streamUrl: string | null
  createdAt: string
}

export interface DesktopActionResult {
  sandboxId: string
  action: string
  stdout: string
  stderr: string
  screenshotBase64?: string
  executionTime: number
}

// Create a desktop sandbox — uses 'desktop' template if available
export async function createDesktopSandbox(agentId: string): Promise<DesktopSession> {
  const sandbox = await Sandbox.create({
    apiKey: process.env.E2B_API_KEY,
    // Use e2b desktop template when available
    // template: 'desktop',
    metadata: { agentId, type: 'desktop' },
    timeoutMs: 300_000, // 5 min
  })

  return {
    sandboxId: sandbox.sandboxId,
    streamUrl: null, // Desktop stream URL would come from desktop template
    createdAt: new Date().toISOString(),
  }
}

// Run a shell command in desktop sandbox
export async function runDesktopCommand(
  sandboxId: string,
  command: string
): Promise<DesktopActionResult> {
  const start = Date.now()
  const sandbox = await Sandbox.connect(sandboxId, {
    apiKey: process.env.E2B_API_KEY,
  })

  const result = await sandbox.runCode(
    `import subprocess\nresult = subprocess.run(${JSON.stringify(command)}, shell=True, capture_output=True, text=True)\nprint(result.stdout)\nprint(result.stderr, end='')`,
    { language: 'python' }
  )

  return {
    sandboxId,
    action: command,
    stdout: result.logs.stdout.join('\n'),
    stderr: result.logs.stderr.join('\n'),
    executionTime: Date.now() - start,
  }
}

// Take a screenshot (requires desktop template)
export async function takeScreenshot(sandboxId: string): Promise<string | null> {
  try {
    const sandbox = await Sandbox.connect(sandboxId, {
      apiKey: process.env.E2B_API_KEY,
    })
    const result = await sandbox.runCode(
      `import subprocess, base64\nresult = subprocess.run(['scrot', '-', '-z'], capture_output=True)\nprint(base64.b64encode(result.stdout).decode())`,
      { language: 'python' }
    )
    return result.logs.stdout[0] ?? null
  } catch {
    return null
  }
}
