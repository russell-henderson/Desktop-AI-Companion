import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModelSelector from '../../../src/renderer/components/ui/ModelSelector';

describe('ModelSelector', () => {
    it('displays current model', () => {
        render(<ModelSelector />);
        expect(screen.getByText(/gpt-4o-mini/i)).toBeInTheDocument();
    });

    it('shows persona label and description for selected model', () => {
        render(<ModelSelector />);
        expect(screen.getByText(/Nova · System Expert/i)).toBeInTheDocument();
        expect(screen.getByText(/Precision \+ tool access/i)).toBeInTheDocument();
    });

    it('updates persona when model changes', async () => {
        const user = userEvent.setup();
        render(<ModelSelector />);

        const select = screen.getByRole('combobox');
        await user.selectOptions(select, 'gpt-4.1-mini');

        expect(screen.getByText(/Nova · Research/i)).toBeInTheDocument();
        expect(screen.getByText(/Long context, grounded answers/i)).toBeInTheDocument();
    });

    it('displays all available models in dropdown', () => {
        render(<ModelSelector />);
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(select.options).toHaveLength(3);
        expect(select.options[0].text).toContain('Nova · System Expert');
        expect(select.options[1].text).toContain('Nova · Research');
        expect(select.options[2].text).toContain('Nova · Fast Drafts');
    });

    it('updates model ID display when selection changes', async () => {
        const user = userEvent.setup();
        render(<ModelSelector />);

        const select = screen.getByRole('combobox');
        await user.selectOptions(select, 'gpt-3.5-turbo');

        expect(screen.getByText(/gpt-3.5-turbo/i)).toBeInTheDocument();
    });
});

