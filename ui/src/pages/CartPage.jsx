import ProductGridContainer from '../containers/blocks/ProductGridContainer';
import './Page.css';

const cartProducts = [{ name: 'Вино красное', brand: 'Fanagoria', price: '290 ₽', volume: '0.75 л' }];

function CartPage() {
  return (
    <main className="page-shell">
      <ProductGridContainer title="Корзина" products={cartProducts} />
    </main>
  );
}

export default CartPage;
