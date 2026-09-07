// RenderCounter — useRef persists across renders without causing re-render
import { useRef } from 'react';

export default function RenderCounter({ name, onCount, color = '#2563eb' }) {
  // useRef persists across renders without causing re-render
  const count = useRef(0);
  count.current += 1;

  // Report during render — parent must use a ref-backed store to avoid loops.
  if (onCount) onCount(name, count.current);

  const containerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '2px 8px',
    borderRadius: '4px',
    background: '#f3f4f6',
    border: `1px solid ${color}`,
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#111',
  };
  const dotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: color,
  };

  return (
    <span className="render-counter" style={containerStyle} data-testid={`render-counter-${name}`}>
      <span style={dotStyle} />
      <span>{name}: {count.current}</span>
    </span>
  );
}
