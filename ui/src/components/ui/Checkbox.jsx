import React from 'react';
import PropTypes from 'prop-types';
import './Checkbox.css';

export const Checkbox = React.forwardRef(({ label, className = '', ...props }, ref) => {
  return (
    <label className={`ui-checkbox-container ${className}`}>
      <input
        type="checkbox"
        ref={ref}
        className="ui-checkbox-input"
        {...props}
      />
      <span className="ui-checkbox-custom"></span>
      {label && <span className="ui-checkbox-label">{label}</span>}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

Checkbox.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
};
