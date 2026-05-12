import React from 'react';
import PropTypes from 'prop-types';
import './ColorPicker.css';

export const ColorPicker = ({ label, value, onChange, className = '', ...props }) => {
  return (
    <div className={`ui-color-picker-group ${className}`}>
      {label && <label className="ui-color-picker-label">{label}</label>}
      <div className="ui-color-picker-wrapper">
        <div className="ui-color-picker-preview" style={{ backgroundColor: value || '#ffffff' }}></div>
        <input
          type="color"
          value={value || '#ffffff'}
          onChange={onChange}
          className="ui-color-picker-input"
          {...props}
        />
        <span className="ui-color-picker-value">{value || '#ffffff'}</span>
      </div>
    </div>
  );
};

ColorPicker.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};
