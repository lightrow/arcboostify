import './Range.css';
import React from 'react';

export const Range = ({ value, onChange, min, max, step = 0.01 }) => {
  return (
    <div className="range-container">
      <span className="range-value">{value}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
