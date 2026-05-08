import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/useCartStore';
import ApiStorage from '../api/ApiStorage';
import './Page.css';

function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, clearCart } = useCartStore();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        const response = await ApiStorage.catalog.getProducts();
        if (isMounted) {
          setProducts(Array.isArray(response) ? response : []);
        }
      } catch (err) {
        console.error('Ошибка при загрузке товаров для корзины:', err);
        if (isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const cartEntries = useMemo(() => {
    return Object.entries(items).map(([id, quantity]) => {
      const product = products.find((p) => String(p.id) === String(id));
      return { id, quantity, product };
    });
  }, [items, products]);

  const totalSum = useMemo(() => {
    return cartEntries.reduce((sum, entry) => {
      const price = entry.product ? Number(entry.product.price) || 0 : 0;
      return sum + price * entry.quantity;
    }, 0);
  }, [cartEntries]);

  const totalItemsCount = useMemo(() => {
    return cartEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  }, [cartEntries]);

  if (isLoading) {
    return (
      <main className="cart-page">
        <div style={{ padding: '36px 48px' }}>Загрузка корзины...</div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div style={{ padding: '36px 48px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ cursor: 'pointer', color: 'var(--ink3)', fontSize: '14px' }} onClick={() => navigate(-1)}>
          ← Назад
        </span>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '48px', letterSpacing: '.5px' }}>
          Корзина
        </h1>
      </div>
      
      <div id="cart-content" style={{ padding: '0 0' }}>
        {cartEntries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <div className="empty-ttl">Корзина пуста</div>
            <p style={{ marginBottom: '28px', color: 'var(--ink3)' }}>Добавьте товары из каталога</p>
            <button
              className="btn-solid"
              style={{ padding: '12px 32px', fontSize: '15px', borderRadius: '10px' }}
              onClick={() => navigate('/catalogue')}
            >
              Открыть каталог
            </button>
          </div>
        ) : (
          <div className="clayout">
            <div className="cart-list">
              {cartEntries.map(({ id, quantity, product }) => {
                if (!product) {
                  return (
                    <div className="ci" key={id}>
                      <div className="ci-emoji">📦</div>
                      <div className="ci-info">
                        <div className="ci-name">Товар недоступен</div>
                        <div className="ci-meta">ID: {id}</div>
                      </div>
                      <div className="qty-wrap">
                        <button type="button" className="qb" onClick={() => updateQuantity(id, -1)}>−</button>
                        <span className="qn">{quantity}</span>
                        <button type="button" className="qb" onClick={() => updateQuantity(id, 1)}>+</button>
                      </div>
                      <div className="ci-price">—</div>
                      <button type="button" className="ci-del" onClick={() => removeFromCart(id)} aria-label="Удалить">✕</button>
                    </div>
                  );
                }
                const priceVal = Number(product.price) || 0;
                return (
                  <div className="ci" key={id}>
                    <div className="ci-emoji">{product.emoji || '📦'}</div>
                    <div className="ci-info">
                      <div className="ci-name">{product.name}</div>
                      <div className="ci-meta">
                        {product.brand} · {product.unit_name || '1 шт.'} · {priceVal}₽/шт.
                      </div>
                    </div>
                    <div className="qty-wrap">
                      <button type="button" className="qb" onClick={() => updateQuantity(id, -1)}>−</button>
                      <span className="qn">{quantity}</span>
                      <button type="button" className="qb" onClick={() => updateQuantity(id, 1)}>+</button>
                    </div>
                    <div className="ci-price">{priceVal * quantity}₽</div>
                    <button type="button" className="ci-del" onClick={() => removeFromCart(id)} aria-label="Удалить">✕</button>
                  </div>
                );
              })}
            </div>
            
            <div className="csum">
              <div className="csum-title">Итого</div>
              <div className="crow">
                <span className="crow-lbl">Позиций</span>
                <span className="crow-val">{cartEntries.length} шт.</span>
              </div>
              <div className="crow">
                <span className="crow-lbl">Товаров</span>
                <span className="crow-val">{totalItemsCount} шт.</span>
              </div>
              <div className="crow">
                <span className="crow-lbl">Сумма</span>
                <span className="crow-total">{totalSum}₽</span>
              </div>
              <button type="button" className="btn-full btn-full-main" onClick={() => navigate('/checkout')}>
                Оформить заказ →
              </button>
              <button
                type="button"
                className="btn-full btn-full-out"
                style={{ marginTop: '8px' }}
                onClick={() => navigate('/catalogue')}
              >
                Продолжить покупки
              </button>
              <button type="button" className="btn-full btn-full-danger" onClick={clearCart}>
                Очистить корзину
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default CartPage;
