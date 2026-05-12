// ui/src/store/useSiteSettingsStore.js
import { create } from 'zustand';
import ApiStorage from '../api/ApiStorage';

/**
 * Zustand-хранилище для динамических настроек сайта.
 *
 * Настройки загружаются один раз при первом вызове fetchSettings()
 * и кешируются в памяти (loaded: true).
 *
 * Использование в компоненте:
 *   const { fetchSettings, getSetting } = useSiteSettingsStore();
 *   useEffect(() => { fetchSettings(); }, []);
 *   const pallets = getSetting('stat_pallets', '17К');
 */
const useSiteSettingsStore = create((set, get) => ({
  /** Плоский объект { key: value } — все настройки сайта */
  settings: {},

  isLoading: false,

  /** true — данные уже загружены, повторный запрос не нужен */
  loaded: false,

  /**
   * Загружает настройки с сервера (GET /api/settings).
   * Идемпотентна: повторные вызовы игнорируются, если loaded === true.
   */
  fetchSettings: async () => {
    if (get().loaded) return;
    set({ isLoading: true });
    try {
      const data = await ApiStorage.settings.getAll();
      set({ settings: data, loaded: true });
    } catch (err) {
      console.error('[SiteSettings] Не удалось загрузить настройки:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Получает значение настройки по ключу.
   * Если ключ не найден — возвращает fallback (по умолчанию '').
   *
   * @param {string} key      - Ключ настройки, например 'stat_pallets'
   * @param {string} fallback - Значение по умолчанию
   * @returns {string}
   */
  getSetting: (key, fallback = '') => get().settings[key] ?? fallback,

  /**
   * Локально обновляет значение настройки (после успешного PUT в Admin UI).
   * Не делает запрос к серверу — только обновляет кеш.
   *
   * @param {string} key   - Ключ настройки
   * @param {string} value - Новое значение
   */
  patchSetting: (key, value) =>
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    })),
}));

export default useSiteSettingsStore;
