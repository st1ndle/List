import PropTypes from 'prop-types';
import SectionHeading from '../../components/site/SectionHeading';
import TariffCard from '../../components/site/TariffCard';
import './TariffGridContainer.css';

function TariffGridContainer({ title, tariffs }) {
  return (
    <section className="block-container tariff-grid-container">
      <SectionHeading title={title} />
      <div className="tariff-grid-container__grid">
        {tariffs.map((tariff) => (
          <TariffCard key={tariff.type} {...tariff} />
        ))}
      </div>
    </section>
  );
}

TariffGridContainer.propTypes = {
  title: PropTypes.string.isRequired,
  tariffs: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      load: PropTypes.string.isRequired,
      price: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default TariffGridContainer;
