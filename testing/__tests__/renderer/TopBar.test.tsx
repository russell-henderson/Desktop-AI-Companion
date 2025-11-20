import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TopBar from '../../../src/renderer/components/layout/TopBar';
import { renderWithProviders } from '../test-utils';
import { ModelProvider } from '../../../src/renderer/contexts/ModelContext';

function TopBarWrapper() {
    return (
        <ModelProvider>
            <TopBar />
        </ModelProvider>
    );
}

describe('TopBar', () => {
    it('renders dashboard title', () => {
        renderWithProviders(<TopBarWrapper />);
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });

    it('renders model card', () => {
        renderWithProviders(<TopBarWrapper />);
        expect(screen.getByText(/Model/i)).toBeInTheDocument();
    });

    it('renders Notebook and Settings buttons', () => {
        renderWithProviders(<TopBarWrapper />);
        expect(screen.getByRole('button', { name: /notebook/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    });

    it('Notebook button is clickable', async () => {
        const user = (await import('@testing-library/user-event')).default;
        const userEvent = user.setup();
        renderWithProviders(<TopBarWrapper />);
        const notebookButton = screen.getByRole('button', { name: /notebook/i });
        await userEvent.click(notebookButton);
        // Button should be clickable (no errors thrown)
        expect(notebookButton).toBeInTheDocument();
    });

    it('Settings button is clickable', async () => {
        const user = (await import('@testing-library/user-event')).default;
        const userEvent = user.setup();
        renderWithProviders(<TopBarWrapper />);
        const settingsButton = screen.getByRole('button', { name: /settings/i });
        await userEvent.click(settingsButton);
        // Button should be clickable (no errors thrown)
        expect(settingsButton).toBeInTheDocument();
    });
});

