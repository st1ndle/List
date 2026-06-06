import PropTypes from 'prop-types';
import { Button } from '../../components/ui/Button';
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
  stock = 999999,
}) {
  const { items, addToCart, updateQuantity } = useCartStore();
  const quantity = items[id] || 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (quantity < stock) {
      if (onAdd) onAdd();
      addToCart(id, stock);
    }
  };

  const handleUpdate = (e, delta) => {
    e.stopPropagation();
    updateQuantity(id, delta, stock);
  };

  const renderAction = () => {
    if (stock === 0) {
      return <span style={{ color: 'var(--red)', fontSize: '13px', fontWeight: 600 }}>Нет в наличии</span>;
    }
    if (quantity > 0) {
      const isMaxLimit = quantity >= stock;
      return (
        <div className="qty-wrap" onClick={(e) => e.stopPropagation()}>
          <button className="qb" onClick={(e) => handleUpdate(e, -1)}>−</button>
          <span className="qn">{quantity}</span>
          <button 
            className="qb" 
            onClick={(e) => handleUpdate(e, 1)} 
            disabled={isMaxLimit}
            style={isMaxLimit ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
          >
            +
          </button>
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
          <div className="pc-stock-info" style={{ fontSize: '11px', marginBottom: '8px', color: stock === 0 ? 'var(--red)' : stock < 10 ? 'var(--gold)' : 'var(--ink3)', fontWeight: stock < 10 ? 600 : 400 }}>
            {stock === 0 ? 'Нет в наличии' : stock < 10 ? `Осталось мало: ${stock} шт.` : `В наличии: ${stock} шт.`}
          </div>
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
      {stock !== 999999 && (
        <div style={{ fontSize: '11px', color: stock === 0 ? 'var(--red)' : stock < 10 ? 'var(--gold)' : 'var(--ink3)', marginBottom: '8px', fontWeight: stock < 10 ? 600 : 400 }}>
          {stock === 0 ? 'Нет в наличии' : stock < 10 ? `Осталось мало: ${stock} шт.` : `В наличии: ${stock} шт.`}
        </div>
      )}
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
  stock: PropTypes.number,
};
ProductCard.defaultProps = { onAdd: () => {}, stock: 999999 };

export default ProductCard;
