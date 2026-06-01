import PropTypes from 'prop-types';
import './ServiceCard.css';

function ServiceCard({ icon, title, description, price, onClick, variant = 'default' }) {
  if (variant === 'home') {
    const isInteractive = Boolean(onClick);

    const handleKeyDown = (event) => {
      if (!isInteractive) {
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    };

    return (
      <article
        className={`svc ${isInteractive ? 'svc--interactive' : ''}`}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
      >
        <div className="svc-icon">{icon}</div>
        <h3 className="svc-title">{title}</h3>
        <p className="svc-desc">{description}</p>
        <div className="svc-price">{price}</div>
      </article>
    );
  }

  return (
    <article className="service-card">
      <div className="service-card__icon">{icon}</div>
      <h3 className="service-card__title">{title}</h3>
      <p className="service-card__desc">{description}</p>
      <div className="service-card__price">{price}</div>
    </article>
  );
}

ServiceCard.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'home']),
};

export default ServiceCard;
