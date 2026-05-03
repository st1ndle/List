// ═══ DATA ═══
const PRODS = [
  { id: 1, cat: 'wine', name: 'Каберне Совиньон', brand: 'Фанагория', desc: 'Выдержанное красное сухое вино с нотами чёрной смородины, ежевики и ванили. Танинное, с долгим послевкусием.', price: 490, unit: 'бут. 0.75л', emoji: '🍷', badge: 'Хит', color: 'rgba(123,45,94,.09)', catColor: '#7B2D5E', attrs: { Крепость: '13.5%', Объём: '0.75 л', Страна: 'Россия', Тип: 'Красное сухое' } },
  { id: 2, cat: 'wine', name: 'Шардоне', brand: 'Абрау-Дюрсо', desc: 'Элегантное белое вино с ароматом зелёного яблока, персика и цветов. Свежее и гармоничное.', price: 380, unit: 'бут. 0.75л', emoji: '🥂', badge: null, color: 'rgba(200,146,10,.08)', catColor: '#A07010', attrs: { Крепость: '12.5%', Объём: '0.75 л', Страна: 'Россия', Тип: 'Белое сухое' } },
  { id: 3, cat: 'wine', name: 'Розе Брют', brand: 'Наследие Мастера', desc: 'Игристое розовое вино с ароматом клубники и розы. Мелкие пузырьки, свежий финиш.', price: 620, unit: 'бут. 0.75л', emoji: '🍾', badge: 'Новинка', color: 'rgba(200,80,120,.08)', catColor: '#C05080', attrs: { Крепость: '11.5%', Объём: '0.75 л', Страна: 'Россия', Тип: 'Розовое игристое' } },
  { id: 4, cat: 'wine', name: 'Совиньон Блан', brand: 'Лефкадия', desc: 'Сухое белое вино с ярким ароматом крыжовника, грейпфрута и свежей травы.', price: 520, unit: 'бут. 0.75л', emoji: '🍷', badge: null, color: 'rgba(42,140,60,.08)', catColor: '#2A8C3C', attrs: { Крепость: '13%', Объём: '0.75 л', Страна: 'Россия', Тип: 'Белое сухое' } },
  { id: 5, cat: 'beer', name: 'Балтика №3', brand: 'Балтика', desc: 'Классическое светлое пиво с чистым солодовым вкусом и лёгкой хмелевой горчинкой.', price: 95, unit: 'бан. 0.5л', emoji: '🍺', badge: 'Хит', color: 'rgba(200,135,10,.09)', catColor: '#A06008', attrs: { Крепость: '4.8%', Объём: '0.5 л', Страна: 'Россия', Тип: 'Светлое' } },
  { id: 6, cat: 'beer', name: 'Жигулёвское', brand: 'Жигули', desc: 'Традиционное российское пиво. Лёгкое, освежающее, с характерным солодовым ароматом.', price: 85, unit: 'бан. 0.45л', emoji: '🍻', badge: null, color: 'rgba(180,120,10,.08)', catColor: '#B47800', attrs: { Крепость: '4.5%', Объём: '0.45 л', Страна: 'Россия', Тип: 'Светлое' } },
  { id: 7, cat: 'beer', name: 'Heineken', brand: 'Heineken', desc: 'Премиальное нидерландское лагер-пиво. Чистый вкус, лёгкая горчинка, освежающий финиш.', price: 140, unit: 'бан. 0.5л', emoji: '🍺', badge: null, color: 'rgba(26,100,40,.08)', catColor: '#1A6428', attrs: { Крепость: '5%', Объём: '0.5 л', Страна: 'Нидерланды', Тип: 'Светлое лагер' } },
  { id: 8, cat: 'beer', name: 'Крафт ИПА', brand: 'AF Brew', desc: 'Насыщенное крафтовое пиво с обильным хмелением, тропическими и цитрусовыми нотами.', price: 220, unit: 'бот. 0.33л', emoji: '🍺', badge: 'Крафт', color: 'rgba(180,90,20,.08)', catColor: '#B45A14', attrs: { Крепость: '6.5%', Объём: '0.33 л', Страна: 'Россия', Тип: 'Индийский Пэйл Эль' } },
  { id: 9, cat: 'soda', name: 'Coca-Cola', brand: 'Coca-Cola HBC', desc: 'Культовый газированный напиток с неповторимым вкусом. Поставляется компанией Coca-Cola HBC.', price: 89, unit: 'бут. 1.5л', emoji: '🥤', badge: 'Хит', color: 'rgba(180,30,30,.07)', catColor: '#B41E1E', attrs: { Объём: '1.5 л', Сахар: '10.6г/100мл', Страна: 'Россия', Тип: 'Лимонад' } },
  { id: 10, cat: 'soda', name: 'Sprite', brand: 'Coca-Cola HBC', desc: 'Освежающий лимонно-лаймовый напиток. Прозрачный, игристый, без кофеина.', price: 79, unit: 'бут. 1.5л', emoji: '🧃', badge: null, color: 'rgba(26,92,56,.07)', catColor: '#1A5C38', attrs: { Объём: '1.5 л', Сахар: '6.6г/100мл', Страна: 'Россия', Тип: 'Лимонад' } },
  { id: 11, cat: 'soda', name: 'Добрый Яблоко', brand: 'Coca-Cola HBC', desc: 'Натуральный яблочный сок с мякотью. Без консервантов, богатый витаминами.', price: 65, unit: 'пак. 1л', emoji: '🍎', badge: null, color: 'rgba(150,100,20,.07)', catColor: '#966414', attrs: { Объём: '1 л', Сахар: 'естественный', Страна: 'Россия', Тип: 'Сок' } },
  { id: 12, cat: 'soda', name: 'Red Bull', brand: 'Red Bull GmbH', desc: 'Энергетический напиток с таурином и кофеином. Поддерживает концентрацию и энергию.', price: 130, unit: 'бан. 0.25л', emoji: '⚡', badge: null, color: 'rgba(200,146,10,.08)', catColor: '#C89200', attrs: { Объём: '0.25 л', Кофеин: '80мг', Страна: 'Австрия', Тип: 'Энергетик' } },
  { id: 13, cat: 'water', name: 'Acqua Panna', brand: 'Acqua Panna', desc: 'Натуральная минеральная вода без газа из Тосканы. Мягкая, сбалансированный минеральный состав.', price: 120, unit: 'бут. 0.75л', emoji: '💧', badge: null, color: 'rgba(26,74,107,.07)', catColor: '#1A4A6B', attrs: { Объём: '0.75 л', Минерализация: 'низкая', Страна: 'Италия', Тип: 'Негазированная' } },
  { id: 14, cat: 'water', name: 'Архыз', brand: 'Архыз', desc: 'Природная горная вода с Кавказа. Слабоминерализованная, идеальна для ежедневного употребления.', price: 45, unit: 'бут. 1.5л', emoji: '🏔️', badge: 'Хит', color: 'rgba(26,74,107,.07)', catColor: '#1A4A6B', attrs: { Объём: '1.5 л', Минерализация: '200-500 мг/л', Страна: 'Россия', Тип: 'Негазированная' } },
  { id: 15, cat: 'water', name: 'Боржоми', brand: 'Боржоми', desc: 'Природная минеральная вода с высоким содержанием минералов. Лечебно-столовая.', price: 95, unit: 'бут. 0.5л', emoji: '💦', badge: null, color: 'rgba(26,74,107,.07)', catColor: '#1A4A6B', attrs: { Объём: '0.5 л', Минерализация: '5000-7500 мг/л', Страна: 'Грузия', Тип: 'Газированная' } },
  { id: 16, cat: 'water', name: 'Святой Источник', brand: 'Nestle', desc: 'Российская питьевая вода высшей категории. Обогащена фтором для защиты зубов.', price: 35, unit: 'бут. 1.5л', emoji: '💧', badge: null, color: 'rgba(26,74,107,.07)', catColor: '#1A4A6B', attrs: { Объём: '1.5 л', Минерализация: 'низкая', Страна: 'Россия', Тип: 'Негазированная' } },
];
const ADDRS = ['Домодедово, тер. Триколор, 11', 'Тула, ул. Щегловская Засека, 31А', 'Тула, ул. Луначарского, 76', 'Рязань, ул. Ряжское шоссе, 20', 'Истра, д. Покровское, Центральная, 27с2'];
const CATNAMES = { wine: 'Вино', beer: 'Пиво', soda: 'Газировки', water: 'Вода' };

let cart = {}, curCat = 'all', srtMode = '', orders = [], user = null, selAddr = 0, cats = [];
const PATH_TO_VIEW = {
  '/': 'home',
  '/catalog': 'catalogue',
  '/services': 'services',
  '/tariffs': 'tariffs',
  '/about': 'about',
  '/contacts': 'contacts',
  '/cart': 'cart',
  '/checkout': 'checkout',
  '/orders': 'orders',
  '/auth': 'auth',
  '/profile': 'profile'
};
const VIEW_TO_PATH = Object.fromEntries(Object.entries(PATH_TO_VIEW).map(([k, v]) => [v, k]));
const PROTECTED_VIEWS = new Set(['checkout', 'orders', 'profile']);
const STORAGE_KEYS = { cart: 'diplom_cart', orders: 'diplom_orders', user: 'diplom_user' };
let hasDemoOrders = false;

/**
 * Сохраняет текущее состояние корзины и заказов в LocalStorage
 */
function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
}

/**
 * Загружает состояние корзины и заказов из LocalStorage
 */
function loadFromLocalStorage() {
  try {
    cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '{}') || {};
    orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.orders) || '[]') || [];
  } catch (_e) {
    cart = {}; orders = [];
  }
}

// ═══ NAVIGATION ═══

/**
 * Переходит к указанному представлению (view)
 * @param {string} viewName - Имя представления
 */
function navigateToView(viewName) {
  switchView(viewName, true);
}

/**
 * Переходит к представлению на основе пути URL
 * @param {string} path - Путь URL
 */
function navigateToPath(path) {
  switchView(PATH_TO_VIEW[path] || 'home', false);
}

/**
 * Основная логика переключения между экранами приложения
 * @param {string} viewName - Имя целевого экрана
 * @param {boolean} shouldPushState - Нужно ли обновлять историю браузера
 */
function switchView(viewName, shouldPushState) {
  const target = PROTECTED_VIEWS.has(viewName) && !user ? 'auth' : viewName;

  // Переключение видимости блоков
  document.querySelectorAll('.view').forEach(x => x.classList.remove('active'));
  document.getElementById('view-' + target).classList.add('active');

  // Обновление активного пункта в навигации
  document.querySelectorAll('.nav-lnk').forEach(x => x.classList.remove('on'));
  const navMap = { home: 0, catalogue: 1, services: 2, tariffs: 3, about: 4, contacts: 5 };
  if (navMap[target] !== undefined) document.querySelectorAll('.nav-lnk')[navMap[target]].classList.add('on');

  // Вызов функций рендеринга для специфичных экранов
  const renderFunctions = {
    catalogue: renderProducts,
    cart: renderCart,
    checkout: renderCheckout,
    orders: renderOrders,
    profile: initProfileView,
    services: () => { },
    tariffs: () => { },
    about: () => { }
  };

  if (renderFunctions[target]) {
    if (target === 'catalogue') {
      (async () => {
        if (!cats.length) {
          await fetchCategories();
          renderCategoryTabs();
        }
        renderProducts();
      })();
    } else {
      renderFunctions[target]();
    }
  }

  // Обновление URL в строке браузера
  if (shouldPushState) {
    const path = VIEW_TO_PATH[target] || '/';
    if (window.location.pathname !== path) history.pushState({ view: target }, '', path);
  }

  window.scrollTo(0, 0);
}

// ═══ CATALOGUE ═══

/**
 * Устанавливает фильтр по категории
 * @param {string} categorySlug - Слаг категории (например, 'wine' или 'all')
 */
function filterByCategory(categorySlug) {
  curCat = categorySlug;
  document.querySelectorAll('.ftab').forEach(t => t.classList.remove('on'));
  const btn = document.querySelector(`.ftab[data-cat="${categorySlug}"]`);
  if (btn) btn.classList.add('on');
  renderProducts();
}

/**
 * Устанавливает режим сортировки
 * @param {string} mode - Код режима (pa - цена вверх, pd - цена вниз, nm - по имени)
 */
function setSortMode(mode) {
  srtMode = mode;
  renderProducts();
}

/**
 * Фильтрует и сортирует массив продуктов на основе текущих настроек
 * @returns {Array} Отфильтрованный и отсортированный массив продуктов
 */
function getFilteredProducts() {
  let list = PRODS.filter(p => curCat === 'all' || p.cat === curCat);
  const query = (document.getElementById('si') || { value: '' }).value.toLowerCase();

  if (query) {
    list = list.filter(p => p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query));
  }

  if (srtMode === 'pa') list.sort((a, b) => a.price - b.price);
  else if (srtMode === 'pd') list.sort((a, b) => b.price - a.price);
  else if (srtMode === 'nm') list.sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  return list;
}

/**
 * Отрисовывает сетку продуктов в каталоге
 */
function renderProducts() {
  const grid = document.getElementById('pgrid');
  if (!grid) return;

  const list = getFilteredProducts();

  if (!list.length) {
    grid.innerHTML = '<div class="no-res"><div class="no-res-icon">🔍</div><div style="font-size:16px;font-weight:500">Ничего не найдено</div></div>';
    return;
  }

  grid.innerHTML = list.map(p => {
    const inCart = cart[p.id] || 0;
    return `<div class="pc ani" onclick="openProductModal(${p.id})">
      <div class="pc-img" style="background:${p.color}">
        ${p.badge ? `<span class="pc-badge" style="background:${p.catColor};color:#fff">${p.badge}</span>` : ''}
        ${p.emoji}
      </div>
      <div class="pc-body">
        <div class="pc-cat" style="color:${p.catColor}">${CATNAMES[p.cat]}</div>
        <div class="pc-name">${p.name}</div>
        <div class="pc-brand">${p.brand}</div>
        <div class="pc-desc">${p.desc.slice(0, 75)}…</div>
        <div class="pc-foot">
          <div><div class="pc-price" style="color:var(--green)">${p.price}₽</div><div class="pc-unit">${p.unit}</div></div>
          ${inCart ? `<div class="qty-wrap" onclick="event.stopPropagation()"><button class="qb" onclick="updateCartQuantity(${p.id},-1)">−</button><span class="qn">${inCart}</span><button class="qb" onclick="updateCartQuantity(${p.id},1)">+</button></div>`
        : `<button class="btn-add" onclick="event.stopPropagation();addToCart(${p.id})">В корзину</button>`}
        </div>
      </div>
    </div>`;
  }).join('');
}

// ═══ MODAL ═══

/**
 * Открывает модальное окно с деталями продукта
 * @param {number} id - ID продукта
 */
function openProductModal(id) {
  const p = PRODS.find(x => x.id === id);
  const inCart = cart[p.id] || 0;

  document.getElementById('mcontent').innerHTML = `
    <div class="m-img" style="background:${p.color}">${p.emoji}</div>
    <div class="m-body">
      <div class="m-cat" style="color:${p.catColor}">${CATNAMES[p.cat]}</div>
      <div class="m-name">${p.name}</div>
      <div class="m-brand">${p.brand}</div>
      <div class="m-price-row"><div class="m-price">${p.price}₽</div><div class="m-per">/ ${p.unit}</div></div>
      <div class="m-desc">${p.desc}</div>
      <div class="m-attrs">${Object.entries(p.attrs).map(([k, v]) => `<div class="m-attr"><div class="m-albl">${k}</div><div class="m-aval">${v}</div></div>`).join('')}</div>
      <div class="m-foot">
        ${inCart ? `<div class="qty-wrap"><button class="qb" onclick="updateCartQuantity(${p.id},-1);openProductModal(${p.id})">−</button><span class="qn">${inCart}</span><button class="qb" onclick="updateCartQuantity(${p.id},1);openProductModal(${p.id})">+</button></div><span style="font-size:13px;color:var(--ink3)">В корзине: ${inCart} шт.</span>`
      : `<button class="btn-solid" style="flex:1;padding:13px;font-size:15px;border-radius:12px" onclick="addToCart(${p.id});openProductModal(${p.id})">Добавить в корзину</button>`}
      </div>
    </div>`;
  document.getElementById('pmodal').classList.add('open');
}

/**
 * Закрывает модальное окно при клике на оверлей
 * @param {Event} e - Объект события
 */
function closeProductModal(e) {
  if (e.target.id === 'pmodal') {
    document.getElementById('pmodal').classList.remove('open');
  }
}

// ═══ CART LOGIC ═══

/**
 * Добавляет товар в корзину
 * @param {number} id - ID продукта
 */
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  updateCartBadge();
  saveToLocalStorage();
  showToast('✓', 'Добавлено в корзину');
  renderProducts();
}

/**
 * Обновляет количество товара в корзине
 * @param {number} id - ID продукта
 * @param {number} delta - Изменение количества (+1 или -1)
 */
function updateCartQuantity(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  updateCartBadge();
  saveToLocalStorage();
  renderProducts();
  renderCart();
}

/**
 * Удаляет товар из корзины полностью
 * @param {number} id - ID продукта
 */
function removeFromCart(id) {
  delete cart[id];
  updateCartBadge();
  saveToLocalStorage();
  renderCart();
}

/**
 * Очищает корзину
 */
function clearCart() {
  cart = {};
  updateCartBadge();
  saveToLocalStorage();
  renderCart();
}

/**
 * Обновляет счетчик товаров на иконке корзины
 */
function updateCartBadge() {
  const total = Object.values(cart).reduce((a, b) => a + b, 0);
  const dot = document.getElementById('cdot');
  if (dot) {
    dot.textContent = total;
    dot.style.display = total ? 'flex' : 'none';
  }
}

/**
 * Вычисляет общую сумму товаров в корзине
 * @returns {number} Общая стоимость
 */
function calculateCartTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = PRODS.find(p => p.id == id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

/**
 * Отрисовывает содержимое страницы корзины
 */
function renderCart() {
  const el = document.getElementById('cart-content');
  if (!el) return;

  const items = Object.entries(cart);
  if (!items.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">🛒</div><div class="empty-ttl">Корзина пуста</div><p style="margin-bottom:28px;color:var(--ink3)">Добавьте товары из каталога</p><button class="btn-solid" style="padding:12px 32px;font-size:15px;border-radius:10px" onclick="navigateToView('catalogue')">Открыть каталог</button></div>`;
    return;
  }

  const total = calculateCartTotal();
  el.innerHTML = `<div class="clayout">
    <div class="cart-list">
      ${items.map(([id, q]) => {
    const p = PRODS.find(x => x.id == id);
    return `<div class="ci"><div class="ci-emoji">${p.emoji}</div><div class="ci-info"><div class="ci-name">${p.name}</div><div class="ci-meta">${p.brand} · ${p.unit} · ${p.price}₽/шт.</div></div><div class="qty-wrap"><button class="qb" onclick="updateCartQuantity(${id},-1)">−</button><span class="qn">${q}</span><button class="qb" onclick="updateCartQuantity(${id},1)">+</button></div><div class="ci-price">${p.price * q}₽</div><button class="ci-del" onclick="removeFromCart(${id})" aria-label="Удалить">✕</button></div>`;
  }).join('')}
    </div>
    <div class="csum">
      <div class="csum-title">Итого</div>
      <div class="crow"><span class="crow-lbl">Позиций</span><span class="crow-val">${items.length} шт.</span></div>
      <div class="crow"><span class="crow-lbl">Товаров</span><span class="crow-val">${items.reduce((s, [, q]) => s + q, 0)} шт.</span></div>
      <div class="crow"><span class="crow-lbl">Сумма</span><span class="crow-total">${total}₽</span></div>
      <button class="btn-full btn-full-main" onclick="navigateToView('checkout')">Оформить заказ →</button>
      <button class="btn-full btn-full-out" style="margin-top:8px" onclick="navigateToView('catalogue')">Продолжить покупки</button>
      <button class="btn-full btn-full-danger" onclick="clearCart()">Очистить корзину</button>
    </div>
  </div>`;
}

// ═══ CHECKOUT ═══

/**
 * Выбор адреса самовывоза
 * @param {number} index - Индекс в массиве ADDRS
 */
function selectAddress(index) {
  selAddr = index;
  document.querySelectorAll('.aopt').forEach((e, j) => e.classList.toggle('on', j === index));
}

/**
 * Выбор временного слота для получения
 * @param {HTMLElement} el - Элемент слота
 */
function selectTimeSlot(el) {
  document.querySelectorAll('.tslot').forEach(s => s.classList.remove('on'));
  el.classList.add('on');
}

/**
 * Отрисовывает резюме заказа на странице оформления
 */
function renderCheckout() {
  const items = Object.entries(cart);
  const total = calculateCartTotal();
  const ci = document.getElementById('co-items');
  if (!ci) return;

  ci.innerHTML = items.map(([id, q]) => {
    const p = PRODS.find(x => x.id == id);
    return `<div class="crow"><span class="crow-lbl">${p.emoji} ${p.name} ×${q}</span><span class="crow-val">${p.price * q}₽</span></div>`;
  }).join('');

  document.getElementById('co-rows').innerHTML = `<div class="crow" style="border-top:1px solid var(--bg2);margin-top:8px;padding-top:14px"><span class="crow-lbl" style="font-weight:700">К оплате</span><span class="crow-total">${total}₽</span></div>`;

  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('co-date');
  if (dateInput) {
    dateInput.min = today;
    dateInput.value = today;
  }
}

/**
 * Обработка оформления заказа
 */
function placeOrder() {
  if (!user) {
    showToast('⚠️', 'Войдите для оформления заказа');
    navigateToView('auth');
    return;
  }

  const items = Object.entries(cart).map(([id, q]) => ({ p: PRODS.find(x => x.id == id), q }));
  if (!items.length) {
    showToast('⚠️', 'Корзина пуста');
    return;
  }

  const timeSlot = document.querySelector('.tslot.on');
  const dateInput = document.getElementById('co-date');

  const order = {
    id: '#' + Math.floor(Math.random() * 90000 + 10000),
    date: new Date().toLocaleDateString('ru-RU'),
    pDate: dateInput ? dateInput.value : '—',
    pTime: timeSlot ? timeSlot.textContent : 'не выбрано',
    addr: ADDRS[selAddr],
    items: items.map(x => ({ name: x.p.name, emoji: x.p.emoji, q: x.q, price: x.p.price })),
    total: calculateCartTotal(),
    status: 'new'
  };

  orders.unshift(order);
  cart = {};
  updateCartBadge();
  saveToLocalStorage();
  showToast('🎉', 'Заказ ' + order.id + ' оформлен!');
  navigateToView('orders');
}

// ═══ ORDERS ═══

const STATUS_LABELS = { new: 'Новый', processing: 'В обработке', ready: 'Готов к выдаче', done: 'Выдан' };
const STATUS_CLASSES = { new: 'sb-new', processing: 'sb-proc', ready: 'sb-ready', done: 'sb-done' };
const STATUS_STEPS = { new: 1, processing: 2, ready: 3, done: 4 };

/**
 * Отрисовывает список заказов пользователя
 */
function renderOrders() {
  const el = document.getElementById('ord-wrap');
  if (!el) return;

  if (!orders.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><div class="empty-ttl">Заказов пока нет</div><p style="margin-bottom:28px;color:var(--ink3)">Оформите первый заказ из каталога</p><button class="btn-solid" style="padding:12px 32px;font-size:15px;border-radius:10px" onclick="navigateToView('catalogue')">Открыть каталог</button></div>`;
    return;
  }

  const progressLabels = ['Принят', 'Обработка', 'Готов', 'Выдан'];
  el.innerHTML = orders.map(o => {
    const step = STATUS_STEPS[o.status];
    return `<div class="ocard">
    <div class="ocard-head"><div><div class="ocard-num">Заказ ${o.id}</div><div class="ocard-meta">от ${o.date} · Самовывоз: ${o.pDate}, ${o.pTime}</div></div><span class="sbadge ${STATUS_CLASSES[o.status]}">${STATUS_LABELS[o.status]}</span></div>
    <div class="oprog">${progressLabels.map((label, i) => `<div class="opstep ${i + 1 < step ? 'done' : ''} ${i + 1 === step ? 'cur' : ''}"><div class="opstep-dot">${i + 1 < step ? '✓' : i + 1}</div><div class="opstep-lbl">${label}</div></div>`).join('')}</div>
    <div style="font-size:12px;color:var(--ink3);margin-bottom:10px">📍 ${o.addr}</div>
    <div class="oitems">${o.items.map(i => `<span class="oitem-chip">${i.emoji} ${i.name} ×${i.q}</span>`).join('')}</div>
    <div class="ocard-foot"><div><div class="o-total">${o.total}₽</div><div class="o-addr">${o.addr}</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn-repeat" onclick="repeatOrder('${o.id}')">↻ Повторить заказ</button>${o.status === 'new' ? `<button class="btn-cancel" onclick="cancelOrder('${o.id}')">Отменить</button>` : ''}</div></div>
  </div>`;
  }).join('');
}

/**
 * Повторяет заказ, добавляя его товары в корзину
 * @param {string} id - Номер заказа
 */
function repeatOrder(id) {
  const order = orders.find(x => x.id === id);
  order.items.forEach(item => {
    const product = PRODS.find(x => x.name === item.name);
    if (product) cart[product.id] = (cart[product.id] || 0) + item.q;
  });
  updateCartBadge();
  saveToLocalStorage();
  showToast('✓', 'Товары добавлены в корзину');
  navigateToView('cart');
}

/**
 * Отменяет заказ (меняет статус на Выдан/Завершен для демонстрации)
 * @param {string} id - Номер заказа
 */
function cancelOrder(id) {
  const order = orders.find(x => x.id === id);
  if (order) order.status = 'done';
  saveToLocalStorage();
  renderOrders();
}

// ═══ AUTH ═══
let currentLoginMethod = 'email';

/**
 * Переключает табы Вход / Регистрация
 * @param {string} tab - 'l' для входа, 'r' для регистрации
 */
function switchAuthTab(tab) {
  document.querySelectorAll('#auth-main-tabs .a-tab').forEach((el, i) => el.classList.toggle('on', (tab === 'l' && i === 0) || (tab === 'r' && i === 1)));
  document.getElementById('a-login').style.display = tab === 'l' ? 'block' : 'none';
  document.getElementById('a-reg').style.display = tab === 'r' ? 'block' : 'none';
}

/**
 * Переключает метод входа (Email / Телефон)
 * @param {string} method - 'email' или 'phone'
 */
function switchLoginMethod(method) {
  currentLoginMethod = method;
  document.querySelectorAll('.a-tab-login').forEach((el, i) => el.classList.toggle('on', (method === 'email' && i === 0) || (method === 'phone' && i === 1)));
  document.getElementById('l-email-wrap').style.display = method === 'email' ? 'block' : 'none';
  document.getElementById('l-phone-wrap').style.display = method === 'phone' ? 'block' : 'none';
}

/**
 * Выполняет вход пользователя через API
 */
async function handleLogin() {
  const email = document.getElementById('l-email').value.trim();
  const phone = document.getElementById('l-phone').value.trim();
  const password = document.getElementById('l-pass').value;
  const loginValue = currentLoginMethod === 'email' ? email : phone;

  if (!loginValue || !password) {
    showToast('⚠️', 'Заполните все поля');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ login: loginValue, password: password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка входа');

    await checkAuthStatus();
    showToast('👋', 'Добро пожаловать!');
    navigateToView('catalogue');
  } catch (err) {
    showToast('⚠️', err.message);
  }
}

/**
 * Выполняет регистрацию пользователя через API
 */
async function handleRegister() {
  const name = document.getElementById('r-nm').value.trim();
  const lastName = document.getElementById('r-ln').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const phone = document.getElementById('r-ph').value.trim();
  const pass = document.getElementById('r-pass').value;
  const pass2 = document.getElementById('r-pass2').value;

  if (!name || (!email && !phone) || !pass) {
    showToast('⚠️', 'Заполните обязательные поля');
    return;
  }
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    showToast('⚠️', 'Укажите корректную почту');
    return;
  }
  if (pass.length < 8) {
    showToast('⚠️', 'Пароль — минимум 8 символов');
    return;
  }
  if (pass !== pass2) {
    showToast('⚠️', 'Пароли не совпадают');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ firstName: name, lastName: lastName, email: email || null, phone: phone || null, password: pass })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка регистрации');

    await checkAuthStatus();
    showToast('🎉', 'Регистрация успешна!');
    navigateToView('catalogue');
  } catch (err) {
    showToast('⚠️', err.message);
  }
}

/**
 * Выполняет выход из системы
 */
async function handleLogout() {
  try {
    await fetch('http://localhost:3000/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch (e) { }
  user = null;
  updateAuthUI();
  navigateToView('home');
  showToast('👋', 'Вы вышли из аккаунта');
}

/**
 * Обновляет интерфейс в зависимости от статуса авторизации
 */
function updateAuthUI() {
  const nauth = document.getElementById('nauth');
  const nlogout = document.getElementById('nlogout');
  const norders = document.getElementById('norders');

  if (nauth) nauth.style.display = user ? 'none' : 'block';
  if (nlogout) nlogout.style.display = user ? 'block' : 'none';
  if (norders) norders.style.display = user ? 'block' : 'none';

  if (user) {
    const avatar = (user.name[0] + (user.lastname ? user.lastname[0] : '')).toUpperCase();
    const pAv = document.getElementById('p-av');
    const pNm = document.getElementById('p-nm');
    const pPh = document.getElementById('p-ph');

    if (pAv) pAv.textContent = avatar;
    if (pNm) pNm.textContent = user.name + ' ' + (user.lastname || '');
    if (pPh) pPh.textContent = user.phone || '+7 (495) 000-00-00';
  }
}

// ═══ PROFILE ═══

/**
 * Переключает подразделы в профиле пользователя
 * @param {string} section - 'data', 'orders' или 'security'
 */
function switchProfileSection(section) {
  document.querySelectorAll('.sitem').forEach((el, i) => el.classList.toggle('on', ['data', 'orders', 'security'][i] === section));
  const el = document.getElementById('p-main');
  if (!el) return;

  if (section === 'data') {
    el.innerHTML = `<div class="scard"><div class="scard-title">Личные данные</div><div class="frow"><div class="fg"><label class="flbl">Имя</label><input class="finp" value="${user ? user.name : ''}"></div><div class="fg"><label class="flbl">Фамилия</label><input class="finp" value="${user ? user.lastname : ''}"></div></div><div class="fg"><label class="flbl">Телефон</label><input class="finp" value="${user ? user.phone : ''}"></div><button class="btn-solid" style="padding:11px 28px;font-size:14px;border-radius:10px" onclick="showToast('✓','Данные сохранены')">Сохранить</button></div>`;
  } else if (section === 'orders') {
    el.innerHTML = '<div id="ord-wrap"></div>';
    renderOrders();
  } else {
    el.innerHTML = `<div class="scard"><div class="scard-title">Безопасность</div><div class="fg"><label class="flbl">Текущий пароль</label><input class="finp" type="password" placeholder="••••••••"></div><div class="fg"><label class="flbl">Новый пароль</label><input class="finp" type="password" placeholder="Минимум 8 символов"></div><div class="fg"><label class="flbl">Подтверждение</label><input class="finp" type="password" placeholder="••••••••"></div><button class="btn-solid" style="padding:11px 28px;font-size:14px;border-radius:10px" onclick="showToast('✓','Пароль изменён')">Изменить</button></div>`;
  }
}

/**
 * Инициализирует экран профиля
 */
function initProfileView() {
  if (!user) {
    navigateToView('auth');
    return;
  }
  switchProfileSection('data');
}

// ═══ CONTACTS FORM ═══

/**
 * Обрабатывает отправку формы контактов
 */
function handleContactFormSubmit() {
  const name = document.getElementById('c-name').value.trim();
  const phone = document.getElementById('c-phone').value.trim();
  if (!name || !phone) {
    showToast('⚠️', 'Заполните имя и телефон');
    return;
  }
  showToast('✓', 'Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
  ['c-name', 'c-phone', 'c-msg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

// ═══ CALCULATOR ═══

/**
 * Рассчитывает ориентировочную стоимость хранения паллет
 */
function calculateStoragePrice() {
  const rate = parseInt(document.getElementById('pal-type').value) || 32;
  const count = parseInt(document.getElementById('pal-cnt').value) || 0;
  const days = parseInt(document.getElementById('pal-days').value) || 0;
  const result = rate * count * days;
  const el = document.getElementById('calc-result');
  if (el) el.textContent = result.toLocaleString('ru-RU') + '₽';
}

// ═══ TOAST ═══

/**
 * Показывает всплывающее уведомление (Toast)
 * @param {string} icon - Эмодзи или иконка
 * @param {string} message - Текст сообщения
 */
function showToast(icon, message) {
  document.getElementById('tic').textContent = icon;
  document.getElementById('tmsg').textContent = message;
  const t = document.getElementById('toast');
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 3200);
}


// ═══ API ═══

/**
 * Проверяет текущий статус авторизации через бэкенд API
 */
async function checkAuthStatus() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      user = {
        name: data.user.first_name,
        lastname: data.user.last_name,
        phone: data.user.phone,
        email: data.user.email
      };
    } else {
      user = null;
    }
  } catch (err) {
    user = null;
  }
  updateAuthUI();
}

/**
 * Загружает список категорий с бэкенда
 */
async function fetchCategories() {
  try {
    const res = await fetch('http://localhost:3000/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    cats = await res.json();
    // Обновляем CATNAMES для использования в UI
    cats.forEach(c => {
      CATNAMES[c.slug] = c.name;
    });
    console.log('Fetched categories from backend:', cats);
    return cats;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

/**
 * Отрисовывает динамические вкладки категорий в каталоге
 */
function renderCategoryTabs() {
  const container = document.getElementById('ftabs');
  if (!container) return;

  const icons = { wine: '🍷', beer: '🍺', soda: '🥤', water: '💧' };
  let html = `<button class="ftab ${curCat === 'all' ? 'on' : ''}" data-cat="all" onclick="filterByCategory('all')">Все товары</button>`;

  cats.forEach(c => {
    const icon = icons[c.slug] || '📦';
    html += `<button class="ftab ftab-${c.slug} ${curCat === c.slug ? 'on' : ''}" data-cat="${c.slug}" onclick="filterByCategory('${c.slug}')">${icon} ${c.name}</button>`;
  });

  container.innerHTML = html;
}

/**
 * Загружает продукты по категории с бэкенда
 * @param {string} categoryId - ID категории
 */
async function fetchProductsByCategory(categoryId) {
  try {
    const url = categoryId && categoryId !== 'all'
      ? `http://localhost:3000/products?category_id=${categoryId}`
      : 'http://localhost:3000/products';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    console.log(`Fetched products for category ${categoryId || 'all'} from backend:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

// ═══ INITIALIZATION ═══
(async function () {
  loadFromLocalStorage();
  hasDemoOrders = orders.length > 0;

  window.addEventListener('popstate', () => navigateToPath(window.location.pathname));

  renderProducts();

  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('co-date');
  if (dateInput) {
    dateInput.min = today;
    dateInput.value = today;
  }

  if (!hasDemoOrders) {
    orders.push({ id: '#48291', date: '15.01.2024', pDate: '16.01.2024', pTime: '10:00–11:00', addr: ADDRS[0], items: [{ name: 'Каберне Совиньон', emoji: '🍷', q: 12, price: 490 }, { name: 'Архыз', emoji: '🏔️', q: 24, price: 45 }], total: 6960, status: 'done' });
    orders.push({ id: '#48154', date: '12.01.2024', pDate: '13.01.2024', pTime: '14:00–15:00', addr: ADDRS[1], items: [{ name: 'Балтика №3', emoji: '🍺', q: 48, price: 95 }, { name: 'Coca-Cola', emoji: '🥤', q: 12, price: 89 }], total: 5628, status: 'ready' });
    saveToLocalStorage();
  }

  updateCartBadge();
  await checkAuthStatus();
  navigateToPath(window.location.pathname);
})();
