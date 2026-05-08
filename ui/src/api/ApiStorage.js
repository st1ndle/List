// /src/api/ApiStorage.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiStorage {
  /**
   * Базовый метод для отправки запросов
   * @param {string} endpoint - путь (например, /api/auth/me)
   * @param {object} options - параметры fetch (method, body, headers и т.д.)
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
      // Важно для работы с cookie/сессиями
      credentials: 'include',
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      // Пытаемся распарсить JSON, если он есть
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // Извлекаем сообщение об ошибке с бэкенда
        const errorMsg = data?.error || data?.message || response.statusText || 'Произошла ошибка при запросе';
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      console.error(`[ApiStorage] Ошибка запроса к ${endpoint}:`, error);
      throw error;
    }
  }

  // --- Авторизация ---
  static auth = {
    /**
     * Регистрация пользователя
     * @param {object} userData - { firstName, lastName, phone, email, password }
     */
    register: (userData) => ApiStorage.request('/api/auth/register', { method: 'POST', body: userData }),
    
    /**
     * Авторизация пользователя
     * @param {object} credentials - { login, password }
     */
    login: (credentials) => ApiStorage.request('/api/auth/login', { method: 'POST', body: credentials }),
    
    /**
     * Выход из аккаунта
     */
    logout: () => ApiStorage.request('/api/auth/logout', { method: 'POST' }),
    
    /**
     * Получение текущего пользователя (проверка сессии)
     */
    me: () => ApiStorage.request('/api/auth/me', { method: 'GET' }),
  };

  // --- Заказы ---
  static orders = {
    /**
     * Создание нового заказа
     * @param {object} orderData - { items, total_amount, delivery_address, comment, customer_name, customer_phone }
     */
    create: (orderData) => ApiStorage.request('/api/orders', { method: 'POST', body: orderData }),
    
    /**
     * Получение истории заказов пользователя
     */
    getAll: () => ApiStorage.request('/api/orders', { method: 'GET' }),
  };

  // --- Каталог ---
  static catalog = {
    /**
     * Получение списка всех категорий
     */
    getCategories: () => ApiStorage.request('/categories', { method: 'GET' }),
    
    /**
     * Получение товаров (с возможностью фильтрации по категории)
     * @param {string} [categoryId] - ID категории для фильтрации
     */
    getProducts: (categoryId) => {
      const qs = categoryId ? `?category_id=${encodeURIComponent(categoryId)}` : '';
      return ApiStorage.request(`/products${qs}`, { method: 'GET' });
    },

    /**
     * Получение самых дешевых цен для категорий
     * @param {string[]} [categories] - массив ID или названий категорий
     * @param {number} [limit=4] - количество категорий, если categories не передан
     */
    getLowestPrices: (categories, limit = 4) => 
      ApiStorage.request('/api/categories/lowest-prices', { 
        method: 'POST', 
        body: { categories, limit } 
      }),
  };

  // --- Склады ---
  static warehouses = {
    /**
     * Получение списка складов
     */
    getAll: () => ApiStorage.request('/api/warehouses', { method: 'GET' }),
  };

  // --- Здоровье ---
  static health = {
    /**
     * Проверка статуса сервера и БД
     */
    check: () => ApiStorage.request('/health', { method: 'GET' }),
  };
}

export default ApiStorage;
