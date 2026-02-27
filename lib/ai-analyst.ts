// AI Analyst — upload CSV, run analysis in E2B, get charts back
// Inspired by https://github.com/e2b-dev/ai-analyst
import { Sandbox } from '@e2b/code-interpreter'

export interface AnalysisResult {
  sandboxId: string
  summary: string
  charts: ChartResult[]
  stdout: string
  error?: string
  executionTime: number
}

export interface ChartResult {
  type: string
  title: string
  imageBase64?: string
  data?: any
}

export async function analyzeCSV(
  csvContent: string,
  fileName: string,
  userPrompt: string,
  agentId?: string
): Promise<AnalysisResult> {
  const start = Date.now()
  const sandbox = await Sandbox.create({
    apiKey: process.env.E2B_API_KEY,
    metadata: { agentId: agentId ?? 'analyst', type: 'analyst' },
    timeoutMs: 120_000,
  })

  try {
    // Write CSV to sandbox
    await sandbox.files.write(`/home/user/${fileName}`, csvContent)

    // Run pandas analysis
    const analysisCode = `
import pandas as pd
import json
import warnings
warnings.filterwarnings('ignore')

df = pd.read_csv('/home/user/${fileName}')
print('=== DATASET INFO ===')
print(f'Rows: {len(df)}, Columns: {len(df.columns)}')
print(f'Columns: {list(df.columns)}')
print()
print('=== HEAD ===')
print(df.head(3).to_string())
print()
print('=== DESCRIBE ===')
print(df.describe().to_string())
print()
print('=== NULL COUNTS ===')
print(df.isnull().sum().to_string())
`
    const infoResult = await sandbox.runCode(analysisCode, { language: 'python' })

    // Run user-requested analysis
    const userCode = `
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io, base64, json, warnings
warnings.filterwarnings('ignore')

df = pd.read_csv('/home/user/${fileName}')
charts = []

# User request: ${userPrompt}
# Auto-generate basic charts
numeric_cols = df.select_dtypes(include='number').columns.tolist()

if len(numeric_cols) >= 1:
    fig, ax = plt.subplots(figsize=(8, 4))
    df[numeric_cols[:4]].describe().loc[['mean', 'std', 'min', 'max']].T.plot(kind='bar', ax=ax)
    ax.set_title('Numeric Columns Summary')
    ax.tick_params(axis='x', rotation=45)
    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100)
    charts.append({'type': 'bar', 'title': 'Numeric Summary', 'image': base64.b64encode(buf.getvalue()).decode()})
    plt.close()

if len(numeric_cols) >= 2:
    fig, ax = plt.subplots(figsize=(8, 4))
    df[numeric_cols[:2]].plot(ax=ax)
    ax.set_title(f'{numeric_cols[0]} vs {numeric_cols[1]}')
    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100)
    charts.append({'type': 'line', 'title': f'{numeric_cols[0]} vs {numeric_cols[1]}', 'image': base64.b64encode(buf.getvalue()).decode()})
    plt.close()

print('CHARTS_JSON:' + json.dumps(charts))
`
    const chartResult = await sandbox.runCode(userCode, { language: 'python' })
    const allOutput = chartResult.logs.stdout.join('\n')
    const chartsLine = allOutput.split('\n').find((l) => l.startsWith('CHARTS_JSON:'))
    let charts: ChartResult[] = []
    if (chartsLine) {
      const raw = JSON.parse(chartsLine.replace('CHARTS_JSON:', ''))
      charts = raw.map((c: any) => ({
        type: c.type,
        title: c.title,
        imageBase64: c.image,
      }))
    }

    return {
      sandboxId: sandbox.sandboxId,
      summary: infoResult.logs.stdout.join('\n'),
      charts,
      stdout: allOutput.replace(chartsLine ?? '', '').trim(),
      executionTime: Date.now() - start,
    }
  } finally {
    await sandbox.kill()
  }
}
