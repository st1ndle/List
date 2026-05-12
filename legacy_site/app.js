// ═══ DATA ═══

const ADDRS = ['Домодедово, тер. Триколор, 11', 'Тула, ул. Щегловская Засека, 31А', 'Тула, ул. Луначарского, 76', 'Рязань, ул. Ряжское шоссе, 20', 'Истра, д. Покровское, Центральная, 27с2'];

let cart = {}, curCat = 'all', srtMode = '', orders = [], user = null, selAddr = 0, cats = [];
let allProducts = [];
let visibleCount = 0;
let lazyObserver = null;
const PRODUCTS_BATCH_SIZE = 8;
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
const API_BASE_URL = window.__API_BASE_URL__ || 'http://localhost:3000';

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

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
    catalogue: () => renderProducts(true),
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
          if (curCat === 'all' && cats.length) curCat = cats[0].slug;
          renderCategoryTabs();
        }
        await loadProductsForCurrentCategory();
        renderProducts(true);
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
async function filterByCategory(categorySlug) {
  curCat = categorySlug;
  document.querySelectorAll('.ftab').forEach(t => t.classList.remove('on'));
  const btn = document.querySelector(`.ftab[data-cat="${categorySlug}"]`);
  if (btn) btn.classList.add('on');
  await loadProductsForCurrentCategory();
  renderProducts(true);
}

/**
 * Устанавливает режим сортировки
 * @param {string} mode - Код режима (pa - цена вверх, pd - цена вниз, nm - по имени)
 */
function setSortMode(mode) {
  srtMode = mode;
  renderProducts(true);
}

/**
 * Фильтрует и сортирует массив продуктов на основе текущих настроек
 * @returns {Array} Отфильтрованный и отсортированный массив продуктов
 */
function getFilteredProducts() {
  let list = allProducts.filter(p => curCat === 'all' || p.cat === curCat);
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
function renderProducts(resetLazy = false) {
  const grid = document.getElementById('pgrid');
  if (!grid) return;

  const list = getFilteredProducts();
  if (resetLazy || !visibleCount) visibleCount = PRODUCTS_BATCH_SIZE;

  if (!list.length) {
    grid.innerHTML = '<div class="no-res"><div class="no-res-icon">🔍</div><div style="font-size:16px;font-weight:500">Ничего не найдено</div></div>';
    if (lazyObserver) lazyObserver.disconnect();
    return;
  }

  const visibleProducts = list.slice(0, visibleCount);
  grid.innerHTML = visibleProducts.map(p => {
    const inCart = cart[p.id] || 0;
    return `<div class="pc ani" onclick='openProductModal(${JSON.stringify(p.id)})'>
      <div class="pc-img" style="background:${p.color}">
        ${p.badge ? `<span class="pc-badge" style="background:${p.catColor};color:#fff">${p.badge}</span>` : ''}
        ${p.emoji}
      </div>
      <div class="pc-body">
        <div class="pc-cat" style="color:${p.catColor}">${cats.find(c => c.slug === p.cat)?.name || 'Товар'}</div>
        <div class="pc-name">${p.name}</div>
        <div class="pc-brand">${p.brand}</div>
        <div class="pc-desc">${p.desc.slice(0, 75)}…</div>
        <div class="pc-foot">
          <div><div class="pc-price" style="color:var(--green)">${p.price}₽</div><div class="pc-unit">${p.unit}</div></div>
          ${inCart ? `<div class="qty-wrap" onclick="event.stopPropagation()"><button class="qb" onclick='updateCartQuantity(${JSON.stringify(p.id)},-1)'>−</button><span class="qn">${inCart}</span><button class="qb" onclick='updateCartQuantity(${JSON.stringify(p.id)},1)'>+</button></div>`
        : `<button class="btn-add" onclick='event.stopPropagation();addToCart(${JSON.stringify(p.id)})'>В корзину</button>`}
        </div>
      </div>
    </div>`;
  }).join('') + '<div id="products-lazy-sentinel" style="height:1px"></div>';

  const sentinel = document.getElementById('products-lazy-sentinel');
  if (lazyObserver) lazyObserver.disconnect();
  lazyObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    if (visibleCount >= list.length) {
      lazyObserver.disconnect();
      return;
    }
    visibleCount += PRODUCTS_BATCH_SIZE;
    renderProducts(false);
  }, { rootMargin: '300px 0px' });
  if (sentinel) lazyObserver.observe(sentinel);
}

// ═══ MODAL ═══

/**
 * Открывает модальное окно с деталями продукта
 * @param {number} id - ID продукта
 */
function openProductModal(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  const inCart = cart[p.id] || 0;

  document.getElementById('mcontent').innerHTML = `
    <div class="m-img" style="background:${p.color}">${p.emoji}</div>
    <div class="m-body">
      <div class="m-cat" style="color:${p.catColor}">${cats.find(c => c.slug === p.cat)?.name || 'Товар'}</div>
      <div class="m-name">${p.name}</div>
      <div class="m-brand">${p.brand}</div>
      <div class="m-price-row"><div class="m-price">${p.price}₽</div><div class="m-per">/ ${p.unit}</div></div>
      <div class="m-desc">${p.desc}</div>
      <div class="m-attrs">${Object.entries(p.attrs).map(([k, v]) => `<div class="m-attr"><div class="m-albl">${k}</div><div class="m-aval">${v}</div></div>`).join('')}</div>
      <div class="m-foot">
        ${inCart ? `<div class="qty-wrap"><button class="qb" onclick='updateCartQuantity(${JSON.stringify(p.id)},-1);openProductModal(${JSON.stringify(p.id)})'>−</button><span class="qn">${inCart}</span><button class="qb" onclick='updateCartQuantity(${JSON.stringify(p.id)},1);openProductModal(${JSON.stringify(p.id)})'>+</button></div><span style="font-size:13px;color:var(--ink3)">В корзине: ${inCart} шт.</span>`
      : `<button class="btn-solid" style="flex:1;padding:13px;font-size:15px;border-radius:12px" onclick='addToCart(${JSON.stringify(p.id)});openProductModal(${JSON.stringify(p.id)})'>Добавить в корзину</button>`}
      </div>
    </div>`;
  document.getElementById('pmodal').classList.add('open');
}

function normalizeProductAttrs(rawAttrs, fallbackCategoryName) {
  if (!rawAttrs) return { Категория: fallbackCategoryName || 'Товар' };

  if (typeof rawAttrs === 'string') {
    try {
      const parsed = JSON.parse(rawAttrs);
      return normalizeProductAttrs(parsed, fallbackCategoryName);
    } catch (_e) {
      return { Описание: rawAttrs };
    }
  }

  if (Array.isArray(rawAttrs)) {
    const fromArray = {};
    rawAttrs.forEach((item, idx) => {
      if (item && typeof item === 'object') {
        const key = item.key || item.name || item.label || `Параметр ${idx + 1}`;
        const value = item.value ?? item.val ?? item.text ?? '';
        fromArray[key] = String(value);
      }
    });
    return Object.keys(fromArray).length ? fromArray : { Категория: fallbackCategoryName || 'Товар' };
  }

  if (typeof rawAttrs === 'object') {
    return Object.fromEntries(Object.entries(rawAttrs).map(([k, v]) => [k, String(v)]));
  }

  return { Категория: fallbackCategoryName || 'Товар' };
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
  renderProducts(true);
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
  renderProducts(true);
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
    const p = getProductById(id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

/**
 * Ищет товар по ID сначала в текущих данных каталога, затем в локальном демо-списке
 * @param {number|string} id - ID товара
 * @returns {object|undefined}
 */
function getProductById(id) {
  const key = String(id);
  return allProducts.find(p => String(p.id) === key);
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
    const p = getProductById(id);
    if (!p) {
      return `<div class="ci"><div class="ci-emoji">📦</div><div class="ci-info"><div class="ci-name">Товар недоступен</div><div class="ci-meta">ID: ${id}</div></div><div class="qty-wrap"><button class="qb" onclick='updateCartQuantity(${JSON.stringify(id)},-1)'>−</button><span class="qn">${q}</span><button class="qb" onclick='updateCartQuantity(${JSON.stringify(id)},1)'>+</button></div><div class="ci-price">—</div><button class="ci-del" onclick='removeFromCart(${JSON.stringify(id)})' aria-label="Удалить">✕</button></div>`;
    }
    return `<div class="ci"><div class="ci-emoji">${p.emoji}</div><div class="ci-info"><div class="ci-name">${p.name}</div><div class="ci-meta">${p.brand} · ${p.unit} · ${p.price}₽/шт.</div></div><div class="qty-wrap"><button class="qb" onclick='updateCartQuantity(${JSON.stringify(id)},-1)'>−</button><span class="qn">${q}</span><button class="qb" onclick='updateCartQuantity(${JSON.stringify(id)},1)'>+</button></div><div class="ci-price">${p.price * q}₽</div><button class="ci-del" onclick='removeFromCart(${JSON.stringify(id)})' aria-label="Удалить">✕</button></div>`;
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
    const p = getProductById(id);
    if (!p) return '';
    return `<div class="crow"><span class="crow-lbl">${p.emoji} ${p.name} ×${q}</span><span class="crow-val">${p.price * q}₽</span></div>`;
  }).join('');

  document.getElementById('co-rows').innerHTML = `<div class="crow" style="border-top:1px solid var(--bg2);margin-top:8px;padding-top:14px"><span class="crow-lbl" style="font-weight:700">К оплате</span><span class="crow-total">${total}₽</span></div>`;

  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('co-date');
  if (dateInput) {
    dateInput.min = today;
    dateInput.value = today;
  }

  if (user) {
    const nmInput = document.getElementById('co-nm');
    const lnInput = document.getElementById('co-ln');
    const phInput = document.getElementById('co-ph');
    if (nmInput) nmInput.value = user.name || '';
    if (lnInput) lnInput.value = user.lastname || '';
    if (phInput) phInput.value = user.phone || '';
  }
}

/**
 * Обработка оформления заказа
 */
async function placeOrder() {
  if (!user) {
    showToast('⚠️', 'Войдите для оформления заказа');
    navigateToView('auth');
    return;
  }

  const items = Object.entries(cart)
    .map(([id, q]) => ({ id, q, p: getProductById(id) }))
    .filter(x => x.p);
  if (!items.length) {
    showToast('⚠️', 'Корзина пуста');
    return;
  }

  const timeSlot = document.querySelector('.tslot.on');
  const dateInput = document.getElementById('co-date');
  const pDate = dateInput ? dateInput.value : '—';
  const pTime = timeSlot ? timeSlot.textContent : 'не выбрано';
  const addr = ADDRS[selAddr];

  const nm = document.getElementById('co-nm') ? document.getElementById('co-nm').value.trim() : '';
  const ln = document.getElementById('co-ln') ? document.getElementById('co-ln').value.trim() : '';
  const ph = document.getElementById('co-ph') ? document.getElementById('co-ph').value.trim() : '';

  // Найдем поле комментария по соседству с co-ph, у него нет id
  const commentEl = document.querySelector('#view-checkout textarea');
  const userComment = commentEl ? commentEl.value.trim() : '';

  const fullComment = `Самовывоз: ${pDate}, ${pTime}${userComment ? '\nКомментарий: ' + userComment : ''}`;

  const payload = {
    items: items.map(x => ({ id: x.id, quantity: x.q, price_at_purchase: x.p.price })),
    total_amount: calculateCartTotal(),
    delivery_address: addr,
    customer_name: (nm + ' ' + ln).trim(),
    customer_phone: ph,
    comment: fullComment
  };

  try {
    const res = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка оформления');

    cart = {};
    updateCartBadge();
    saveToLocalStorage();
    showToast('🎉', 'Заказ #' + data.order_number + ' оформлен!');
    await loadOrders();
    navigateToView('orders');
  } catch (err) {
    showToast('⚠️', err.message);
  }
}

/**
 * Загружает заказы пользователя с бэкенда
 */
async function loadOrders() {
  if (!user) {
    orders = [];
    return;
  }
  try {
    const res = await fetch('http://localhost:3000/api/orders', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load orders');
    const data = await res.json();

    orders = data.map(o => {
      // Parse comment to extract date/time if needed, or just keep as comment
      const commentParts = o.comment ? o.comment.replace('Самовывоз: ', '').split(', ') : ['—', 'не выбрано'];
      const pDate = commentParts[0] || '—';
      const pTime = commentParts[1] || 'не выбрано';

      const createdDate = new Date(o.created_at);

      return {
        id: '#' + o.order_number,
        date: createdDate.toLocaleDateString('ru-RU'),
        pDate: pDate,
        pTime: pTime,
        addr: o.delivery_address || 'Не указан',
        items: o.items || [],
        total: o.total_amount,
        status: o.status
      };
    });
  } catch (err) {
    console.error('Error loading orders:', err);
  }
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
    const product = allProducts.find(x => x.name === item.name);
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
    await loadOrders();
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
    await loadOrders();
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
    const res = await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка выхода');

    user = null;
    orders = [];
    updateAuthUI();
    navigateToView('home');
    showToast('👋', 'Вы вышли из аккаунта');
  } catch (err) {
    console.error('Logout error:', err);
    // В случае ошибки на сервере всё равно сбрасываем локальное состояние для безопасности
    user = null;
    orders = [];
    updateAuthUI();
    navigateToView('home');
    showToast('👋', 'Сессия завершена');
  }
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
      if (data.user) {
        user = {
          name: data.user.first_name,
          lastname: data.user.last_name,
          phone: data.user.phone,
          email: data.user.email
        };
      } else {
        user = null;
      }
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
    const res = await fetch(apiUrl('/categories'));
    if (!res.ok) throw new Error('Failed to fetch categories');
    cats = await res.json();
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
  let html = '';

  cats.forEach(c => {
    const icon = icons[c.slug] || '📦';
    html += `<button class="ftab ftab-${c.slug} ${curCat === c.slug ? 'on' : ''}" data-cat="${c.slug}" onclick="filterByCategory('${c.slug}')">${icon} ${c.name}</button>`;
  });
  html += `<button class="ftab ${curCat === 'all' ? 'on' : ''}" data-cat="all" onclick="filterByCategory('all')">Все товары</button>`;

  container.innerHTML = html;
}

async function loadProductsForCurrentCategory() {
  const selectedCat = cats.find(c => c.slug === curCat);
  const categoryId = curCat === 'all' ? 'all' : (selectedCat ? selectedCat.id : 'all');
  const productsFromApi = await fetchProductsByCategory(categoryId);

  if (!Array.isArray(productsFromApi)) return;

  const categoriesById = Object.fromEntries(cats.map((category) => [String(category.id), category]));

  allProducts = productsFromApi.map((p) => {
    const category = categoriesById[String(p.category_id)] || selectedCat || null;

    return {
      id: p.id,
      cat: category?.slug || 'other',
      name: p.name,
      brand: p.brand || 'Без бренда',
      desc: p.description || 'Описание скоро появится.',
      price: Number(p.price) || 0,
      unit: p.unit_name || p.unit || 'шт.',
      emoji: p.emoji || '📦',
      badge: p.badge || null,
      color: p.bg_color || p.color || 'rgba(26,74,107,.07)',
      catColor: category?.color_hex || p.cat_color || '#1A4A6B',
      attrs: normalizeProductAttrs(
        p.attrs || p.attributes || p.specs,
        category?.name || 'Товар'
      ),
    };
  });
}

/**
 * Загружает продукты по категории с бэкенда
 * @param {string} categoryId - ID категории
 */
async function fetchProductsByCategory(categoryId) {
  try {
    const url = categoryId && categoryId !== 'all'
      ? apiUrl(`/products?category_id=${categoryId}`)
      : apiUrl('/products');
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
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

  updateCartBadge();
  await checkAuthStatus();
  await loadOrders();
  await fetchCategories();
  if (curCat === 'all' && cats.length) curCat = cats[0].slug;
  renderCategoryTabs();
  await loadProductsForCurrentCategory();
  renderProducts(true);
  navigateToPath(window.location.pathname);
})();
