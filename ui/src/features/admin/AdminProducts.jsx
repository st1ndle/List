import { useState, useEffect, useCallback } from 'react';
import ApiStorage from '../../api/ApiStorage';
import useToastStore from '../../store/useToastStore';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { ColorPicker } from '../../components/ui/ColorPicker';
import { Button, IconButton } from '../../components/ui/Button';
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
  const [packCount, setPackCount] = useState('');
  const [unitsPerPack, setUnitsPerPack] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      const data = await ApiStorage.admin.categories.getAll();
      setCategories(data || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
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
  }, [search, categoryId, priceMin, priceMax, limit, offset]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

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
    setPackCount('');
    setUnitsPerPack('');
    setIsModalOpen(true);
  };

  const handleEdit = (p) => {
    setEditingProduct({ ...p });
    try {
      const parsed = p.attributes ? JSON.parse(p.attributes) : {};
      setAttrEntries(Object.entries(parsed).map(([key, val]) => ({ key, val })));
    } catch (e) {
      console.error('Error parsing product attributes:', e);
      setAttrEntries([]);
    }
    setPackCount('');
    setUnitsPerPack('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот продукт?')) return;
    try {
      await ApiStorage.admin.products.remove(id);
      fetchProducts();
    } catch (e) {
      useToastStore.getState().showToast('❌', 'Ошибка при удалении: ' + e.message);
    }
  };

  const handleAddAttr = () => {
    setAttrEntries([...attrEntries, { key: '', value: '' }]);
  };

  const handleRemoveAttr = (index) => {
    setAttrEntries(attrEntries.filter((_, i) => i !== index));
  };

  const handleAttrChange = (index, field, value) => {
    const next = [...attrEntries];
    next[index][field] = value;
    setAttrEntries(next);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Build attributes JSON
      const attrs = {};
      attrEntries.forEach(entry => {
        if (entry.key.trim()) {
          attrs[entry.key.trim()] = entry.value.trim();
        }
      });

      const payload = {
        ...editingProduct,
        attributes: Object.keys(attrs).length > 0 ? JSON.stringify(attrs) : null
      };

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
    setOffset(0);
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
          onChange={e => { setSearch(e.target.value); setOffset(0); }}
        />
        <Select 
          value={categoryId} 
          onChange={e => { setCategoryId(e.target.value); setOffset(0); }}
          options={[
            { value: '', label: 'Все категории' },
            ...categories.map(c => ({ value: c.id, label: c.name }))
          ]}
        />
        <Input 
          type="number" 
          placeholder="Цена от" 
          value={priceMin} 
          onChange={e => { setPriceMin(e.target.value); setOffset(0); }}
          className="w-24"
        />
        <Input 
          type="number" 
          placeholder="Цена до" 
          value={priceMax} 
          onChange={e => { setPriceMax(e.target.value); setOffset(0); }}
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

                {/* Pack Calculator */}
                <div className="form-group col-span-3" style={{ border: '1.5px solid var(--border)', borderRadius: '10px', padding: '16px', background: 'var(--bg2)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📦 Быстрый расчет остатка по упаковкам
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                    <div className="ui-input-group" style={{ marginBottom: 0 }}>
                      <label className="ui-input-label" style={{ fontSize: '11px' }}>Кол-во коробок/упаковок:</label>
                      <input
                        type="number"
                        placeholder="Например: 5"
                        value={packCount}
                        onChange={e => setPackCount(e.target.value)}
                        className="ui-input"
                        style={{ padding: '8px 12px', fontSize: '13px' }}
                      />
                    </div>
                    <div className="ui-input-group" style={{ marginBottom: 0 }}>
                      <label className="ui-input-label" style={{ fontSize: '11px' }}>Штук в одной коробке:</label>
                      <input
                        type="number"
                        placeholder="Например: 5"
                        value={unitsPerPack}
                        onChange={e => setUnitsPerPack(e.target.value)}
                        className="ui-input"
                        style={{ padding: '8px 12px', fontSize: '13px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const boxes = parseInt(packCount) || 0;
                          const rate = parseInt(unitsPerPack) || 0;
                          const total = boxes * rate;
                          if (total > 0) {
                            setEditingProduct({
                              ...editingProduct,
                              stock_quantity: total
                            });
                          }
                        }}
                        className="btn-solid"
                        style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '6px', whiteSpace: 'nowrap', height: '36px' }}
                      >
                        Установить остаток ({ (parseInt(packCount) || 0) * (parseInt(unitsPerPack) || 0) } шт.)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const boxes = parseInt(packCount) || 0;
                          const rate = parseInt(unitsPerPack) || 0;
                          const total = boxes * rate;
                          if (total > 0) {
                            setEditingProduct({
                              ...editingProduct,
                              stock_quantity: (editingProduct.stock_quantity || 0) + total
                            });
                          }
                        }}
                        className="btn-ghost"
                        style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '6px', whiteSpace: 'nowrap', height: '36px' }}
                      >
                        Прибавить (+{ (parseInt(packCount) || 0) * (parseInt(unitsPerPack) || 0) } шт.)
                      </button>
                    </div>
                  </div>
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
                          onChange={(e) => handleAttrChange(index, 'key', e.target.value)}
                          placeholder="Например: Объем"
                        />
                        <Input
                          type="text"
                          value={entry.value}
                          onChange={(e) => handleAttrChange(index, 'value', e.target.value)}
                          placeholder="Например: 0.5л"
                        />
                        <IconButton
                          variant="danger"
                          ariaLabel="Удалить атрибут"
                          onClick={() => handleRemoveAttr(index)}
                        >
                          🗑️
                        </IconButton>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={handleAddAttr}
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
