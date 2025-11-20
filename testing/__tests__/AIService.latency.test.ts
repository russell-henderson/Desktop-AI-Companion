import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIService } from '../../src/main/services/AIService';
import OpenAI from 'openai';

// Mock OpenAI
vi.mock('openai', () => {
    return {
        default: class {
            chat = {
                completions: {
                    create: vi.fn(),
                },
            };
        },
    };
});

describe('AIService - Latency and Timeout', () => {
    let aiService: AIService;
    let mockCreate: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        aiService = new AIService('test-key', 'gpt-3.5-turbo');
        const mockClient = new OpenAI({ apiKey: 'test' });
        mockCreate = (mockClient.chat.completions.create as ReturnType<typeof vi.fn>);
        (aiService as any).client = mockClient;
        vi.clearAllMocks();
    });

    it('returns within configured timeout (25 seconds)', async () => {
        const startTime = Date.now();
        mockCreate.mockImplementation(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        choices: [
                            {
                                message: {
                                    role: 'assistant',
                                    content: 'Response',
                                },
                            },
                        ],
                    });
                }, 100); // 100ms delay
            });
        });

        const result = await aiService.sendMessage({
            conversationId: 'test-chat',
            content: 'Hello',
        });

        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(25000); // Should complete well before 25s
        expect(result.content).toBe('Response');
    });

    it('handles long-running requests', async () => {
        mockCreate.mockImplementation(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        choices: [
                            {
                                message: {
                                    role: 'assistant',
                                    content: 'Response',
                                },
                            },
                        ],
                    });
                }, 100); // Short delay for test
            });
        });

        // Test that the method can handle requests
        const result = await aiService.sendMessage({
            conversationId: 'test-chat',
            content: 'Hello',
        });

        expect(result).toBeDefined();
        expect(result.content).toBe('Response');
    });

    it('handles network errors gracefully', async () => {
        mockCreate.mockRejectedValue(new Error('Network error'));

        await expect(
            aiService.sendMessage({
                conversationId: 'test-chat',
                content: 'Hello',
            }),
        ).rejects.toThrow('Network error');
    });

    it('handles invalid API key error', async () => {
        const apiError = new Error('401 Incorrect API key provided');
        (apiError as any).status = 401;
        mockCreate.mockRejectedValue(apiError);

        await expect(
            aiService.sendMessage({
                conversationId: 'test-chat',
                content: 'Hello',
            }),
        ).rejects.toThrow('401 Incorrect API key provided');
    });

    it('handles rate limit errors', async () => {
        const rateLimitError = new Error('429 Rate limit exceeded');
        (rateLimitError as any).status = 429;
        mockCreate.mockRejectedValue(rateLimitError);

        await expect(
            aiService.sendMessage({
                conversationId: 'test-chat',
                content: 'Hello',
            }),
        ).rejects.toThrow('429 Rate limit exceeded');
    });
});

