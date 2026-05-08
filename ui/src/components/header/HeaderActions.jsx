import PropTypes from 'prop-types';
import { Button, IconButton } from '../ui/Button';

function HeaderActions({
  phone,
  cartCount,
  isAuthenticated,
  onCartClick,
  onOrdersClick,
  onLoginClick,
  onLogoutClick,
}) {
  return (
    <div className="nav-right">
      <span className="nav-phone">{phone}</span>
      <IconButton
        ariaLabel="Корзина"
        variant="neutral"
        size="md"
        badge={cartCount}
        onClick={onCartClick}
      >
        🛒
      </IconButton>
      {isAuthenticated ? (
        <>
          <Button variant="ghost" size="sm" onClick={onOrdersClick}>
            Мои заказы
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogoutClick}>
            Выйти
          </Button>
        </>
      ) : (
        <Button variant="solid" size="sm" onClick={onLoginClick}>
          Войти
        </Button>
      )}
    </div>
  );
}

HeaderActions.propTypes = {
  phone: PropTypes.string.isRequired,
  cartCount: PropTypes.number.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  onCartClick: PropTypes.func.isRequired,
  onOrdersClick: PropTypes.func.isRequired,
  onLoginClick: PropTypes.func.isRequired,
  onLogoutClick: PropTypes.func.isRequired,
};

export default HeaderActions;
