import PropTypes from 'prop-types';
import HeaderActions from './HeaderActions';
import HeaderBrand from './HeaderBrand';
import HeaderNav from './HeaderNav';
import './Header.css';

function Header({
  brand,
  navigationItems,
  activePath,
  phone,
  cartCount,
  isAuthenticated,
  onNavigate,
  onCartClick,
  onProfileClick,
  onLoginClick,
  onLogoutClick,
}) {
  return (
    <header className="header-shell">
      <nav className="navbar">
        <HeaderBrand companyName={brand.name} tagline={brand.tagline} />
        <HeaderNav
          items={navigationItems}
          activePath={activePath}
          onNavigate={onNavigate}
        />
        <HeaderActions
          phone={phone}
          cartCount={cartCount}
          isAuthenticated={isAuthenticated}
          onCartClick={onCartClick}
          onProfileClick={onProfileClick}
          onLoginClick={onLoginClick}
          onLogoutClick={onLogoutClick}
        />
      </nav>
    </header>
  );
}

Header.propTypes = {
  brand: PropTypes.shape({
    name: PropTypes.string.isRequired,
    tagline: PropTypes.string.isRequired,
  }).isRequired,
  navigationItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    }),
  ).isRequired,
  activePath: PropTypes.string.isRequired,
  phone: PropTypes.string.isRequired,
  cartCount: PropTypes.number.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onCartClick: PropTypes.func.isRequired,
  onProfileClick: PropTypes.func.isRequired,
  onLoginClick: PropTypes.func.isRequired,
  onLogoutClick: PropTypes.func.isRequired,
};

export default Header;
