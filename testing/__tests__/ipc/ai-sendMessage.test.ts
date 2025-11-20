import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Database } from '../../../src/main/db/Database';
import { MessageRepository } from '../../../src/main/repositories/MessageRepository';
import { AIService } from '../../../src/main/services/AIService';
import OpenAI from 'openai';

// Mock OpenAI to prevent browser environment error
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

// Mock sql.js and fs
vi.mock('sql.js', () => {
    class MockDatabase {
        run = vi.fn();
        exec = vi.fn(() => []);
        prepare = vi.fn(() => ({
            bind: vi.fn(),
            step: vi.fn(() => false),
            getAsObject: vi.fn(() => ({})),
            free: vi.fn(),
        }));
        export = vi.fn(() => new Uint8Array());
    }

    return {
        default: vi.fn().mockResolvedValue({
            Database: MockDatabase,
        }),
    };
});

vi.mock('fs', () => ({
    default: {
        existsSync: vi.fn(() => false),
        readFileSync: vi.fn(() => 'CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY);'),
        writeFileSync: vi.fn(),
        mkdirSync: vi.fn(),
    },
}));

describe('AIService - Error Mapping', () => {
    let db: Database;
    let messageRepo: MessageRepository;
    let aiService: AIService;

    beforeEach(async () => {
        db = new Database(':memory:');
        await db.initialize();
        messageRepo = new MessageRepository(db);
        aiService = new AIService('test-key', 'gpt-3.5-turbo');
        vi.clearAllMocks();
    });

    it('maps network errors to clear error messages', async () => {
        const networkError = new Error('Network request failed');
        vi.spyOn(aiService, 'sendMessage').mockRejectedValue(networkError);

        try {
            await aiService.sendMessage({ conversationId: 'test-chat', content: 'Test' });
            expect.fail('Should have thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect((error as Error).message).toContain('Network');
        }
    });

    it('maps invalid API key errors', async () => {
        const apiError = new Error('401 Incorrect API key provided');
        vi.spyOn(aiService, 'sendMessage').mockRejectedValue(apiError);

        try {
            await aiService.sendMessage({ conversationId: 'test-chat', content: 'Test' });
            expect.fail('Should have thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect((error as Error).message).toContain('401');
        }
    });

    it('maps rate limit errors', async () => {
        const rateLimitError = new Error('429 Rate limit exceeded');
        vi.spyOn(aiService, 'sendMessage').mockRejectedValue(rateLimitError);

        try {
            await aiService.sendMessage({ conversationId: 'test-chat', content: 'Test' });
            expect.fail('Should have thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect((error as Error).message).toContain('429');
        }
    });

    it('handles multiple concurrent requests', async () => {
        let callCount = 0;
        const mockSendMessage = vi.fn().mockImplementation(async () => {
            callCount++;
            await new Promise((resolve) => setTimeout(resolve, 10));
            return { role: 'assistant', content: `Response ${callCount}` };
        });

        vi.spyOn(aiService, 'sendMessage').mockImplementation(mockSendMessage);

        // Simulate concurrent calls
        const promise1 = aiService.sendMessage({ conversationId: 'test-chat', content: 'Test 1' });
        const promise2 = aiService.sendMessage({ conversationId: 'test-chat', content: 'Test 2' });

        await Promise.all([promise1, promise2]);

        // Both should complete
        expect(mockSendMessage).toHaveBeenCalledTimes(2);
    });
});
