import PropTypes from 'prop-types';
import SectionHeading from '../site/SectionHeading';
import ProductCard from './ProductCard';
import './ProductGridContainer.css';

function ProductGridContainer({ title, products, cardVariant = 'default' }) {
  return (
    <section className="block-container product-grid-container">
      <SectionHeading title={title} />
      <div className="product-grid-container__grid">
        {products.map((product) => (
          <ProductCard key={product.id || `${product.brand}-${product.name}`} variant={cardVariant} {...product} />
        ))}
      </div>
    </section>
  );
}

ProductGridContainer.propTypes = {
  title: PropTypes.string.isRequired,
  products: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      brand: PropTypes.string.isRequired,
      price: PropTypes.string.isRequired,
      volume: PropTypes.string.isRequired,
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      category: PropTypes.string,
      description: PropTypes.string,
      emoji: PropTypes.string,
      badge: PropTypes.string,
      bgColor: PropTypes.string,
      catColor: PropTypes.string,
    }),
  ).isRequired,
  cardVariant: PropTypes.oneOf(['default', 'catalog']),
};

export default ProductGridContainer;
