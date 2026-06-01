import { Component } from 'react';
import ApiStorage from '../../api/ApiStorage';
import useToastStore from '../../store/useToastStore';
import { Button, IconButton } from '../../components/ui/Button';
import './Admin.css';

/**
 * Классовый компонент для отображения списка складов в админке.
 */
class AdminWarehouses extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editingWarehouseId: null,
      editFormData: {}
    };
  }

  handleEditClick = (warehouse) => {
    this.setState({
      editingWarehouseId: warehouse.id,
      editFormData: { ...warehouse }
    });
  };

  handleCreateClick = () => {
    this.setState({
      editingWarehouseId: 'new',
      editFormData: {
        warehouse_code: '',
        name: '',
        city: '',
        address: '',
        working_hours_start: '09:00',
        working_hours_end: '18:00',
        is_active: true
      }
    });
  };

  handleCancelEdit = () => {
    this.setState({ editingWarehouseId: null, editFormData: {} });
  };

  handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    this.setState(prevState => ({
      editFormData: {
        ...prevState.editFormData,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  handleSave = async () => {
    const { editingWarehouseId, editFormData } = this.state;
    try {
      if (editingWarehouseId === 'new') {
        await ApiStorage.admin.warehouses.create(editFormData);
      } else {
        await ApiStorage.admin.warehouses.update(editingWarehouseId, editFormData);
      }
      this.setState({ editingWarehouseId: null, editFormData: {} });
      if (this.props.onRefresh) this.props.onRefresh();
    } catch (err) {
      useToastStore.getState().showToast('❌', `Ошибка: ${err.message}`);
    }
  };

  handleDelete = async () => {
    const { editingWarehouseId } = this.state;
    if (editingWarehouseId === 'new') return;
    if (!window.confirm('Вы уверены, что хотите удалить этот склад?')) return;
    try {
      await ApiStorage.admin.warehouses.remove(editingWarehouseId);
      this.setState({ editingWarehouseId: null, editFormData: {} });
      if (this.props.onRefresh) this.props.onRefresh();
    } catch (err) {
      useToastStore.getState().showToast('❌', `Ошибка удаления: ${err.message}`);
    }
  };

  render() {
    const { warehouses } = this.props;
    const { editingWarehouseId, editFormData } = this.state;

    return (
      <div className="admin-section">
        <div className="admin-header-actions">
          <h3>Управление складами</h3>
          <Button primary onClick={this.handleCreateClick}>
            + Добавить склад
          </Button>
        </div>

        {!warehouses || warehouses.length === 0 ? (
          <div className="admin-empty">Нет складов для отображения.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Код</th>
                <th>Название</th>
                <th>Город</th>
                <th>Адрес</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map(w => (
                <tr 
                  key={w.id} 
                  className="clickable-row"
                  onClick={() => this.handleEditClick(w)} 
                  title="Нажмите для редактирования"
                >
                  <td>{w.warehouse_code}</td>
                  <td>{w.name}</td>
                  <td>{w.city}</td>
                  <td>{w.address}</td>
                  <td>
                    <span className={`status-badge ${w.is_active ? 'active' : 'inactive'}`}>
                      {w.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {editingWarehouseId && (
          <div className="admin-modal-overlay" onClick={this.handleCancelEdit}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
              <IconButton 
                className="admin-modal-close" 
                ariaLabel="Закрыть" 
                onClick={this.handleCancelEdit}
              >
                &times;
              </IconButton>
              <h4 className="admin-modal-title">
                {editingWarehouseId === 'new' ? 'Новый склад' : 'Редактирование склада'}
              </h4>
              
              <div className="admin-modal-form">
                <div className="admin-modal-field">
                  <label>Код склада</label>
                  <input 
                    className="admin-modal-input"
                    name="warehouse_code" 
                    placeholder="Напр. WH01"
                    value={editFormData.warehouse_code || ''} 
                    onChange={this.handleFormChange} 
                  />
                </div>
                
                <div className="admin-modal-field">
                  <label>Название</label>
                  <input 
                    className="admin-modal-input"
                    name="name" 
                    placeholder="Напр. Основной склад"
                    value={editFormData.name || ''} 
                    onChange={this.handleFormChange} 
                  />
                </div>

                <div className="admin-modal-field">
                  <label>Город</label>
                  <input 
                    className="admin-modal-input"
                    name="city" 
                    placeholder="Напр. Москва"
                    value={editFormData.city || ''} 
                    onChange={this.handleFormChange} 
                  />
                </div>

                <div className="admin-modal-field">
                  <label>Адрес</label>
                  <input 
                    className="admin-modal-input"
                    name="address" 
                    placeholder="Напр. ул. Ленина, 10"
                    value={editFormData.address || ''} 
                    onChange={this.handleFormChange} 
                  />
                </div>

                <div className="admin-modal-field">
                  <label>Время начала работы</label>
                  <input 
                    className="admin-modal-input"
                    type="time"
                    name="working_hours_start" 
                    value={editFormData.working_hours_start || ''} 
                    onChange={this.handleFormChange} 
                  />
                </div>

                <div className="admin-modal-field">
                  <label>Время окончания работы</label>
                  <input 
                    className="admin-modal-input"
                    type="time"
                    name="working_hours_end" 
                    value={editFormData.working_hours_end || ''} 
                    onChange={this.handleFormChange} 
                  />
                </div>

                <div className="admin-modal-field">
                  <label className="admin-modal-checkbox">
                    <input 
                      type="checkbox" 
                      name="is_active" 
                      checked={editFormData.is_active || false} 
                      onChange={this.handleFormChange} 
                    />
                    Активен
                  </label>
                </div>
              </div>

              <div className="admin-modal-actions">
                {editingWarehouseId !== 'new' && (
                  <Button variant="danger" onClick={this.handleDelete}>Удалить</Button>
                )}
                <div style={{ marginLeft: 'auto' }}>
                  <Button primary onClick={this.handleSave}>
                    {editingWarehouseId === 'new' ? 'Создать' : 'Обновить'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default AdminWarehouses;
