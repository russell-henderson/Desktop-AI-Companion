import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['OPENAI_API_KEY'] as const;

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const config = {
  openAiApiKey: process.env.OPENAI_API_KEY as string,
  defaultModel: process.env.OPENAI_MODEL ?? 'gpt-3.5-turbo',
  electronStartUrl: process.env.ELECTRON_START_URL,
};

