import PropTypes from 'prop-types';
import useSiteSettingsStore from '../../../store/useSiteSettingsStore';
import './SiteFooter.css';

function SiteFooter({ onNavigate }) {
  const getSetting = useSiteSettingsStore((state) => state.getSetting);
  const foundationYear = getSetting('stat_year', '1998');

  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div className="f-logo">ООО ЛиСТ</div>
          <div className="f-tagline">Напитки оптом · Складское предприятие</div>
          <p className="f-desc">
            Логистическая компания с {foundationYear} года. Хранение, обработка и доставка напитков по Москве и Московской области.
          </p>
        </div>
        <div>
          <div className="f-col-ttl">Каталог</div>
          <button type="button" className="f-lnk home-link-reset" onClick={() => onNavigate('/catalogue')}>Вино</button>
          <button type="button" className="f-lnk home-link-reset" onClick={() => onNavigate('/catalogue')}>Пиво</button>
          <button type="button" className="f-lnk home-link-reset" onClick={() => onNavigate('/catalogue')}>Газировки</button>
          <button type="button" className="f-lnk home-link-reset" onClick={() => onNavigate('/catalogue')}>Вода</button>
        </div>
        <div>
          <div className="f-col-ttl">Компания</div>
          <button type="button" className="f-lnk home-link-reset" onClick={() => onNavigate('/about')}>О компании</button>
          <button type="button" className="f-lnk home-link-reset" onClick={() => onNavigate('/services')}>Складские услуги</button>
          <button type="button" className="f-lnk home-link-reset" onClick={() => onNavigate('/tariffs')}>Тарифы</button>
          <button type="button" className="f-lnk home-link-reset" onClick={() => onNavigate('/contacts')}>Контакты</button>
          <button type="button" className="f-lnk home-link-reset" onClick={() => onNavigate('/contacts')}>Политика персданных</button>
        </div>
        <div>
          <div className="f-col-ttl">Контакты</div>
          <span className="f-lnk">📞 +7 (495) 229-40-05</span>
          <span className="f-lnk">📍 Домодедово, тер. Триколор, 11</span>
          <span className="f-lnk">📞 +7 (4872) 25-14-07</span>
          <span className="f-lnk">📍 Тула, ул. Луначарского, 76</span>
          <span className="f-lnk">📍 Рязань, ул. Ряжское шоссе, 20</span>
        </div>
      </div>
      <div className="f-bottom">
        <div className="f-copy">© 2024 ООО ЛиСТ. Все права защищены.</div>
        <div className="f-ogrn">3PL · FMCG · Складская логистика</div>
      </div>
    </footer>
  );
}

SiteFooter.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};

export default SiteFooter;
