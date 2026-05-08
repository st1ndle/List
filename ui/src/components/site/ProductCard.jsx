import PropTypes from 'prop-types';
import { Button } from '../ui/Button';
import './ProductCard.css';

function ProductCard({
  name,
  brand,
  price,
  volume,
  onAdd,
  variant = 'default',
  category,
  description,
  emoji,
  badge,
  bgColor,
  catColor,
}) {
  if (variant === 'catalog') {
    return (
      <article className="pc">
        <div className="pc-img" style={{ background: bgColor || 'rgba(26,74,107,.07)' }}>
          {badge ? <span className="pc-badge" style={{ background: catColor || '#1A4A6B', color: '#fff' }}>{badge}</span> : null}
          {emoji || '📦'}
        </div>
        <div className="pc-body">
          <div className="pc-cat" style={{ color: catColor || '#1A4A6B' }}>{category || 'Товар'}</div>
          <div className="pc-name">{name}</div>
          <div className="pc-brand">{brand}</div>
          <div className="pc-desc">{description || 'Описание скоро появится.'}</div>
          <div className="pc-foot">
            <div>
              <div className="pc-price" style={{ color: 'var(--green)' }}>{price}</div>
              <div className="pc-unit">{volume}</div>
            </div>
            <button type="button" className="btn-add" onClick={onAdd}>В корзину</button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="product-card">
      <div className="product-card__meta">{brand}</div>
      <h3 className="product-card__name">{name}</h3>
      <div className="product-card__volume">{volume}</div>
      <div className="product-card__bottom">
        <span className="product-card__price">{price}</span>
        <Button size="sm" variant="solid" onClick={onAdd}>В корзину</Button>
      </div>
    </article>
  );
}

ProductCard.propTypes = {
  name: PropTypes.string.isRequired,
  brand: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  volume: PropTypes.string.isRequired,
  onAdd: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'catalog']),
  category: PropTypes.string,
  description: PropTypes.string,
  emoji: PropTypes.string,
  badge: PropTypes.string,
  bgColor: PropTypes.string,
  catColor: PropTypes.string,
};
ProductCard.defaultProps = { onAdd: () => {} };

export default ProductCard;
