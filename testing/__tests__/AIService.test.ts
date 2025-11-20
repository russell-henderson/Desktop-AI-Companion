import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIService } from '../../src/main/services/AIService';
import OpenAI from 'openai';

// Mock OpenAI
vi.mock('openai', () => {
    const mockCreate = vi.fn().mockResolvedValue({
        choices: [
            {
                message: {
                    role: 'assistant',
                    content: 'Mocked response',
                },
            },
        ],
    });

    return {
        default: class {
            chat = {
                completions: {
                    create: mockCreate,
                },
            };
        },
    };
});

describe('AIService', () => {
    let aiService: AIService;

    beforeEach(() => {
        aiService = new AIService('test-key', 'gpt-3.5-turbo');
    });

    it('should initialize with API key and model', () => {
        expect(aiService).toBeDefined();
    });

    it('should handle sendMessage with valid input', async () => {
        const result = await aiService.sendMessage({
            conversationId: 'test-chat',
            content: 'Hello',
        });

        expect(result).toBeDefined();
        expect(result.role).toBe('assistant');
        expect(result.content).toBe('Mocked response');
    });
});

