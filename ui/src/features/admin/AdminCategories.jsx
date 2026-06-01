import { useState, useEffect, useCallback } from 'react';
import ApiStorage from '../../api/ApiStorage';
import useToastStore from '../../store/useToastStore';
import { Input } from '../../components/ui/Input';
import { Button, IconButton } from '../../components/ui/Button';
import { ColorPicker } from '../../components/ui/ColorPicker';
import { Checkbox } from '../../components/ui/Checkbox';
import './AdminCategories.css';
import './Admin.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ApiStorage.admin.categories.getAll({ search });
      setCategories(data || []);
    } catch (e) {
      console.error(e);
      useToastStore.getState().showToast('❌', 'Ошибка при загрузке категорий: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCategories]);

  const handleCreate = () => {
    setEditingCategory({ name: '', slug: '', color_hex: '#000000', sort_order: 100, is_active: true });
    setIsModalOpen(true);
  };

  const handleEdit = (c) => {
    setEditingCategory({ ...c });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ВНИМАНИЕ: Все товары этой категории также будут удалены! Продолжить?')) return;
    try {
      await ApiStorage.admin.categories.remove(id);
      fetchCategories();
    } catch (e) {
      useToastStore.getState().showToast('❌', 'Ошибка при удалении: ' + e.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory.id) {
        await ApiStorage.admin.categories.update(editingCategory.id, editingCategory);
      } else {
        await ApiStorage.admin.categories.create(editingCategory);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      useToastStore.getState().showToast('❌', 'Ошибка при сохранении: ' + err.message);
    }
  };

  return (
    <div className="admin-categories admin-section">
      <div className="admin-categories-header">
        <h2>Категории</h2>
        <Button onClick={handleCreate} primary>+ Добавить</Button>
      </div>

      <div className="admin-categories-filters">
        <Input
          type="text"
          placeholder="🔍 Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Цвет</th>
                <th>Название</th>
                <th>Системное имя</th>
                <th>Порядок</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td>
                    <span className="category-color" style={{ backgroundColor: c.color_hex }}></span>
                  </td>
                  <td>{c.name}</td>
                  <td>{c.slug}</td>
                  <td>{c.sort_order}</td>
                  <td>{c.is_active ? '✅' : '❌'}</td>
                  <td>
                    <div className="table-actions">
                      <IconButton variant="neutral" ariaLabel="Редактировать" onClick={() => handleEdit(c)}>✏️</IconButton>
                      <IconButton variant="danger" ariaLabel="Удалить" onClick={() => handleDelete(c.id)}>🗑️</IconButton>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4">Категории не найдены</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>{editingCategory.id ? 'Редактировать категорию' : 'Новая категория'}</h3>
            <form onSubmit={handleSave} className="admin-modal-form">
              <Input
                label="Название:"
                required
                type="text"
                value={editingCategory.name}
                onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
              />

              <Input
                label="Системное имя:"
                required
                type="text"
                value={editingCategory.slug}
                onChange={e => setEditingCategory({ ...editingCategory, slug: e.target.value })}
              />

              <ColorPicker
                label="Цвет:"
                value={editingCategory.color_hex || '#000000'}
                onChange={e => setEditingCategory({ ...editingCategory, color_hex: e.target.value })}
              />

              <Input
                label="Порядок:"
                required
                type="number"
                value={editingCategory.sort_order}
                onChange={e => setEditingCategory({ ...editingCategory, sort_order: Number(e.target.value) })}
              />

              <Checkbox
                label="Активна"
                checked={editingCategory.is_active}
                onChange={e => setEditingCategory({ ...editingCategory, is_active: e.target.checked })}
              />

              <div className="admin-modal-actions">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Отмена</Button>
                <Button type="submit" primary>Сохранить</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
