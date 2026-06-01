import PropTypes from 'prop-types';
import './TariffCard.css';

function TariffCard({
  type,
  load,
  price,
  variant = 'default',
  hourlyPrice,
  features,
  featured = false,
  actionLabel,
  actionVariant = 'solid',
  onActionClick,
}) {
  if (variant === 'full') {
    return (
      <article className={`tar ${featured ? 'featured' : ''}`}>
        <div className="tar-type">{type}</div>
        <div className="tar-load">{load}</div>
        <div className="tar-price">{price}</div>
        {hourlyPrice ? <div className="tar-or">или</div> : null}
        {hourlyPrice ? <div className="tar-price2">{hourlyPrice}</div> : null}
        <ul className="tar-list">
          {(features || []).map((feature) => (
            <li className="tar-li" key={feature}>{feature}</li>
          ))}
        </ul>
        {actionLabel ? (
          <button
            type="button"
            className={actionVariant === 'ghost' ? 'btn-ghost tar__action' : 'btn-solid tar__action'}
            onClick={onActionClick}
          >
            {actionLabel}
          </button>
        ) : null}
      </article>
    );
  }

  return (
    <article className="tariff-card">
      <div className="tariff-card__type">{type}</div>
      <div className="tariff-card__load">{load}</div>
      <div className="tariff-card__price">{price}</div>
    </article>
  );
}

TariffCard.propTypes = {
  type: PropTypes.string.isRequired,
  load: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'full']),
  hourlyPrice: PropTypes.string,
  features: PropTypes.arrayOf(PropTypes.string),
  featured: PropTypes.bool,
  actionLabel: PropTypes.string,
  actionVariant: PropTypes.oneOf(['solid', 'ghost']),
  onActionClick: PropTypes.func,
};

export default TariffCard;
