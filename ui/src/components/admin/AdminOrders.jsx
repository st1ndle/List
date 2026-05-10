import React, { Component } from 'react';
import ApiStorage from '../../api/ApiStorage';
import './Admin.css';

/**
 * Классовый компонент для отображения и управления заказами в админке.
 * Хранит локальное состояние заказов и обрабатывает поиск.
 */
class AdminOrders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      searchQuery: '',
      isLoading: false,
      error: null
    };
  }

  componentDidMount() {
    // Подгружаем пустой поиск или дефолтные заказы при старте
    this.loadOrders();
  }

  loadOrders = async (search = '') => {
    this.setState({ isLoading: true, error: null });
    try {
      const response = await ApiStorage.admin.orders.getAll({ search });
      const ordersData = response.data || response || [];
      this.setState({ orders: ordersData, isLoading: false });
    } catch (err) {
      this.setState({ error: err.message, isLoading: false });
    }
  };

  handleSearchChange = (e) => {
    this.setState({ searchQuery: e.target.value });
  };

  handleSearchSubmit = (e) => {
    e.preventDefault();
    this.loadOrders(this.state.searchQuery);
  };

  updateOrderStatus = async (orderId, status) => {
    try {
      await ApiStorage.admin.orders.updateStatus(orderId, status);
      // После обновления статуса перегружаем заказы с учетом текущего поиска
      this.loadOrders(this.state.searchQuery);
    } catch (err) {
      this.setState({ error: err.message });
      alert(`Ошибка обновления: ${err.message}`);
    }
  };

  render() {
    const { orders, searchQuery, isLoading, error } = this.state;

    return (
      <div className="admin-section">
        <h3>Управление заказами</h3>
        
        <form className="admin-search-form" onSubmit={this.handleSearchSubmit}>
          <input 
            type="text" 
            placeholder="Поиск по ID, телефону или Email..." 
            value={searchQuery}
            onChange={this.handleSearchChange}
            className="admin-search-input"
          />
          <button type="submit" className="admin-search-button">Искать</button>
        </form>

        {error && <div className="admin-error">{error}</div>}

        {isLoading ? (
          <div className="admin-loading" style={{ minHeight: '100px' }}>Загрузка заказов...</div>
        ) : (!orders || orders.length === 0) ? (
          <div className="admin-empty">Нет заказов для отображения.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Дата</th>
                <th>Клиент</th>
                <th>Сумма</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const displayId = order.public_id || order.id.slice(0, 8);
                const date = new Date(order.created_at).toLocaleString('ru-RU');
                const client = order.customer_name || 'Не указан';
                const total = Math.trunc(Number(order.total_amount) || 0);

                return (
                  <tr key={order.id}>
                    <td>{displayId}</td>
                    <td>{date}</td>
                    <td>{client}</td>
                    <td>{total} ₽</td>
                    <td>
                      <select 
                        className="admin-select"
                        value={order.status} 
                        onChange={(e) => this.updateOrderStatus(order.id, e.target.value)}
                      >
                        <option value="new">Новый</option>
                        <option value="processing">В обработке</option>
                        <option value="completed">Завершен</option>
                        <option value="cancelled">Отменен</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

export default AdminOrders;
