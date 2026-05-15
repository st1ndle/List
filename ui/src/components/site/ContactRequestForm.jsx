import { useState } from 'react';
import { Button } from '../ui/Button';
import { PhoneInput } from '../ui/PhoneInput';
import './ContactRequestForm.css';

function ContactRequestForm() {
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="form-card">
      <div className="form-title">Форма обратной связи</div>
      <form onSubmit={handleSubmit}>
        <div className="fg">
          <label className="flbl" htmlFor="contacts-name">Ваше имя</label>
          <input className="finp" id="contacts-name" placeholder="Иван Иванов" required />
        </div>
        <PhoneInput
          label="Телефон"
          value={phone}
          onChange={setPhone}
          required
        />
        <div className="fg">
          <label className="flbl" htmlFor="contacts-message">Комментарий</label>
          <textarea
            className="finp"
            id="contacts-message"
            rows="3"
            placeholder="Ваш вопрос или пожелание..."
            style={{ resize: 'vertical' }}
          />
        </div>
        <p className="contact-request-form__privacy">
          Нажимая кнопку «Отправить», вы соглашаетесь на обработку персональных данных.
        </p>
        <Button variant="solid" type="submit" className="contact-request-form__submit">
          Отправить
        </Button>
      </form>
      {isSubmitted ? (
        <p className="contact-request-form__success">Спасибо! Мы свяжемся с вами в ближайшее время.</p>
      ) : null}
    </div>
  );
}

export default ContactRequestForm;
