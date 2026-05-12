// ui/src/components/admin/AdminSettings.jsx
import { useState, useEffect, useCallback } from 'react';
import ApiStorage from '../../api/ApiStorage';
import useSiteSettingsStore from '../../store/useSiteSettingsStore';
import './AdminSettings.css';

/**
 * AdminSettings — компонент управления динамическими настройками сайта.
 *
 * Отображает таблицу всех настроек из таблицы site_settings (БД).
 * Каждую строку можно отредактировать инлайн и сохранить через PUT /api/admin/settings/:key.
 * После сохранения локально обновляет кеш Zustand (useSiteSettingsStore).
 */
function AdminSettings() {
  const [rows, setRows] = useState([]);          // Полный список настроек (с label, updated_at)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingKey, setEditingKey] = useState(null); // Ключ редактируемой строки
  const [editValue, setEditValue] = useState('');      // Текущее значение в инпуте
  const [saving, setSaving] = useState(false);

  const { patchSetting } = useSiteSettingsStore();

  // ── Загрузка списка настроек ─────────────────────────────────────────────
  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ApiStorage.admin.settings.getAll();
      setRows(data);
    } catch (err) {
      setError('Не удалось загрузить настройки: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // ── Начать редактирование строки ─────────────────────────────────────────
  const startEdit = (row) => {
    setEditingKey(row.key);
    setEditValue(row.value);
  };

  // ── Отменить редактирование ──────────────────────────────────────────────
  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
  };

  // ── Сохранить изменение ──────────────────────────────────────────────────
  const saveEdit = async (key) => {
    if (!editValue.trim()) return;
    setSaving(true);
    try {
      await ApiStorage.admin.settings.update(key, editValue.trim());

      // Обновляем локальный список таблицы
      setRows((prev) =>
        prev.map((r) =>
          r.key === key
            ? { ...r, value: editValue.trim(), updated_at: new Date().toISOString() }
            : r
        )
      );

      // Синхронизируем публичный кеш (useSiteSettingsStore),
      // чтобы изменение сразу отразилось на фронте без перезагрузки
      patchSetting(key, editValue.trim());

      setEditingKey(null);
      setEditValue('');
    } catch (err) {
      alert('Не удалось сохранить: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Форматирование даты ───────────────────────────────────────────────────
  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // ── Рендер ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return <div className="admin-settings__loading">Загрузка настроек...</div>;
  }

  if (error) {
    return <div className="admin-settings__error">{error}</div>;
  }

  return (
    <div className="admin-settings">
      <div className="admin-settings__header">
        <div>
          <h2 className="admin-settings__title">Настройки сайта</h2>
          <p className="admin-settings__subtitle">
            Динамические блоки статистики и параметры, отображаемые на публичных страницах
          </p>
        </div>
      </div>

      <div className="admin-settings__table-wrap">
        <table className="admin-settings__table">
          <thead>
            <tr>
              <th>Ключ</th>
              <th>Название</th>
              <th>Значение</th>
              <th>Обновлено</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                {/* Ключ */}
                <td><span className="settings-key">{row.key}</span></td>

                {/* Человекочитаемое название */}
                <td><span className="settings-label">{row.label}</span></td>

                {/* Значение — либо дисплей, либо инпут */}
                <td>
                  {editingKey === row.key ? (
                    <div className="settings-value-cell">
                      <input
                        className="settings-input"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(row.key);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <span className="settings-value-display">{row.value}</span>
                  )}
                </td>

                {/* Дата последнего обновления */}
                <td><span className="settings-date">{formatDate(row.updated_at)}</span></td>

                {/* Действия */}
                <td>
                  {editingKey === row.key ? (
                    <div className="settings-value-cell">
                      <button
                        className="settings-btn-save"
                        onClick={() => saveEdit(row.key)}
                        disabled={saving || !editValue.trim()}
                      >
                        {saving ? 'Сохранение...' : 'Сохранить'}
                      </button>
                      <button className="settings-btn-cancel" onClick={cancelEdit}>
                        Отмена
                      </button>
                    </div>
                  ) : (
                    <button className="settings-btn-edit" onClick={() => startEdit(row)}>
                      Изменить
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminSettings;
