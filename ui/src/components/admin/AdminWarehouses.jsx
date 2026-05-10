import React, { Component } from 'react';
import './Admin.css';

/**
 * Классовый компонент для отображения списка складов в админке.
 */
class AdminWarehouses extends Component {
  render() {
    const { warehouses } = this.props;

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
              <tr key={w.id}>
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
      </div>
    );
  }
}

export default AdminWarehouses;
