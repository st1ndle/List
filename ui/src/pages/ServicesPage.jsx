import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeading from '../features/site/SectionHeading';
import ServiceCard from '../features/site/ServiceCard';
import './ServicesPage.css';

const services = [
  { icon: '🏭', title: 'Хранение', description: 'Напольное и стеллажное хранение товаров широкого спектра. Оптимальная температура и влажность. Склад категории А.', price: 'от 32 ₽ / пал. в сутки' },
  { icon: '🏗️', title: 'Погрузка / разгрузка', description: 'Погрузочно-разгрузочные работы механизированным способом или вручную в соответствии с характеристиками груза.', price: 'от 140 ₽ / паллет' },
  { icon: '📦', title: 'Комплектация', description: 'Сформированный заказ комплектуется указанными товарами и передаётся в службу доставки или на самовывоз.', price: '7 ₽ / шт. · 18 ₽ / короб' },
  { icon: '🏷️', title: 'Маркировка товара', description: 'Печать этикеток и нанесение маркировки на любую единицу товара согласно требованиям заказчика.', price: 'от 7 ₽ / этикетка' },
  { icon: '🎁', title: 'Опалечивание', description: 'Укладка товара на паллеты и фиксация стрейч-плёнкой при необходимости дополнительной защиты груза.', price: '250 ₽ / упаковка стрейч' },
  { icon: '🔄', title: 'Кросс-докинг', description: 'Перегрузка товара и краткосрочное хранение грузовыми местами без полной складской обработки.', price: 'от 180 ₽ / монопаллет' },
];

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
          label="Складские услуги"
          title={(
            <>
              Ответственное хранение
              <br />
              и обработка грузов
            </>
          )}
          subtitle="От 32 рублей за паллето-место в сутки. Склад категории А в Домодедово."
        />
        <div className="svcs-grid services-page__grid">
          {services.map((service) => (
            <ServiceCard key={service.title} variant="home" {...service} />
          ))}
        </div>
      </section>

      <section className="section section-alt">
        <SectionHeading variant="legacy" label="Как это работает" title="Работать с нами просто" />
        <div className="steps">
          <div className="step"><div className="step-num">1</div><div className="step-ttl">Приёмка товаров</div><div className="step-txt">Проверяем документы, количество, ассортимент и упаковку</div></div>
          <div className="step"><div className="step-num">2</div><div className="step-ttl">Сортировка</div><div className="step-txt">Сортируем по паллетам, бракованный товар — в спец. зону</div></div>
          <div className="step"><div className="step-num">3</div><div className="step-ttl">Хранение</div><div className="step-txt">Размещаем на складе, оформляем акт приёма-передачи</div></div>
          <div className="step"><div className="step-num">4</div><div className="step-ttl">Комплектация</div><div className="step-txt">Наносим штрих-коды, комплектуем заказы по запросу</div></div>
          <div className="step"><div className="step-num">5</div><div className="step-ttl">Выдача</div><div className="step-txt">Передаём на доставку нашей службой или самовывоз</div></div>
        </div>
      </section>

      <section className="section">
        <SectionHeading variant="legacy" label="Расчёт стоимости" title="Калькулятор хранения" />
        <div className="services-page__calculator">
          <div className="fg">
            <label className="flbl" htmlFor="pal-type">Тип паллета</label>
            <select
              className="finp"
              id="pal-type"
              value={palletRate}
              onChange={(event) => setPalletRate(Number(event.target.value))}
            >
              <option value={32}>Европаллет (32 ₽/сутки)</option>
              <option value={36}>Финский/Американский паллет (36 ₽/сутки)</option>
            </select>
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
