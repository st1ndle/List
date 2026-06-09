import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeading from '../features/site/SectionHeading';
import './ServicesPage.css';

function ServicesPage() {
  const navigate = useNavigate();
  const [palletRate, setPalletRate] = useState(32);
  const [palletCount, setPalletCount] = useState(10);
  const [days, setDays] = useState(30);

  const calculatedPrice = useMemo(() => {
    const total = Number(palletRate) * Math.max(1, Number(palletCount)) * Math.max(1, Number(days));
    return new Intl.NumberFormat('ru-RU').format(total);
  }, [palletRate, palletCount, days]);

  return (
    <main className="services-page">
      <section className="section">
        <SectionHeading
          variant="legacy"
          label="Расчёт стоимости"
          title="Калькулятор хранения"
          subtitle="Быстрый калькулятор для оценки стоимости ответственного хранения на нашем складе."
        />
        <div className="services-page__calculator" style={{ marginTop: '32px' }}>
          <div className="fg">
            <label className="flbl">Тип паллета</label>
            <div className="pallet-chips">
              <button
                type="button"
                className={`pallet-chip ${palletRate === 32 ? 'active' : ''}`}
                onClick={() => setPalletRate(32)}
              >
                Европаллет (32 ₽/сутки)
              </button>
              <button
                type="button"
                className={`pallet-chip ${palletRate === 36 ? 'active' : ''}`}
                onClick={() => setPalletRate(36)}
              >
                Финский/Амер. (36 ₽/сутки)
              </button>
            </div>
          </div>
          <div className="frow">
            <div className="fg">
              <label className="flbl" htmlFor="pal-cnt">Количество паллет</label>
              <input className="finp" type="number" id="pal-cnt" value={palletCount} min="1" onChange={(event) => setPalletCount(Number(event.target.value) || 1)} />
            </div>
            <div className="fg">
              <label className="flbl" htmlFor="pal-days">Количество дней</label>
              <input className="finp" type="number" id="pal-days" value={days} min="1" onChange={(event) => setDays(Number(event.target.value) || 1)} />
            </div>
          </div>
          <div className="services-page__calc-result">
            <div>
              <div className="services-page__calc-title">Стоимость хранения</div>
              <div className="services-page__calc-subtitle">без НДС</div>
            </div>
            <div className="services-page__calc-total">{calculatedPrice} ₽</div>
          </div>
          <button type="button" className="btn-solid services-page__calc-button" onClick={() => navigate('/contacts')}>Заказать точный расчёт</button>
        </div>
      </section>
    </main>
  );
}

export default ServicesPage;
