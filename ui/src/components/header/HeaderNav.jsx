import PropTypes from 'prop-types';

function HeaderNavItem({ label, isActive, onClick }) {
  return (
    <button
      type="button"
      className={`nav-lnk ${isActive ? 'on' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

HeaderNavItem.propTypes = {
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

function HeaderNav({ items, activePath, onNavigate }) {
  return (
    <div className="nav-links">
      {items.map((item) => (
        <HeaderNavItem
          key={item.path}
          label={item.label}
          isActive={activePath === item.path}
          onClick={() => onNavigate(item.path)}
        />
      ))}
    </div>
  );
}

HeaderNav.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    }),
  ).isRequired,
  activePath: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default HeaderNav;
