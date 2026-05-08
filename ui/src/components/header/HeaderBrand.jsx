import PropTypes from 'prop-types';

function HeaderBrand({ companyName, tagline }) {
  return (
    <div className="nav-brand">
      <div className="nav-logo">{companyName}</div>
      <div className="nav-tagline">{tagline}</div>
    </div>
  );
}

HeaderBrand.propTypes = {
  companyName: PropTypes.string.isRequired,
  tagline: PropTypes.string.isRequired,
};

export default HeaderBrand;
