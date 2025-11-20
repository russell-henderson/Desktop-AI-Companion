import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationProvider, useNavigation } from '../../../src/renderer/contexts/NavigationContext';

function TestComponent() {
    const { section, setSection } = useNavigation();
    return (
        <div>
            <div data-testid="current-section">{section}</div>
            <button onClick={() => setSection('projects')}>Go to Projects</button>
            <button onClick={() => setSection('notebook')}>Go to Notebook</button>
        </div>
    );
}

describe('NavigationContext', () => {
    it('provides default section', () => {
        render(
            <NavigationProvider>
                <TestComponent />
            </NavigationProvider>,
        );
        expect(screen.getByTestId('current-section')).toHaveTextContent('home');
    });

    it('updates section when setSection is called', async () => {
        const user = userEvent.setup();
        render(
            <NavigationProvider>
                <TestComponent />
            </NavigationProvider>,
        );

        const projectsButton = screen.getByRole('button', { name: /go to projects/i });
        await user.click(projectsButton);

        expect(screen.getByTestId('current-section')).toHaveTextContent('projects');
    });

    it('throws error when used outside provider', () => {
        // Suppress console.error for this test
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useNavigation must be used within a NavigationProvider');

        consoleSpy.mockRestore();
    });
});

