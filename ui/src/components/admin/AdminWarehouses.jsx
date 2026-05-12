import React, { Component } from 'react';
import ApiStorage from '../../api/ApiStorage';
import useToastStore from '../../store/useToastStore';
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
      await ApiStorage.admin.warehouses.update(editingWarehouseId, editFormData);
      this.setState({ editingWarehouseId: null, editFormData: {} });
      window.location.reload();
    } catch (err) {
      useToastStore.getState().showToast('❌', `Ошибка обновления: ${err.message}`);
    }
  };

  handleDelete = async () => {
    const { editingWarehouseId } = this.state;
    if (!window.confirm('Вы уверены, что хотите удалить этот склад?')) return;
    try {
      await ApiStorage.admin.warehouses.remove(editingWarehouseId);
      this.setState({ editingWarehouseId: null, editFormData: {} });
      window.location.reload();
    } catch (err) {
      useToastStore.getState().showToast('❌', `Ошибка удаления: ${err.message}`);
    }
  };

  render() {
    const { warehouses } = this.props;
    const { editingWarehouseId, editFormData } = this.state;

    if (!warehouses || warehouses.length === 0) {
      return (
        <div className="admin-section">
          <h3>Управление складами</h3>
          <div className="admin-empty">Нет складов для отображения.</div>
        </div>
      );
    }

    return (
      <div className="admin-section">
        <h3>Управление складами</h3>
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

        {editingWarehouseId && (
          <div className="admin-modal-overlay" onClick={this.handleCancelEdit}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
              <button className="admin-modal-close" onClick={this.handleCancelEdit}>&times;</button>
              <h4 className="admin-modal-title">Редактирование склада</h4>
              
              <div className="admin-modal-form">
                <div className="admin-modal-field">
                  <label>Код склада</label>
                  <input 
                    className="admin-modal-input"
                    name="warehouse_code" 
                    value={editFormData.warehouse_code || ''} 
                    onChange={this.handleFormChange} 
                  />
                </div>
                
                <div className="admin-modal-field">
                  <label>Название</label>
                  <input 
                    className="admin-modal-input"
                    name="name" 
                    value={editFormData.name || ''} 
                    onChange={this.handleFormChange} 
                  />
                </div>

                <div className="admin-modal-field">
                  <label>Город</label>
                  <input 
                    className="admin-modal-input"
                    name="city" 
                    value={editFormData.city || ''} 
                    onChange={this.handleFormChange} 
                  />
                </div>

                <div className="admin-modal-field">
                  <label>Адрес</label>
                  <input 
                    className="admin-modal-input"
                    name="address" 
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
                <button className="admin-btn-delete" onClick={this.handleDelete}>Удалить</button>
                <button className="admin-btn-save" onClick={this.handleSave}>Обновить</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default AdminWarehouses;
