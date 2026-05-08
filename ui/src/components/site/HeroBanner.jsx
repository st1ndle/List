import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../ui/Button';
import './HeroBanner.css';

function HeroBanner({
  title,
  description,
  onPrimaryClick,
  onSecondaryClick,
  primaryLabel = 'Открыть каталог',
  secondaryLabel = 'Получить консультацию',
  chip,
  titleLines,
  stats,
  categories,
  badge,
}) {
  const isSplitLayout = Boolean(chip || titleLines?.length || stats?.length || categories?.length || badge);

  if (isSplitLayout) {
    return (
      <section className="hero">
        <div className="hero-left">
          {chip ? <div className="hero-chip">{chip}</div> : null}
          <h1 className="hero-title">
            {titleLines?.length
              ? titleLines.map((line, index) => (
                <Fragment key={`${line.text}-${index}`}>
                  {line.highlight ? <em>{line.text}</em> : line.text}
                  {index < titleLines.length - 1 ? <br /> : null}
                </Fragment>
              ))
              : title}
          </h1>
          <p className="hero-desc">{description}</p>
          <div className="hero-btns">
            <button type="button" className="btn-hero btn-hero-main" onClick={onPrimaryClick}>
              {primaryLabel}
            </button>
            <button type="button" className="btn-hero btn-hero-out" onClick={onSecondaryClick}>
              {secondaryLabel}
            </button>
          </div>
          {stats?.length ? (
            <div className="hero-stats">
              {stats.map((stat) => (
                <div className="hero-stat" key={stat.label}>
                  <div className="stat-big">{stat.value}</div>
                  <div className="stat-lbl">{stat.label}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="hero-right">
          {badge ? (
            <div className="hero-badge">
              <div className="hero-badge__prefix">{badge.prefix}</div>
              <div className="hero-badge__price">{badge.price}</div>
              <div className="hero-badge__suffix">{badge.suffix}</div>
            </div>
          ) : null}
          {categories?.length ? (
            <div className="hero-right-grid ani">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category.name}
                  className="cat-pill"
                  onClick={category.onClick}
                >
                  <div className="cat-pill-icon">{category.icon}</div>
                  <div className="cat-pill-text">
                    <div className="cat-pill-name">{category.name}</div>
                    <div className="cat-pill-sub">{category.subtitle}</div>
                  </div>
                  <div className="cat-pill-price">{category.price}</div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="hero-banner">
      <h1 className="hero-banner__title">{title}</h1>
      <p className="hero-banner__description">{description}</p>
      <div className="hero-banner__actions">
        <Button variant="solid" onClick={onPrimaryClick}>{primaryLabel}</Button>
        <Button variant="outline" onClick={onSecondaryClick}>{secondaryLabel}</Button>
      </div>
    </section>
  );
}

HeroBanner.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onPrimaryClick: PropTypes.func,
  onSecondaryClick: PropTypes.func,
  primaryLabel: PropTypes.string,
  secondaryLabel: PropTypes.string,
  chip: PropTypes.string,
  titleLines: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      highlight: PropTypes.bool,
    }),
  ),
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      subtitle: PropTypes.string.isRequired,
      price: PropTypes.string.isRequired,
      onClick: PropTypes.func,
    }),
  ),
  badge: PropTypes.shape({
    prefix: PropTypes.string.isRequired,
    price: PropTypes.string.isRequired,
    suffix: PropTypes.string.isRequired,
  }),
};

HeroBanner.defaultProps = {
  onPrimaryClick: () => {},
  onSecondaryClick: () => {},
  primaryLabel: 'Открыть каталог',
  secondaryLabel: 'Получить консультацию',
  chip: null,
  titleLines: null,
  stats: null,
  categories: null,
  badge: null,
};

export default HeroBanner;
