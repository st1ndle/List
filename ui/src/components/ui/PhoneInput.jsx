import { useState } from 'react';
import PropTypes from 'prop-types';
import './PhoneInput.css';

const REGIONS = [
  { code: 'RU', prefix: '7', label: 'РФ', flag: '🇷🇺', mask: '(###)-###-##-##', digits: 10 },
  { code: 'BY', prefix: '375', label: 'РБ', flag: '🇧🇾', mask: '(##)-###-##-##', digits: 9 },
  { code: 'KZ', prefix: '7', label: 'РК', flag: '🇰🇿', mask: '(###)-###-##-##', digits: 10 }
];

export const PhoneInput = ({ value, onChange, label, error, className = '', ...props }) => {
  const [region, setRegion] = useState(REGIONS[0]);

  const formatPhoneNumber = (digits, mask) => {
    if (!digits) return '';
    let result = '';
    let digitIndex = 0;
    const d = digits.split('');
    
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === '#') {
        result += d[digitIndex] || '_';
        digitIndex++;
      } else {
        result += mask[i];
      }
    }
    
    return result;
  };

  const handleChange = (e) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, '').slice(0, region.digits);
    
    if (onChange) {
      onChange(region.prefix + digits);
    }
  };

  const digitsOnly = value ? value.replace(new RegExp(`^${region.prefix}`), '').slice(0, region.digits) : '';
  const displayValue = digitsOnly ? formatPhoneNumber(digitsOnly, region.mask) : '';

  return (
    <div className={`ui-phone-group ${error ? 'has-error' : ''} ${className}`}>
      {label && <label className="ui-phone-label">{label}</label>}
      <div className="ui-phone-wrapper">
        <div className="ui-phone-region">
          <select 
            className="ui-phone-select"
            value={region.code}
            onChange={(e) => {
              const newRegion = REGIONS.find(r => r.code === e.target.value);
              setRegion(newRegion);
              // When region changes, we might want to clear or adjust the number
              if (onChange) {
                onChange(newRegion.prefix + digitsOnly.slice(0, newRegion.digits));
              }
            }}
          >
            {REGIONS.map(r => (
              <option key={r.code} value={r.code}>
                {r.flag} {r.label}
              </option>
            ))}
          </select>
          <span className="ui-phone-prefix">+{region.prefix}</span>
        </div>
        <input
          type="text"
          className="ui-phone-input"
          value={displayValue}
          onChange={handleChange}
          placeholder={region.mask.replace(/#/g, '9')}
          {...props}
        />
      </div>
      {error && <span className="ui-phone-error">{error}</span>}
    </div>
  );
};

PhoneInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
};
