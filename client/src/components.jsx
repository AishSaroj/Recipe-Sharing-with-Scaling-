import { useState } from 'react';
export function Stars({ value, count }) {
  return <span className="stars" title={`${value} out of 5`}>
    <span aria-hidden>{'★'.repeat(Math.round(value))}{'☆'.repeat(5 - Math.round(value))}</span>
    <span className="muted"> {count ? `${value} (${count})` : 'No ratings yet'}</span></span>;
}
export function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return <div className="starinput" role="radiogroup" aria-label="Rating">
    {[1, 2, 3, 4, 5].map(n => <button type="button" key={n} role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
      className={n <= (hover || value) ? 'on' : ''} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => onChange(n)}>★</button>)}
  </div>;
}
