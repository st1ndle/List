import React from 'react';
import PropTypes from 'prop-types';
import './Select.css';

export const Select = React.forwardRef(({ label, options = [], error, className = '', ...props }, ref) => {
  return (
    <div className={`ui-select-group ${error ? 'has-error' : ''} ${className}`}>
      {label && <label className="ui-select-label">{label}</label>}
      <div className="ui-select-wrapper">
        <select
          ref={ref}
          className="ui-select"
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="ui-select-arrow">▼</span>
      </div>
      {error && <span className="ui-select-error">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  error: PropTypes.string,
  className: PropTypes.string,
};
