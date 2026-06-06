import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import SectionHeading from '../features/site/SectionHeading';
import ServiceCard from '../features/site/ServiceCard';
import HeroContainer from '../features/site/HeroContainer';
import ApiStorage from '../api/ApiStorage';
import useSiteSettingsStore from '../store/useSiteSettingsStore';
import './HomePage.css';


const fallbackHeroCategories = [
  { icon: '🍷', name: 'Вино', subtitle: 'Красное, белое, розовое, игристое', price: 'от 290₽' },
  { icon: '🍺', name: 'Пиво', subtitle: 'Светлое, тёмное, крафт', price: 'от 85₽' },
  { icon: '🥤', name: 'Газировки', subtitle: 'Лимонады, соки, энергетики', price: 'от 55₽' },
  { icon: '💧', name: 'Вода', subtitle: 'Газированная и негазированная', price: 'от 35₽' },
];

const services = [
  {
    icon: '🏭',
    title: 'Ответственное хранение',
    description: 'Напольное и стеллажное хранение с соблюдением оптимальной температуры и влажности. Склад категории А в Домодедово.',
    price: 'от 32 ₽ / пал. в сутки',
  },
  {
    icon: '📦',
    title: 'Комплектация и маркировка',
    description: 'Комплектуем заказы, наносим штрих-коды и маркировку по требованиям заказчика. Передача в службу доставки или самовывоз.',
    price: 'от 7 ₽ / шт.',
  },
  {
    icon: '🚛',
    title: 'Доставка грузов',
    description: 'Доставка «от двери до двери» по Москве и Московской области. 120 единиц транспорта от малотоннажного до крупнотоннажного.',
    price: 'от 18 000 ₽ / 5 тонн',
  },
  {
    icon: '🔄',
    title: 'Кросс-докинг',
    description: 'Перегрузка товара и краткосрочное хранение грузовыми местами. Минимальные сроки обработки.',
    price: 'от 180 ₽ / монопаллет',
  },
  {
    icon: '🏗️',
    title: 'Погрузка / разгрузка',
    description: 'Механизированным способом или вручную, в соответствии с характеристиками груза.',
    price: 'от 140 ₽ / паллет',
  },
  {
    icon: '📋',
    title: 'Опалечивание',
    description: 'Укладка товара на паллеты и фиксация стрейч-плёнкой для безопасной транспортировки.',
    price: '250 ₽ / упаковка',
  },
];

const clients = [
  'Anadolu Efes',
  'Балтика',
  'Heineken',
  'Coca-Cola HBC',
  'AB InBev',
  'Diageo',
  'Фанагория',
  'Абрау-Дюрсо',
  'Red Bull',
];

function HomePage() {
  const navigate = useNavigate();
  const [heroCategories, setHeroCategories] = useState(fallbackHeroCategories);
  const { fetchSettings, getSetting } = useSiteSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    let isMounted = true;

    const loadLowestPrices = async () => {
      try {
        const response = await ApiStorage.catalog.getLowestPrices(undefined, 4);
        const categories = Array.isArray(response)
          ? response
          : (Array.isArray(response?.data) ? response.data : []);

        const mapped = categories
          .map((item) => ({
            icon: item.category_icon || '📦',
            name: item.category_name,
            subtitle: 'Минимальная цена в категории',
            price: `от ${Math.trunc(Number(item.min_price) || 0)}₽`,
          }))
          .sort((a, b) => a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' }));

        if (isMounted && mapped.length > 0) {
          setHeroCategories(mapped);
        }
      } catch (error) {
        console.error('Не удалось загрузить минимальные цены категорий:', error);
      }
    };

    loadLowestPrices();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="home-page">
      <HeroContainer
        title="НАПИТКИ ДЛЯ ВАШЕГО БИЗНЕСА"
        titleLines={[
          { text: 'НАПИТКИ' },
          { text: 'ДЛЯ' },
          { text: 'ВАШЕГО', highlight: true },
          { text: 'БИЗНЕСА' },
        ]}
        chip={`⬡ Складское предприятие · С ${getSetting('stat_year', '1998')} года`}
        description="ООО ЛиСТ — дистрибьюция и оптовая торговля напитками. Вино, пиво, газировки и вода со склада в Домодедово. Самовывоз и доставка по Москве и МО."
        primaryLabel="Открыть каталог"
        secondaryLabel="Получить консультацию"
        onPrimaryClick={() => navigate('/catalogue')}
        onSecondaryClick={() => navigate('/contacts')}
        stats={[
          { value: '450+', label: 'Позиций в каталоге' },
          { value: getSetting('stat_pallets', '17К'), label: 'Паллетомест на складе' },
          { value: getSetting('stat_transport', '120'), label: 'Единиц транспорта' },
        ]}
        categories={heroCategories.map((category) => ({
          ...category,
          onClick: () => navigate('/catalogue'),
        }))}
        badge={{ prefix: 'от', price: '32₽', suffix: 'сутки/пал.' }}
      />

      <section className="section">a
        <div className="about-grid">
          <div>
            <SectionHeading variant="legacy" label="О компании" title={`В режиме нон-стоп с ${getSetting('stat_year', '1998')} года`} />
            <p className="home-about__paragraph">
              Компания успешно функционирует на рынке с {getSetting('stat_year', '1998')} года. В начале пути специализировалась на дистрибуции для крупных оптовых клиентов. Первым якорным клиентом стала международная группа <strong>Anadolu Efes</strong>.
            </p>
            <p className="home-about__paragraph home-about__paragraph--spaced">
              Сегодня ежедневно обрабатывается, принимается на хранение и доставляется более чем по <strong>2 000 адресов</strong> Москвы и МО порядка <strong>500 тонн грузов</strong>. В штате — 150 профессионалов.
            </p>
            <Button
              variant="solid" a
              size="md"
              className="home-about__button"
              onClick={() => navigate('/about')}
            >
              Читать подробнее →
            </Button>
          </div>

          <div className="about-visual">
            <div className="av-card">
              <div className="av-num">{getSetting('stat_pallets', '17К')}</div>
              <div className="av-lbl">паллетомест</div>
            </div>
            <div className="av-card">
              <div className="av-num">{getSetting('stat_transport', '120')}</div>
              <div className="av-lbl">единиц транспорта</div>
            </div>
            <div className="av-card">
              <div className="av-num">{getSetting('stat_employees', '150')}</div>
              <div className="av-lbl">сотрудников</div>
            </div>
            <div className="av-card">
              <div className="av-num">{getSetting('stat_warehouse_class', 'А')}</div>
              <div className="av-lbl">класс склада</div>
            </div>
            <div className="av-card av-card-dark">
              <div className="av-num">{getSetting('stat_daily_cargo', '500 тонн / день')}</div>
              <div className="av-lbl">ежедневный оборот грузов</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <SectionHeading
          variant="legacy"
          label="Наши услуги"
          title="Полный комплекс логистики"
          subtitle="Всё необходимое для хранения, обработки и доставки ваших грузов под одной крышей."
        />
        <div className="svcs-grid">
          {services.map((service) => (
            <ServiceCard
              key={service.title}
              variant="home"
              {...service}
              onClick={() => navigate('/services')}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          variant="legacy"
          label="Клиенты"
          title="Нам доверяют крупные компании"
        />
        <div className="clients-strip">
          {clients.map((client) => (
            <div className="client-logo" key={client}>{client}</div>
          ))}
        </div>
      </section>

      <section className="section section-dark">
        <div className="home-cta">
          <SectionHeading
            variant="legacy"
            className="home-cta__heading"
            align="center"
            label="Приезжайте к нам"
            title="Посмотрите наш склад"
            subtitle="Мы всегда готовы встретить вас и провести экскурсию по складскому комплексу в Домодедово."
          />
          <div className="home-cta__actions">
            <button
              type="button"
              className="btn-hero btn-hero-main"
              onClick={() => navigate('/contacts')}
            >
              Заказать звонок
            </button>
            <button
              type="button"
              className="home-cta__secondary"
              onClick={() => navigate('/tariffs')}
            >
              Тарифы
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
