import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { PhoneInput } from '../../components/ui/PhoneInput';
import useToastStore from '../../store/useToastStore';
import useAuthStore from '../../store/useAuthStore';
import './AuthFormContainer.css';

function AuthFormContainer() {
  const navigate = useNavigate();
  const [authTab, setAuthTab] = useState('l'); // 'l' for login, 'r' for register
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'

  // Login state
  const [lEmail, setLEmail] = useState('');
  const [lPhone, setLPhone] = useState('');
  const [lPass, setLPass] = useState('');

  // Register state
  const [rNm, setRNm] = useState('');
  const [rLn, setRLn] = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPh, setRPh] = useState('');
  const [rPass, setRPass] = useState('');
  const [rPass2, setRPass2] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const loginValue = loginMethod === 'email' ? lEmail.trim() : lPhone.trim();

    if (!loginValue || !lPass) {
      useToastStore.getState().showToast('⚠️', 'Заполните все поля');
      return;
    }

    try {
      await useAuthStore.getState().login({ login: loginValue, password: lPass });

      useToastStore.getState().showToast('👋', 'Добро пожаловать!');
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirect') || '/catalogue';
      navigate(redirectTo);
    } catch (err) {
      useToastStore.getState().showToast('⚠️', err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const name = rNm.trim();
    const lastName = rLn.trim();
    const email = rEmail.trim();
    const phone = rPh.trim();

    if (!name || (!email && !phone) || !rPass) {
      useToastStore.getState().showToast('⚠️', 'Заполните обязательные поля');
      return;
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      useToastStore.getState().showToast('⚠️', 'Укажите корректную почту');
      return;
    }
    if (rPass.length < 8) {
      useToastStore.getState().showToast('⚠️', 'Пароль — минимум 8 символов');
      return;
    }
    if (rPass !== rPass2) {
      useToastStore.getState().showToast('⚠️', 'Пароли не совпадают');
      return;
    }

    try {
      await useAuthStore.getState().register({
        firstName: name,
        lastName,
        email: email || null,
        phone: phone || null,
        password: rPass
      });

      useToastStore.getState().showToast('🎉', 'Регистрация успешна!');
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirect') || '/catalogue';
      navigate(redirectTo);
    } catch (err) {
      useToastStore.getState().showToast('⚠️', err.message);
    }
  };

  return (
    <div className="auth-card ani">
      <div className="auth-logo">ООО ЛиСТ</div>
      <div className="auth-sub2">Напитки оптом · Складское предприятие</div>
      <div className="auth-tabs" id="auth-main-tabs">
        <div
          className={`a-tab ${authTab === 'l' ? 'on' : ''}`}
          onClick={() => setAuthTab('l')}
        >
          Войти
        </div>
        <div
          className={`a-tab ${authTab === 'r' ? 'on' : ''}`}
          onClick={() => setAuthTab('r')}
        >
          Регистрация
        </div>
      </div>

      {authTab === 'l' ? (
        <form onSubmit={handleLogin} id="a-login">
          <div className="a-title">С возвращением!</div>
          <div className="a-hint">Введите данные вашего аккаунта</div>
          <div className="auth-tabs auth-tabs-sub">
            <div
              className={`a-tab a-tab-login ${loginMethod === 'email' ? 'on' : ''}`}
              onClick={() => setLoginMethod('email')}
            >
              Почта
            </div>
            <div
              className={`a-tab a-tab-login ${loginMethod === 'phone' ? 'on' : ''}`}
              onClick={() => setLoginMethod('phone')}
            >
              Телефон
            </div>
          </div>

          {loginMethod === 'email' ? (
            <div className="fg" id="l-email-wrap">
              <label className="flbl">Почта</label>
              <input
                className="finp"
                value={lEmail}
                onChange={(e) => setLEmail(e.target.value)}
                placeholder="name@company.ru"
              />
            </div>
          ) : (
            <PhoneInput
              label="Телефон"
              value={lPhone}
              onChange={(val) => setLPhone(val)}
            />
          )}

          <div className="fg">
            <label className="flbl">Пароль</label>
            <input
              className="finp"
              type="password"
              value={lPass}
              onChange={(e) => setLPass(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: '16px' }}>
            <span className="a-link" style={{ fontSize: '13px' }}>Забыли пароль?</span>
          </div>

          <Button variant="solid" type="submit" style={{ width: '100%', padding: '13px', fontSize: '15px', borderRadius: '12px' }}>
            Войти
          </Button>

          <div className="a-divider">
            <div className="a-div-line"></div>
            <div className="a-div-txt">или</div>
            <div className="a-div-line"></div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--ink3)' }}>
            Нет аккаунта? <span className="a-link" onClick={() => setAuthTab('r')}>Зарегистрироваться</span>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegister} id="a-reg">
          <div className="a-title">Создать аккаунт</div>
          <div className="a-hint">Заполните данные для регистрации</div>

          <div className="frow">
            <div className="fg">
              <label className="flbl">Имя</label>
              <input
                className="finp"
                value={rNm}
                onChange={(e) => setRNm(e.target.value)}
                placeholder="Иван"
              />
            </div>
            <div className="fg">
              <label className="flbl">Фамилия</label>
              <input
                className="finp"
                value={rLn}
                onChange={(e) => setRLn(e.target.value)}
                placeholder="Иванов"
              />
            </div>
          </div>

          <div className="fg">
            <label className="flbl">Почта</label>
            <input
              className="finp"
              value={rEmail}
              onChange={(e) => setREmail(e.target.value)}
              placeholder="name@company.ru"
            />
          </div>

          <div className="fg">
            <PhoneInput
              label="Телефон"
              value={rPh}
              onChange={(val) => setRPh(val)}
            />
          </div>

          <div className="fg">
            <label className="flbl">Пароль</label>
            <input
              className="finp"
              type="password"
              value={rPass}
              onChange={(e) => setRPass(e.target.value)}
              placeholder="Минимум 8 символов"
            />
          </div>

          <div className="fg">
            <label className="flbl">Подтверждение пароля</label>
            <input
              className="finp"
              type="password"
              value={rPass2}
              onChange={(e) => setRPass2(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button variant="solid" type="submit" style={{ width: '100%', padding: '13px', fontSize: '15px', borderRadius: '12px' }}>
            Зарегистрироваться
          </Button>

          <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--ink3)', marginTop: '16px' }}>
            Уже есть аккаунт? <span className="a-link" onClick={() => setAuthTab('l')}>Войти</span>
          </div>
        </form>
      )}
    </div>
  );
}

export default AuthFormContainer;
