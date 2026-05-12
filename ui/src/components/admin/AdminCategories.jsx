import React, { useState, useEffect } from 'react';
import ApiStorage from '../../api/ApiStorage';
import useToastStore from '../../store/useToastStore';
import './AdminCategories.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCategories = async () => {
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
  };

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
    <div className="admin-categories">
      <div className="admin-categories-header">
        <h2>Категории</h2>
        <button className="btn-primary" onClick={handleCreate}>+ Добавить</button>
      </div>

      <div className="admin-categories-filters">
        <input 
          type="text" 
          placeholder="🔍 Поиск по названию..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          className="admin-input search-input"
        />
      </div>

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : (
        <div className="admin-categories-list">
          {categories.map(c => (
            <div key={c.id} className="admin-category-card">
              <div className="category-info">
                <span className="category-color" style={{ backgroundColor: c.color_hex }}></span>
                <strong>{c.name}</strong>
                <span className="category-slug">{c.slug}</span>
                <span className="category-order">Order: {c.sort_order}</span>
                {!c.is_active && <span className="badge-inactive">Неактивна</span>}
              </div>
              <div className="category-actions">
                <button className="btn-icon" onClick={() => handleEdit(c)}>✏️</button>
                <button className="btn-icon btn-danger" onClick={() => handleDelete(c.id)}>🗑️</button>
              </div>
            </div>
          ))}
          {categories.length === 0 && <div className="empty-state">Категории не найдены</div>}
        </div>
      )}

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>{editingCategory.id ? 'Редактировать категорию' : 'Новая категория'}</h3>
            <form onSubmit={handleSave} className="admin-form">
              <div className="form-group">
                <label>Название (name):</label>
                <input 
                  required 
                  type="text" 
                  value={editingCategory.name} 
                  onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="admin-input"
                />
              </div>
              <div className="form-group">
                <label>Слаг (slug):</label>
                <input 
                  required 
                  type="text" 
                  value={editingCategory.slug} 
                  onChange={e => setEditingCategory({...editingCategory, slug: e.target.value})}
                  className="admin-input"
                />
              </div>
              <div className="form-group">
                <label>Цвет (color_hex):</label>
                <div className="color-input-wrapper">
                  <input 
                    required 
                    type="color" 
                    value={editingCategory.color_hex} 
                    onChange={e => setEditingCategory({...editingCategory, color_hex: e.target.value})}
                    className="admin-color-picker"
                  />
                  <input 
                    type="text" 
                    value={editingCategory.color_hex} 
                    onChange={e => setEditingCategory({...editingCategory, color_hex: e.target.value})}
                    className="admin-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Порядок (sort_order):</label>
                <input 
                  required 
                  type="number" 
                  value={editingCategory.sort_order} 
                  onChange={e => setEditingCategory({...editingCategory, sort_order: Number(e.target.value)})}
                  className="admin-input"
                />
              </div>
              <div className="form-group-checkbox">
                <label>
                  <input 
                    type="checkbox" 
                    checked={editingCategory.is_active} 
                    onChange={e => setEditingCategory({...editingCategory, is_active: e.target.checked})}
                  />
                  Активна (is_active)
                </label>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Отмена</button>
                <button type="submit" className="btn-primary">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
