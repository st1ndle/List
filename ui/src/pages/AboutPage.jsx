import { useEffect } from 'react';
import SectionHeading from '../features/site/SectionHeading';
import useWarehouseStore from '../store/useWarehouseStore';
import useSiteSettingsStore from '../store/useSiteSettingsStore';
import './AboutPage.css';

function AboutPage() {
  const { warehouses, fetchWarehouses } = useWarehouseStore();
  const { fetchSettings, getSetting } = useSiteSettingsStore();

  useEffect(() => {
    fetchWarehouses();
    fetchSettings();
  }, [fetchWarehouses, fetchSettings]);

  return (
    <main className="about-page">
      <section className="section">
        <SectionHeading
          variant="legacy"
          label="О компании"
          title={(
            <>
              ООО ЛиСТ —
              <br />
              в режиме нон-стоп
            </>
          )}
        />

        <div className="about-page__grid">
          <div>
            <p className="about-page__paragraph">
              Логистическая компания успешно функционирует на рынке с <strong>{getSetting('stat_year', '1998')} года</strong>. Реализовав два десятилетия назад масштабный проект создания полнофункциональной транспортной компании, сегодня прочно занимает тематическую нишу и расширяет сеть.
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
              <div className="av-card"><div className="av-num">{getSetting('stat_year', '1998')}</div><div className="av-lbl">год основания</div></div>
              <div className="av-card"><div className="av-num">{getSetting('stat_employees', '150')}</div><div className="av-lbl">сотрудников</div></div>
              <div className="av-card"><div className="av-num">{getSetting('stat_addresses', '2000+')}</div><div className="av-lbl">адресов доставки в день</div></div>
              <div className="av-card"><div className="av-num">{getSetting('stat_daily_cargo', '500т')}</div><div className="av-lbl">грузов в сутки</div></div>
              <div className="av-card av-card-dark"><div className="av-num">{getSetting('stat_pallets', '17 000')}</div><div className="av-lbl">паллетомест · 3PL · FMCG</div></div>
            </div>

            <div className="about-page__warehouses">
              <div className="about-page__warehouses-label">Склады</div>
              <div className="about-page__warehouses-list">
                {warehouses.length > 0 ? (
                  warehouses.map((w, i) => (
                    <span key={w.id}>
                      📍 {w.name}, {w.address}
                      {i < warehouses.length - 1 && <br />}
                    </span>
                  ))
                ) : (
                  <span>📍 Загрузка складов...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AboutPage;
