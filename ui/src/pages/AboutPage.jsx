import SectionHeading from '../components/site/SectionHeading';
import './AboutPage.css';

function AboutPage() {
  return (
    <main className="about-page">
      <section className="section">
        <SectionHeading
          variant="legacy"
          label="О компании"
          title={(
            <>
              3D Logistic —
              <br />
              в режиме нон-стоп
            </>
          )}
        />

        <div className="about-page__grid">
          <div>
            <p className="about-page__paragraph">
              Логистическая компания успешно функционирует на рынке с <strong>1998 года</strong>. Реализовав два десятилетия назад масштабный проект создания полнофункциональной транспортной компании, сегодня прочно занимает тематическую нишу и расширяет сеть.
            </p>
            <p className="about-page__paragraph">
              В начале пути компания специализировалась на дистрибуции и была ориентирована на крупных оптовых клиентов. Первым якорным клиентом стала международная группа компаний <strong>Anadolu Efes</strong>.
            </p>
            <p className="about-page__paragraph">
              Филиальная сеть начала активно расти с 2004 года: Истра, Чехов, Тула, Смоленск, Калуга, Брянск, Вязьма. В 2012 году открыт собственный логистический комплекс в Москве.
            </p>
            <p className="about-page__paragraph">
              В этом году реализован масштабный проект — создание для компании <strong>«Балтика»</strong> распределительного транспортно-логистического центра федерального уровня с оборотом не менее <strong>600 паллет в сутки</strong>.
            </p>
          </div>

          <div>
            <div className="about-visual">
              <div className="av-card"><div className="av-num">1998</div><div className="av-lbl">год основания</div></div>
              <div className="av-card"><div className="av-num">150</div><div className="av-lbl">сотрудников</div></div>
              <div className="av-card"><div className="av-num">2000+</div><div className="av-lbl">адресов доставки в день</div></div>
              <div className="av-card"><div className="av-num">500т</div><div className="av-lbl">грузов в сутки</div></div>
              <div className="av-card av-card-dark"><div className="av-num">17 000</div><div className="av-lbl">паллетомест · 3PL · FMCG</div></div>
            </div>

            <div className="about-page__warehouses">
              <div className="about-page__warehouses-label">Склады</div>
              <div className="about-page__warehouses-list">
                📍 Домодедово, территория Триколор, 11
                <br />
                📍 Тула, ул. Щегловская Засека, 31А
                <br />
                📍 Тула, ул. Луначарского, 76
                <br />
                📍 Рязань, ул. Ряжское шоссе, 20
                <br />
                📍 Истра, д. Покровское, Центральная, 27с2
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AboutPage;
