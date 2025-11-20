import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./testing/__tests__/setup.ts'],
        include: ['testing/__tests__/**/*.{test,spec}.{ts,tsx}'],
        css: true,
        testTimeout: 15000, // Increased timeout for async component tests
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '../src'),
        },
    },
});

