import PropTypes from 'prop-types';
import { Button } from '../ui/Button';

function ProfileDataForm({ user, onSave }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave();
    } else {
      alert('✓ Данные сохранены');
    }
  };

  return (
    <form className="scard" onSubmit={handleSubmit}>
      <div className="scard-title" style={{ marginBottom: '24px' }}>Личные данные</div>
      
      <div className="frow">
        <div className="fg">
          <label className="flbl">Имя</label>
          <input className="finp" defaultValue={user.name} placeholder="Иван" />
        </div>
        <div className="fg">
          <label className="flbl">Фамилия</label>
          <input className="finp" defaultValue={user.lastname} placeholder="Иванов" />
        </div>
      </div>
      
      <div className="fg">
        <label className="flbl">Телефон</label>
        <input className="finp" defaultValue={user.phone} placeholder="+7 (___) ___-__-__" />
      </div>
      
      <div className="fg">
        <label className="flbl">Почта</label>
        <input className="finp" defaultValue={user.email} placeholder="name@company.ru" />
      </div>
      
      <Button variant="solid" type="submit" style={{ padding: '12px 24px', fontSize: '14px', borderRadius: '10px' }}>
        Сохранить изменения
      </Button>
    </form>
  );
}

ProfileDataForm.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    lastname: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  onSave: PropTypes.func,
};

export default ProfileDataForm;
