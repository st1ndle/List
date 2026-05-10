// /src/api/ApiStorage.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiStorage {
  /**
   * Базовый метод для отправки запросов
   * @param {string} endpoint - путь (например, /api/auth/me)
   * @param {object} options  - параметры fetch (method, body, headers и т.д.)
   * @returns {Promise<any>}
   */
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || response.statusText || 'Произошла ошибка при запросе';
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      console.error(`[ApiStorage] Ошибка запроса к ${endpoint}:`, error);
      throw error;
    }
  }

  // ─── Авторизация ──────────────────────────────────────────────────────────
  static auth = {
    /** Регистрация пользователя
     * @param {{ firstName, lastName, phone, email, password }} userData */
    register: (userData) => ApiStorage.request('/api/auth/register', { method: 'POST', body: userData }),

    /** Авторизация пользователя
     * @param {{ login, password }} credentials */
    login: (credentials) => ApiStorage.request('/api/auth/login', { method: 'POST', body: credentials }),

    /** Выход из аккаунта */
    logout: () => ApiStorage.request('/api/auth/logout', { method: 'POST' }),

    /** Получение текущего пользователя (проверка сессии)
     * @returns {{ user: object|null }} */
    me: () => ApiStorage.request('/api/auth/me', { method: 'GET' }),
  };

  // ─── Заказы ───────────────────────────────────────────────────────────────
  static orders = {
    /** Создание нового заказа
     * @param {{ items, total_amount, delivery_address?, comment?,
     *           customer_name?, customer_phone?, warehouse_code? }} orderData */
    create: (orderData) => ApiStorage.request('/api/orders', { method: 'POST', body: orderData }),

    /** Получение истории заказов текущего пользователя */
    getAll: () => ApiStorage.request('/api/orders', { method: 'GET' }),
  };

  // ─── Каталог ──────────────────────────────────────────────────────────────
  static catalog = {
    /** Получение списка всех категорий */
    getCategories: () => ApiStorage.request('/categories', { method: 'GET' }),

    /** Получение товаров (с возможностью фильтрации по категории)
     * @param {string} [categoryId] */
    getProducts: (categoryId) => {
      const qs = categoryId ? `?category_id=${encodeURIComponent(categoryId)}` : '';
      return ApiStorage.request(`/products${qs}`, { method: 'GET' });
    },

    /** Получение минимальных цен для категорий
     * @param {string[]} [categories] - массив ID или названий категорий
     * @param {number}   [limit=4]    - кол-во категорий, если categories не передан */
    getLowestPrices: (categories, limit = 4) =>
      ApiStorage.request('/api/categories/lowest-prices', { method: 'POST', body: { categories, limit } }),
  };

  // ─── Склады (публичные) ───────────────────────────────────────────────────
  static warehouses = {
    /** Получение списка активных складов */
    getAll: () => ApiStorage.request('/api/warehouses', { method: 'GET' }),
  };

  // ─── Здоровье ─────────────────────────────────────────────────────────────
  static health = {
    /** Проверка статуса сервера и БД */
    check: () => ApiStorage.request('/health', { method: 'GET' }),
  };

  // ─── Администраторские методы ─────────────────────────────────────────────
  static admin = {
    orders: {
      /**
       * Список заказов с пагинацией и поиском (только для admin)
       * @param {{ search?, cursor?, limit?, status? }} [params]
       * @returns {{ data: object[], nextCursor: number|null }}
       */
      getAll: (params = {}) => {
        const qs = new URLSearchParams(
          Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
        ).toString();
        return ApiStorage.request(`/api/admin/orders${qs ? `?${qs}` : ''}`, { method: 'GET' });
      },

      /**
       * Изменение статуса заказа (только для admin)
       * @param {string} orderId - UUID заказа
       * @param {'new'|'processing'|'completed'|'cancelled'} status
       */
      updateStatus: (orderId, status) =>
        ApiStorage.request(`/api/admin/orders/${orderId}/status`, { method: 'PATCH', body: { status } }),
    },

    warehouses: {
      /**
       * Список всех складов, включая неактивные (только для admin)
       */
      getAll: () => ApiStorage.request('/api/admin/warehouses', { method: 'GET' }),

      /**
       * Создание склада (только для admin)
       * @param {{ warehouse_code, name, city, address, phone?,
       *           working_hours_start?, working_hours_end?, is_active? }} data
       */
      create: (data) => ApiStorage.request('/api/admin/warehouses', { method: 'POST', body: data }),

      /**
       * Обновление склада (только для admin)
       * @param {string} id   - UUID склада
       * @param {object} data - те же поля что и create
       */
      update: (id, data) => ApiStorage.request(`/api/admin/warehouses/${id}`, { method: 'PUT', body: data }),

      /**
       * Мягкое удаление (деактивация) склада (только для admin)
       * @param {string} id - UUID склада
       */
      remove: (id) => ApiStorage.request(`/api/admin/warehouses/${id}`, { method: 'DELETE' }),
    },
  };
}

export default ApiStorage;
