// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setColor } from '../core/commands';
import { defaultRoom } from '../defaultRoom';
import { ColorPanel } from './ColorPanel';

afterEach(cleanup);

const setup = (state = defaultRoom) => {
  const dispatch = vi.fn();
  const view = render(<ColorPanel state={state} dispatch={dispatch} />);
  return { dispatch, ...view };
};

const wallHex = () => screen.getByLabelText('Wall hex') as HTMLInputElement;
const floorHex = () => screen.getByLabelText('Floor hex') as HTMLInputElement;
const type = (input: HTMLElement, value: string) => fireEvent.change(input, { target: { value } });

describe('ColorPanel display', () => {
  it('shows the current wall and floor colors from the state', () => {
    setup();
    expect(wallHex().value).toBe('#f2eee6');
    expect(floorHex().value).toBe('#b08968');
  });

  it('reflects a new state passed in by the parent (for example after undo)', () => {
    const { dispatch, rerender } = setup();
    rerender(<ColorPanel state={{ ...defaultRoom, wallColor: 0x0000ff }} dispatch={dispatch} />);
    expect(wallHex().value).toBe('#0000ff');
  });

  it('drops an uncommitted typed color when the parent passes a new state (undo while typing)', () => {
    const { dispatch, rerender } = setup();
    type(wallHex(), '#ff0000');
    rerender(<ColorPanel state={{ ...defaultRoom, wallColor: 0x0000ff }} dispatch={dispatch} />);
    expect(wallHex().value).toBe('#0000ff');
    fireEvent.blur(wallHex());
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('has an in-page picker per color, not a native color input', () => {
    setup();
    expect(document.querySelector('input[type="color"]')).toBeNull();
    expect(within(screen.getByRole('group', { name: 'Wall color' })).getAllByRole('slider')).toHaveLength(2);
    expect(within(screen.getByRole('group', { name: 'Floor color' })).getAllByRole('slider')).toHaveLength(2);
  });
});

describe('ColorPanel hex input', () => {
  it('dispatches setColor once when Enter confirms a typed color', () => {
    const { dispatch } = setup();
    type(wallHex(), '#ff0000');
    expect(dispatch).not.toHaveBeenCalled();
    fireEvent.keyDown(wallHex(), { key: 'Enter' });
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(setColor('wallColor', 0xff0000));
  });

  it('dispatches once when the input loses focus', () => {
    const { dispatch } = setup();
    type(floorHex(), '#00ff00');
    fireEvent.blur(floorHex());
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(setColor('floorColor', 0x00ff00));
  });

  it('expands three-digit hex colors', () => {
    const { dispatch } = setup();
    type(wallHex(), '#f00');
    fireEvent.keyDown(wallHex(), { key: 'Enter' });
    expect(dispatch).toHaveBeenCalledWith(setColor('wallColor', 0xff0000));
  });

  it('dispatches nothing for an invalid color', () => {
    const { dispatch } = setup();
    type(wallHex(), '#zzz');
    fireEvent.keyDown(wallHex(), { key: 'Enter' });
    fireEvent.blur(wallHex());
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('dispatches nothing when Enter is pressed without typing', () => {
    const { dispatch } = setup();
    fireEvent.keyDown(wallHex(), { key: 'Enter' });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('never mutates the state it was given', () => {
    const frozen = Object.freeze({ ...defaultRoom });
    const { dispatch } = setup(frozen);
    type(wallHex(), '#123456');
    fireEvent.keyDown(wallHex(), { key: 'Enter' });
    expect(frozen.wallColor).toBe(defaultRoom.wallColor);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

describe('ColorPanel picker gesture', () => {
  const hueSlider = (group: string) => within(screen.getByRole('group', { name: group })).getByRole('slider', { name: 'Hue' });

  it('dispatches exactly one setColor for a whole gesture, not one per step', () => {
    const { dispatch } = setup();
    const hue = hueSlider('Wall color');

    for (let i = 0; i < 5; i++) fireEvent.keyDown(hue, { keyCode: 39 }); // ArrowRight x5
    expect(dispatch).not.toHaveBeenCalled(); // still dragging: no undo steps yet

    fireEvent.keyUp(hue, { keyCode: 39 }); // gesture ends
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0]?.[0]).toMatchObject({ type: 'setColor', args: { key: 'wallColor' } });
  });

  it('shows the in-progress color in the hex input while the gesture runs', () => {
    setup();
    const before = wallHex().value;
    fireEvent.keyDown(hueSlider('Wall color'), { keyCode: 39 });
    expect(wallHex().value).not.toBe(before);
  });

  it('keeps the wall and floor pickers independent', () => {
    const { dispatch } = setup();
    const hue = hueSlider('Floor color');
    fireEvent.keyDown(hue, { keyCode: 39 });
    fireEvent.keyUp(hue, { keyCode: 39 });
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0]?.[0]).toMatchObject({ args: { key: 'floorColor' } });
    expect(wallHex().value).toBe('#f2eee6');
  });
});
