import { Button } from '../../components/ui/Button';
import SectionHeading from '../../components/site/SectionHeading';
import './AuthFormContainer.css';

function AuthFormContainer() {
  return (
    <section className="block-container auth-form-container">
      <SectionHeading title="Вход" subtitle="Форма авторизации" />
      <form className="auth-form-container__form">
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Пароль" />
        <Button variant="solid" type="submit">Войти</Button>
      </form>
    </section>
  );
}

export default AuthFormContainer;
