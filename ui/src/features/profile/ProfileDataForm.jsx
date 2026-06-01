import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../components/ui/Button';
import { InputField, FormRow } from '../../components/ui/Form';
import { PhoneInput } from '../../components/ui/PhoneInput';
import useToastStore from '../../store/useToastStore';

function ProfileDataForm({ user, onSave }) {
  const [phone, setPhone] = useState(user.phone || '');
  const [firstName, setFirstName] = useState(user.name || '');
  const [lastName, setLastName] = useState(user.lastname || '');
  const [email, setEmail] = useState(user.email || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, we'd pass these values to onSave
    if (onSave) {
      onSave({ name: firstName, lastname: lastName, phone, email });
    } else {
      useToastStore.getState().showToast('✓', 'Данные сохранены');
    }
  };

  return (
    <form className="scard" onSubmit={handleSubmit}>
      <div className="scard-title" style={{ marginBottom: '24px' }}>Личные данные</div>
      
      <FormRow>
        <InputField 
          label="Имя" 
          value={firstName} 
          onChange={(e) => setFirstName(e.target.value)} 
          placeholder="Иван" 
        />
        <InputField 
          label="Фамилия" 
          value={lastName} 
          onChange={(e) => setLastName(e.target.value)} 
          placeholder="Иванов" 
        />
      </FormRow>
      
      <PhoneInput 
        label="Телефон" 
        value={phone} 
        onChange={setPhone} 
      />
      
      <InputField 
        label="Почта" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="name@company.ru" 
      />
      
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
