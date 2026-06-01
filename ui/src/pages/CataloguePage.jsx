import { useEffect, useMemo, useState } from 'react';
import ProductGridContainer from '../features/catalogue/ProductGridContainer';
import ApiStorage from '../api/ApiStorage';
import './CataloguePage.css';

function toCardProduct(product) {
  return {
    id: product.id,
    categoryId: product.category_id,
    category: product.category_name || 'Товар',
    name: product.name,
    brand: product.brand,
    description: product.description || 'Описание скоро появится.',
    emoji: product.emoji || '📦',
    badge: product.badge || null,
    bgColor: product.bg_color || 'rgba(26,74,107,.07)',
    catColor: product.category_color || '#1A4A6B',
    volume: product.unit_name || '1 шт.',
    priceValue: Number(product.price) || 0,
    price: `${Math.trunc(Number(product.price) || 0)} ₽`,
  };
}

function CataloguePage() {
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const response = await ApiStorage.catalog.getCategories();
        const list = Array.isArray(response) ? response : [];
        if (isMounted) {
          setCategories(list);
        }
      } catch (loadError) {
        console.error('Не удалось загрузить категории:', loadError);
        if (isMounted) {
          setError('Не удалось загрузить категории каталога.');
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setIsLoading(true);
      setError('');
      try {
        const categoryId = activeCategoryId === 'all' ? undefined : activeCategoryId;
        const response = await ApiStorage.catalog.getProducts(categoryId);
        const list = Array.isArray(response) ? response : [];
        if (isMounted) {
          const categoriesById = Object.fromEntries(categories.map((item) => [String(item.id), item]));
          setProducts(list.map((product) => {
            const category = categoriesById[String(product.category_id)];
            return toCardProduct({
              ...product,
              category_name: category?.name,
              category_color: category?.color_hex,
            });
          }));
        }
      } catch (loadError) {
        console.error('Не удалось загрузить товары:', loadError);
        if (isMounted) {
          setError('Не удалось загрузить товары каталога.');
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [activeCategoryId, categories]);

  const visibleProducts = useMemo(() => {
    let list = [...products];
    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter((item) => (
        item.name.toLowerCase().includes(query) || item.brand.toLowerCase().includes(query)
      ));
    }

    if (sortMode === 'pa') {
      list.sort((a, b) => a.priceValue - b.priceValue);
    } else if (sortMode === 'pd') {
      list.sort((a, b) => b.priceValue - a.priceValue);
    } else if (sortMode === 'nm') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    }

    return list;
  }, [products, search, sortMode]);

  return (
    <main className="catalogue-page">
      <div className="cat-top">
        <div className="cat-title-row">
          <div className="sec-label catalogue-page__label">Каталог товаров</div>
          <h1 className="catalogue-page__title">Напитки оптом</h1>
        </div>
        <div className="search-row">
          <input
            className="s-input"
            placeholder="Поиск по названию или бренду..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="s-select"
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value)}
          >
            <option value="">По умолчанию</option>
            <option value="pa">Цена ↑</option>
            <option value="pd">Цена ↓</option>
            <option value="nm">По названию</option>
          </select>
        </div>
      </div>

      <div className="filter-strip">
        <button
          type="button"
          className={`ftab ${activeCategoryId === 'all' ? 'on' : ''}`}
          onClick={() => setActiveCategoryId('all')}
        >
          Все категории
        </button>
        {categories.map((category) => (
          <button
            type="button"
            key={category.id}
            className={`ftab ${activeCategoryId === category.id ? 'on' : ''}`}
            onClick={() => setActiveCategoryId(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <section className="catalogue-page__state">Загружаем каталог...</section>
      ) : null}

      {!isLoading && error ? (
        <section className="catalogue-page__state catalogue-page__state--error">{error}</section>
      ) : null}

      {!isLoading && !error ? (
        <section className="catalogue-page__products">
          {visibleProducts.length === 0 ? (
            <div className="catalogue-page__state">Ничего не найдено по выбранным фильтрам.</div>
          ) : (
            <ProductGridContainer title="Позиции каталога" products={visibleProducts} cardVariant="catalog" />
          )}
        </section>
      ) : null}
    </main>
  );
}

export default CataloguePage;
