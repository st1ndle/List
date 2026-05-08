import PropTypes from 'prop-types';
import './Button.css';

const LEGACY_SIZE_MAP = {
  small: 'sm',
  medium: 'md',
  large: 'lg',
};

export const Button = ({
  variant,
  size = 'md',
  fullWidth = false,
  active = false,
  children,
  label,
  type = 'button',
  className = '',
  primary = false,
  backgroundColor = null,
  ...props
}) => {
  const resolvedVariant = variant || (primary ? 'solid' : 'outline');
  const resolvedSize = LEGACY_SIZE_MAP[size] || size;
  const content = children || label;

  return (
    <button
      type={type}
      className={[
        'ui-btn',
        `ui-btn--${resolvedVariant}`,
        `ui-btn--${resolvedSize}`,
        fullWidth ? 'ui-btn--full' : '',
        active ? 'is-active' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={backgroundColor && { backgroundColor }}
      {...props}
    >
      {content}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['solid', 'outline', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  active: PropTypes.bool,
  children: PropTypes.node,
  label: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  primary: PropTypes.bool,
  backgroundColor: PropTypes.string,
  onClick: PropTypes.func,
};

export const IconButton = ({
  variant = 'neutral',
  size = 'md',
  badge = null,
  ariaLabel,
  children,
  type = 'button',
  className = '',
  ...props
}) => (
  <button
    type={type}
    aria-label={ariaLabel}
    className={['ui-icon-btn', `ui-icon-btn--${variant}`, `ui-icon-btn--${size}`, className]
      .filter(Boolean)
      .join(' ')}
    {...props}
  >
    <span className="ui-icon-btn__icon">{children}</span>
    {badge !== null && badge !== undefined && badge !== 0 ? (
      <span className="ui-icon-btn__badge">{badge}</span>
    ) : null}
  </button>
);

IconButton.propTypes = {
  variant: PropTypes.oneOf(['neutral', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ariaLabel: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export const FilterChip = ({
  active = false,
  tone = 'default',
  children,
  type = 'button',
  className = '',
  ...props
}) => (
  <button
    type={type}
    className={[
      'ui-chip',
      `ui-chip--${tone}`,
      active ? 'is-active' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    aria-pressed={active}
    {...props}
  >
    {children}
  </button>
);

FilterChip.propTypes = {
  active: PropTypes.bool,
  tone: PropTypes.oneOf(['default', 'wine', 'beer', 'water', 'soda']),
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  onClick: PropTypes.func,
};
