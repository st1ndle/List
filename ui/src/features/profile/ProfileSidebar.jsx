import PropTypes from 'prop-types';
import './ProfileSidebar.css';

function ProfileSidebar({ user, activeSection, onSectionChange }) {
  const getInitials = () => {
    const first = user.name ? user.name[0] : '';
    const last = user.lastname ? user.lastname[0] : '';
    return (first + last).toUpperCase() || 'ИИ';
  };

  return (
    <aside className="prof-side">
      <div className="p-avatar">
        {getInitials()}
      </div>
      <div className="p-name">{user.name} {user.lastname}</div>
      <div className="p-phone">{user.phone || '+7 (495) 000-00-00'}</div>
      
      <nav className="smenu">
        <div 
          className={`sitem ${activeSection === 'data' ? 'on' : ''}`}
          onClick={() => onSectionChange('data')}
        >
          👤 Личные данные
        </div>
        <div 
          className={`sitem ${activeSection === 'orders' ? 'on' : ''}`}
          onClick={() => onSectionChange('orders')}
        >
          📦 Мои заказы
        </div>
        <div 
          className={`sitem ${activeSection === 'security' ? 'on' : ''}`}
          onClick={() => onSectionChange('security')}
        >
          🔒 Безопасность
        </div>
      </nav>
    </aside>
  );
}

ProfileSidebar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    lastname: PropTypes.string,
    phone: PropTypes.string,
  }).isRequired,
  activeSection: PropTypes.oneOf(['data', 'orders', 'security']).isRequired,
  onSectionChange: PropTypes.func.isRequired,
};

export default ProfileSidebar;
