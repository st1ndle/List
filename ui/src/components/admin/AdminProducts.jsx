import React, { useState, useEffect } from 'react';
import ApiStorage from '../../api/ApiStorage';
import useToastStore from '../../store/useToastStore';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { ColorPicker } from '../ui/ColorPicker';
import { Button, IconButton } from '../ui/Button';
import './AdminProducts.css';
import './Admin.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  
  // Pagination
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [attrEntries, setAttrEntries] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, categoryId, priceMin, priceMax, offset]);

  // When filters change, reset offset to 0
  useEffect(() => {
    setOffset(0);
  }, [search, categoryId, priceMin, priceMax]);

  const fetchCategories = async () => {
    try {
      const data = await ApiStorage.admin.categories.getAll();
      setCategories(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await ApiStorage.admin.products.getAll({
        search,
        category_id: categoryId,
        price_min: priceMin,
        price_max: priceMax,
        limit,
        offset
      });
      setProducts(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
      useToastStore.getState().showToast('❌', 'Ошибка при загрузке продуктов: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct({
      category_id: categories.length > 0 ? categories[0].id : '',
      name: '',
      brand: '',
      description: '',
      price: 0,
      unit_name: 'шт',
      emoji: '',
      badge: '',
      bg_color: '#ffffff',
      attributes: '',
      stock_quantity: 0,
      is_active: true
    });
    setAttrEntries([]);
    setIsModalOpen(true);
  };

  const handleEdit = (p) => {
    let parsedAttrs = {};
    if (p.attributes) {
      try {
        parsedAttrs = typeof p.attributes === 'object' ? p.attributes : JSON.parse(p.attributes);
      } catch (e) {
        console.error('Failed to parse attributes', e);
      }
    }
    setEditingProduct({
      ...p,
      attributes: p.attributes
    });
    setAttrEntries(Object.entries(parsedAttrs).map(([key, value]) => ({ key, value })));
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Точно удалить продукт?')) return;
    try {
      await ApiStorage.admin.products.remove(id);
      fetchProducts();
    } catch (e) {
      useToastStore.getState().showToast('❌', 'Ошибка при удалении: ' + e.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editingProduct };
      
      // Convert attrEntries to object and sort by key
      const attrsObj = {};
      const sortedEntries = [...attrEntries].sort((a, b) => a.key.localeCompare(b.key));
      sortedEntries.forEach(entry => {
        if (entry.key.trim()) {
          attrsObj[entry.key.trim()] = entry.value;
        }
      });
      
      payload.attributes = JSON.stringify(attrsObj);

      if (payload.id) {
        await ApiStorage.admin.products.update(payload.id, payload);
      } else {
        await ApiStorage.admin.products.create(payload);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      useToastStore.getState().showToast('❌', 'Ошибка при сохранении: ' + err.message);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCategoryId('');
    setPriceMin('');
    setPriceMax('');
  };

  return (
    <div className="admin-products admin-section">
      <div className="admin-products-header">
        <h2>Продукты</h2>
        <Button onClick={handleCreate} primary>+ Добавить</Button>
      </div>

      <div className="admin-products-filters">
        <Input 
          type="text" 
          placeholder="🔍 Поиск по названию" 
          value={search} 
          onChange={e => setSearch(e.target.value)}
        />
        <Select 
          value={categoryId} 
          onChange={e => setCategoryId(e.target.value)}
          options={[
            { value: '', label: 'Все категории' },
            ...categories.map(c => ({ value: c.id, label: c.name }))
          ]}
        />
        <Input 
          type="number" 
          placeholder="Цена от" 
          value={priceMin} 
          onChange={e => setPriceMin(e.target.value)}
          className="w-24"
        />
        <Input 
          type="number" 
          placeholder="Цена до" 
          value={priceMax} 
          onChange={e => setPriceMax(e.target.value)}
          className="w-24"
        />
        <Button onClick={resetFilters} variant="outline">Сбросить</Button>
      </div>

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Категория</th>
                  <th>Цена</th>
                  <th>Склад</th>
                  <th>Акт.</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      {p.emoji && <span className="mr-2">{p.emoji}</span>}
                      {p.name}
                      {p.brand && <span className="text-muted ml-2">({p.brand})</span>}
                    </td>
                    <td>{p.category_name}</td>
                    <td>{p.price} ₽</td>
                    <td>{p.stock_quantity} {p.unit_name}</td>
                    <td>{p.is_active ? '✅' : '❌'}</td>
                    <td>
                      <div className="table-actions">
                        <IconButton variant="neutral" ariaLabel="Редактировать" onClick={() => handleEdit(p)}>✏️</IconButton>
                        <IconButton variant="danger" ariaLabel="Удалить" onClick={() => handleDelete(p.id)}>🗑️</IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-4">Продукты не найдены</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <Button 
              variant="outline" 
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            >
              &lt; Пред
            </Button>
            <span className="pagination-info">
              Страница {Math.floor(offset / limit) + 1} из {Math.max(1, Math.ceil(total / limit))}
            </span>
            <Button 
              variant="outline" 
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
            >
              След &gt;
            </Button>
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal-large">
            <h3>{editingProduct.id ? 'Редактировать продукт' : 'Новый продукт'}</h3>
            <form onSubmit={handleSave} className="admin-form-flex">
              <div className="grid-form">
                {/* Row 1: Full Width Name */}
                <Input
                  label="Название (name):"
                  required
                  type="text"
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="col-span-3"
                />
                
                {/* Row 2: Category, Brand, Price */}
                <Select
                  label="Категория (category_id):"
                  required
                  value={editingProduct.category_id}
                  onChange={e => setEditingProduct({...editingProduct, category_id: e.target.value})}
                  options={[
                    { value: '', label: 'Выберите категорию' },
                    ...categories.map(c => ({ value: c.id, label: c.name }))
                  ]}
                />

                <Input
                  label="Бренд (brand):"
                  type="text"
                  value={editingProduct.brand || ''}
                  onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})}
                />

                <Input
                  label="Цена (price):"
                  required
                  type="number"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                />

                {/* Row 3: Unit Name, Emoji, Badge */}
                <Input
                  label="Единица измерения (unit_name):"
                  type="text"
                  value={editingProduct.unit_name || ''}
                  onChange={e => setEditingProduct({...editingProduct, unit_name: e.target.value})}
                />

                <Input
                  label="Эмодзи (emoji):"
                  type="text"
                  value={editingProduct.emoji || ''}
                  onChange={e => setEditingProduct({...editingProduct, emoji: e.target.value})}
                />

                <Input
                  label="Бейдж (badge):"
                  type="text"
                  value={editingProduct.badge || ''}
                  onChange={e => setEditingProduct({...editingProduct, badge: e.target.value})}
                />

                {/* Row 4: Bg Color, Stock Quantity, Active Checkbox */}
                <ColorPicker
                  label="Цвет фона (bg_color):"
                  value={editingProduct.bg_color || '#ffffff'}
                  onChange={e => setEditingProduct({...editingProduct, bg_color: e.target.value})}
                />

                <Input
                  label="Остаток (stock_quantity):"
                  type="number"
                  value={editingProduct.stock_quantity || 0}
                  onChange={e => setEditingProduct({...editingProduct, stock_quantity: parseInt(e.target.value)})}
                />

                <div className="flex items-center" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <Checkbox
                    label="Активен (is_active)"
                    checked={editingProduct.is_active}
                    onChange={e => setEditingProduct({...editingProduct, is_active: e.target.checked})}
                  />
                </div>

                {/* Row 5: Description */}
                <div className="form-group col-span-3">
                  <label className="ui-input-label">Описание (description):</label>
                  <textarea value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="admin-textarea" rows="3"></textarea>
                </div>

                {/* Row 6: Attributes */}
                <div className="form-group col-span-3">
                  <label className="ui-input-label">Атрибуты:</label>
                  <div className="attributes-table">
                    <div className="attr-header">
                      <span>Название</span>
                      <span>Значение</span>
                      <span></span>
                    </div>
                    {attrEntries.map((entry, index) => (
                      <div key={index} className="attr-row">
                        <Input
                          type="text"
                          value={entry.key}
                          onChange={(e) => {
                            const newEntries = [...attrEntries];
                            newEntries[index].key = e.target.value;
                            setAttrEntries(newEntries);
                          }}
                          placeholder="Например: Объем"
                        />
                        <Input
                          type="text"
                          value={entry.value}
                          onChange={(e) => {
                            const newEntries = [...attrEntries];
                            newEntries[index].value = e.target.value;
                            setAttrEntries(newEntries);
                          }}
                          placeholder="Например: 0.5л"
                        />
                        <IconButton
                          variant="danger"
                          ariaLabel="Удалить атрибут"
                          onClick={() => {
                            setAttrEntries(attrEntries.filter((_, i) => i !== index));
                          }}
                        >
                          🗑️
                        </IconButton>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => setAttrEntries([...attrEntries, { key: '', value: '' }])}
                    >
                      + Добавить атрибут
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
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
