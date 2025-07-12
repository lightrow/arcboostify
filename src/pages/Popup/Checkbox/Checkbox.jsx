import React from 'react';
import './Checkbox.css';

export const Checkbox = ({ checked, onChange, label, ...props }) => {
  return (
    <label className="checkbox-container">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="checkbox-input"
        {...props}
      />
      <span className="checkbox-custom"></span>
      {label && <span className="checkbox-label">{label}</span>}
    </label>
  );
};