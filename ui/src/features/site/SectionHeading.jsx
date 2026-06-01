import PropTypes from 'prop-types';
import './SectionHeading.css';

function SectionHeading({
  label,
  title,
  subtitle,
  align = 'left',
  variant = 'default',
  className = '',
}) {
  if (variant === 'legacy') {
    return (
      <div
        className={['sec-head', className].filter(Boolean).join(' ')}
        style={align === 'center' ? { textAlign: 'center' } : undefined}
      >
        {label ? <div className="sec-label">{label}</div> : null}
        <h2 className="sec-title">{title}</h2>
        {subtitle ? <p className="sec-sub">{subtitle}</p> : null}
      </div>
    );
  }

  return (
    <div className={['section-heading', `section-heading--${align}`, className].filter(Boolean).join(' ')}>
      {label ? <div className="section-heading__label">{label}</div> : null}
      <h2 className="section-heading__title">{title}</h2>
      {subtitle ? <p className="section-heading__subtitle">{subtitle}</p> : null}
    </div>
  );
}

SectionHeading.propTypes = {
  label: PropTypes.string,
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.string,
  align: PropTypes.oneOf(['left', 'center']),
  variant: PropTypes.oneOf(['default', 'legacy']),
  className: PropTypes.string,
};

export default SectionHeading;
