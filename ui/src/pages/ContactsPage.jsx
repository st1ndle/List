import { useEffect } from 'react';
import SectionHeading from '../features/site/SectionHeading';
import ContactRequestForm from '../features/site/ContactRequestForm';
import useWarehouseStore from '../store/useWarehouseStore';
import './ContactsPage.css';

function ContactsPage() {
  const { warehouses, isLoading, fetchWarehouses } = useWarehouseStore();

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

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
                {isLoading ? (
                  <div>Загрузка складов...</div>
                ) : warehouses.length > 0 ? (
                  warehouses.map(w => (
                    <div className="loc-item" key={w.id}>
                      <div className="loc-name">{w.name}</div>
                      <div className="loc-addr">{w.address}</div>
                    </div>
                  ))
                ) : (
                  <div>Склады не найдены</div>
                )}
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
