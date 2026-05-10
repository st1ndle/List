import PropTypes from 'prop-types';
import { Button } from '../ui/Button';
import { InputField, FormRow } from '../ui/Form';

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
      
      <FormRow>
        <InputField label="Имя" defaultValue={user.name} placeholder="Иван" />
        <InputField label="Фамилия" defaultValue={user.lastname} placeholder="Иванов" />
      </FormRow>
      
      <InputField label="Телефон" defaultValue={user.phone} placeholder="+7 (___) ___-__-__" />
      
      <InputField label="Почта" defaultValue={user.email} placeholder="name@company.ru" />
      
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
