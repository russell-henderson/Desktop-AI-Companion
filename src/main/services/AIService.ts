import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { AiMessage } from '../../types/ipc';
import type { SystemTelemetryService } from './SystemTelemetryService';
import type { AlertStore } from './AlertStore';

export interface SendMessageParams {
  conversationId: string;
  content: string;
  history?: ChatCompletionMessageParam[];
  model?: string;
  telemetryService?: SystemTelemetryService | null;
  alertStore?: AlertStore | null;
}

export class AIService {
  private client: OpenAI;
  private currentModel: string;

  constructor(private readonly apiKey: string, private readonly defaultModel: string) {
    this.client = new OpenAI({
      apiKey: this.apiKey,
    });
    this.currentModel = defaultModel;
  }

  getCurrentModel(): string {
    return this.currentModel;
  }

  setCurrentModel(modelId: string): void {
    this.currentModel = modelId;
  }

  async sendMessage(params: SendMessageParams): Promise<AiMessage> {
    const { content, history = [], model = this.currentModel, telemetryService, alertStore } = params;

    // Fetch telemetry and active alert
    const telemetry = telemetryService?.getSnapshot() || null;
    const alert = alertStore?.getActiveAlert() || null;

    // Build dynamic system message with telemetry
    const telemetryBlock = telemetry
      ? [
          'CURRENT SYSTEM TELEMETRY:',
          `- Health status: ${telemetry.status}`,
          `- CPU load: ${telemetry.cpuLoad}%`,
          `- Memory load: ${telemetry.memoryLoad}%`,
          telemetry.gpuLoad !== undefined ? `- GPU load: ${telemetry.gpuLoad}%` : '- GPU load: not available',
          telemetry.activeAlerts.length
            ? `- Active alerts: ${telemetry.activeAlerts.join(' | ')}`
            : '- Active alerts: none',
          alert ? `- Primary alert: ${alert.message}` : '',
        ]
          .filter(Boolean)
          .join('\n')
      : 'CURRENT SYSTEM TELEMETRY: not available';

    const systemInstruction = [
      'You are Nova, a system admin companion for Windows power users.',
      'You can see the telemetry block below and must treat it as ground truth.',
      'Never say that you cannot see the system. If telemetry is missing, say it is temporarily unavailable.',
      'Use alerts to prioritize what you explain and which tools you propose.',
      '',
      telemetryBlock,
    ].join('\n');

    // Build messages array with system message first
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemInstruction },
      ...history,
      {
        role: 'user',
        content,
      },
    ];

    const response = await this.client.chat.completions.create({
      model,
      messages,
      temperature: 0.2,
    });

    const assistantMessage = response.choices[0]?.message?.content ?? '';

    return {
      role: 'assistant',
      content: assistantMessage,
    };
  }
}

