// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DrawWallButton } from './DrawWallButton';

afterEach(cleanup);

describe('DrawWallButton', () => {
  it('is a "Draw wall" button that is not pressed while the tool is off', () => {
    render(<DrawWallButton active={false} onToggle={vi.fn()} />);
    const button = screen.getByRole('button', { name: 'Draw wall' });
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('shows as pressed while the tool is active', () => {
    render(<DrawWallButton active onToggle={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Draw wall' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('asks to toggle the tool when clicked', () => {
    const onToggle = vi.fn();
    render(<DrawWallButton active={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: 'Draw wall' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
