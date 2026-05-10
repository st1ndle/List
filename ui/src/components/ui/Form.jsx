import PropTypes from 'prop-types';
import './Form.css';

export function InputField({ label, ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input className="form-input" {...props} />
    </div>
  );
}

InputField.propTypes = {
  label: PropTypes.string,
};

export function FormRow({ children }) {
  return <div className="form-row">{children}</div>;
}

FormRow.propTypes = {
  children: PropTypes.node.isRequired,
};
