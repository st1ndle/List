import { useNavigate } from 'react-router-dom';
import SectionHeading from '../components/site/SectionHeading';
import TariffCard from '../components/site/TariffCard';
import './TariffsPage.css';

const tariffs = [
  {
    type: 'Малотоннажный транспорт',
    load: 'до 5 тонн',
    price: '24 ₽ / км',
    hourlyPrice: '2 300 ₽ / час',
    features: [
      'До 5 тонн грузоподъёмность',
      'До 21.4 м³ объём кузова',
      'До 10 европаллет',
      'Минимум 8 часов работы',
      'Идеально для малого бизнеса',
    ],
    featured: true,
    actionVariant: 'solid',
  },
  {
    type: 'Крупнотоннажный транспорт',
    load: 'до 20 тонн',
    price: '45 ₽ / км',
    hourlyPrice: '4 000 ₽ / час',
    features: [
      'До 20 тонн грузоподъёмность',
      'До 82 м³ объём кузова',
      'До 32 европаллет',
      'Минимум 8 часов работы',
      'Для крупных партий',
    ],
    featured: false,
    actionVariant: 'ghost',
  },
];

function TariffsPage() {
  const navigate = useNavigate();

  return (
    <main className="tariffs-page">
      <section className="section">
        <SectionHeading
          variant="legacy"
          label="Тарифы"
          title="Тарифы на грузоперевозки"
          subtitle="Доставка «от двери до двери» по Москве и Московской области. Собственный автопарк из 120 единиц транспорта."
        />

        <div className="tar-grid tariffs-page__grid">
          {tariffs.map((tariff) => (
            <TariffCard
              key={tariff.type}
              variant="full"
              type={tariff.type}
              load={tariff.load}
              price={tariff.price}
              hourlyPrice={tariff.hourlyPrice}
              features={tariff.features}
              featured={tariff.featured}
              actionLabel="Заказать перевозку"
              actionVariant={tariff.actionVariant}
              onActionClick={() => navigate('/contacts')}
            />
          ))}
        </div>

        <div className="tariffs-page__note">
          <div className="tariffs-page__note-icon">💡</div>
          <div>
            <div className="tariffs-page__note-title">Сборные грузы</div>
            <div className="tariffs-page__note-text">
              Также доступна доставка сборными грузами со склада ответственного хранения. Позволяет уменьшить тариф и снимает ограничения на минимальный объём заказа. Уточняйте условия у менеджера.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default TariffsPage;
