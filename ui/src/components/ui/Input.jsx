import React from 'react';
import PropTypes from 'prop-types';
import './Input.css';

export const Input = React.forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={`ui-input-group ${error ? 'has-error' : ''} ${className}`}>
      {label && <label className="ui-input-label">{label}</label>}
      <input
        ref={ref}
        className="ui-input"
        {...props}
      />
      {error && <span className="ui-input-error">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
};
