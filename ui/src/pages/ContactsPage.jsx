import SectionHeading from '../components/site/SectionHeading';
import ContactRequestForm from '../components/site/ContactRequestForm';
import './ContactsPage.css';

function ContactsPage() {
  return (
    <main className="contacts-page">
      <section className="section">
        <SectionHeading variant="legacy" label="Контакты" title="Свяжитесь с нами" />

        <div className="contacts-grid contacts-page__grid">
          <div>
            <div className="contact-block">
              <div className="cb-label">Телефон (Москва)</div>
              <div className="cb-val">+7 (495) 229-40-05</div>
            </div>
            <div className="contact-block">
              <div className="cb-label">Телефон (Тула)</div>
              <div className="cb-val">+7 (4872) 25-14-07</div>
            </div>
            <div className="contact-block">
              <div className="cb-label">Адреса складов</div>
              <div className="loc-list">
                <div className="loc-item"><div className="loc-name">Главный склад</div><div className="loc-addr">Домодедово, территория Триколор, 11</div></div>
                <div className="loc-item"><div className="loc-name">Тула (склад 1)</div><div className="loc-addr">ул. Щегловская Засека, д. 31А</div></div>
                <div className="loc-item"><div className="loc-name">Тула (склад 2)</div><div className="loc-addr">ул. Луначарского, дом 76</div></div>
                <div className="loc-item"><div className="loc-name">Рязань</div><div className="loc-addr">ул. Ряжское шоссе, д. 20</div></div>
                <div className="loc-item"><div className="loc-name">Истра</div><div className="loc-addr">д. Покровское, Центральная улица, 27 стр.2</div></div>
              </div>
            </div>
          </div>

          <ContactRequestForm />
        </div>
      </section>
    </main>
  );
}

export default ContactsPage;
