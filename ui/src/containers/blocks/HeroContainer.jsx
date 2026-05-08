import PropTypes from 'prop-types';
import HeroBanner from '../../components/site/HeroBanner';
import './HeroContainer.css';

function HeroContainer(props) {
  return (
    <div className="block-container hero-container">
      <HeroBanner {...props} />
    </div>
  );
}

HeroContainer.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onPrimaryClick: PropTypes.func,
  onSecondaryClick: PropTypes.func,
  primaryLabel: PropTypes.string,
  secondaryLabel: PropTypes.string,
  chip: PropTypes.string,
  titleLines: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      highlight: PropTypes.bool,
    }),
  ),
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      subtitle: PropTypes.string.isRequired,
      price: PropTypes.string.isRequired,
      onClick: PropTypes.func,
    }),
  ),
  badge: PropTypes.shape({
    prefix: PropTypes.string.isRequired,
    price: PropTypes.string.isRequired,
    suffix: PropTypes.string.isRequired,
  }),
};

export default HeroContainer;
