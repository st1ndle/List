import PropTypes from 'prop-types';
import SectionHeading from '../../components/site/SectionHeading';
import ServiceCard from '../../components/site/ServiceCard';
import './ServicesGridContainer.css';

function ServicesGridContainer({ title, services }) {
  return (
    <section className="block-container services-grid-container">
      <SectionHeading title={title} />
      <div className="services-grid-container__grid">
        {services.map((service) => (
          <ServiceCard key={service.title} {...service} />
        ))}
      </div>
    </section>
  );
}

ServicesGridContainer.propTypes = {
  title: PropTypes.string.isRequired,
  services: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      price: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default ServicesGridContainer;
