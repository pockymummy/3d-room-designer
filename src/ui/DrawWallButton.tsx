interface Props {
  active: boolean;
  onToggle: () => void;
}

/** Turns the draw-wall tool on or off. The tool itself lives in view state, not here. */
export function DrawWallButton({ active, onToggle }: Props) {
  return (
    <button type="button" aria-pressed={active} onClick={onToggle}>
      Draw wall
    </button>
  );
}
