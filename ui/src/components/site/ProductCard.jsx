import PropTypes from 'prop-types';
import { Button } from '../ui/Button';
import useCartStore from '../../store/useCartStore';
import './ProductCard.css';

function ProductCard({
  id,
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
  const { items, addToCart, updateQuantity } = useCartStore();
  const quantity = items[id] || 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (onAdd) onAdd();
    addToCart(id);
  };

  const handleUpdate = (e, delta) => {
    e.stopPropagation();
    updateQuantity(id, delta);
  };

  const renderAction = () => {
    if (quantity > 0) {
      return (
        <div className="qty-wrap" onClick={(e) => e.stopPropagation()}>
          <button className="qb" onClick={(e) => handleUpdate(e, -1)}>−</button>
          <span className="qn">{quantity}</span>
          <button className="qb" onClick={(e) => handleUpdate(e, 1)}>+</button>
        </div>
      );
    }
    if (variant === 'catalog') {
      return <button type="button" className="btn-add" onClick={handleAdd}>В корзину</button>;
    }
    return <Button size="sm" variant="solid" onClick={handleAdd}>В корзину</Button>;
  };

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
            {renderAction()}
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
        {renderAction()}
      </div>
    </article>
  );
}

ProductCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
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
