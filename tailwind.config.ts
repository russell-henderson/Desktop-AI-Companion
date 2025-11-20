import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                canvas: '#F0F4F8',
                sidebar: '#DFEBF7',
                brand: {
                    cyan: '#0D95C5',
                    emerald: '#0DBC83',
                    orange: '#E45C00',
                    ink: '#243135',
                },
                text: {
                    primary: '#243135',
                    subtle: '#4B5A64',
                    muted: '#7C8A96',
                },
                surface: {
                    DEFAULT: '#FFFFFF',
                    soft: '#F6FAFD',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
            },
            boxShadow: {
                card: '0 4px 20px rgba(0, 0, 0, 0.05)',
            },
            borderRadius: {
                card: '20px',
                pill: '9999px',
            },
        },
    },
    plugins: [],
};

export default config;

