import React, { Component } from 'react';
import ApiStorage from '../../api/ApiStorage';
import useToastStore from '../../store/useToastStore';
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
      error: null,
      expandedOrderId: null,
      status: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
      cursor: null
    };
  }

  toggleExpandOrder = (orderId) => {
    this.setState(prevState => ({
      expandedOrderId: prevState.expandedOrderId === orderId ? null : orderId
    }));
  };

  componentDidMount() {
    // Подгружаем пустой поиск или дефолтные заказы при старте
    this.loadOrders();
  }

  loadOrders = async (resetCursor = true) => {
    this.setState({ isLoading: true, error: null });
    const { searchQuery, status, dateFrom, dateTo, amountMin, amountMax, cursor } = this.state;
    
    const currentCursor = resetCursor ? null : cursor;
    
    try {
      const response = await ApiStorage.admin.orders.getAll({ 
        search: searchQuery || null,
        status: status || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        amountMin: amountMin ? Number(amountMin) : null,
        amountMax: amountMax ? Number(amountMax) : null,
        cursor: currentCursor
      });
      
      const ordersData = response.data || response || [];
      
      this.setState(prevState => ({ 
        orders: resetCursor ? ordersData : [...prevState.orders, ...ordersData], 
        isLoading: false,
        cursor: response.nextCursor || null
      }));
    } catch (err) {
      this.setState({ error: err.message, isLoading: false });
    }
  };

  handleSearchChange = (e) => {
    this.setState({ searchQuery: e.target.value });
  };

  handleSearchSubmit = (e) => {
    e.preventDefault();
    this.loadOrders(true);
  };

  handleFilterChange = (field, value) => {
    this.setState({ [field]: value }, () => {
      this.loadOrders(true);
    });
  };

  updateOrderStatus = async (orderId, status) => {
    try {
      await ApiStorage.admin.orders.updateStatus(orderId, status);
      // После обновления статуса перегружаем заказы с первой страницы
      this.loadOrders(true);
    } catch (err) {
      this.setState({ error: err.message });
      useToastStore.getState().showToast('❌', `Ошибка обновления: ${err.message}`);
    }
  };

  render() {
    const { orders, searchQuery, isLoading, error, expandedOrderId } = this.state;

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

        <div className="admin-filters">
          <div className="filter-group">
            <label>Статус</label>
            <select 
              value={this.state.status} 
              onChange={(e) => this.handleFilterChange('status', e.target.value)}
              className="admin-select"
            >
              <option value="">Все</option>
              <option value="new">Новый</option>
              <option value="processing">В обработке</option>
              <option value="completed">Завершен</option>
              <option value="cancelled">Отменен</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Дата от</label>
            <input 
              type="date" 
              value={this.state.dateFrom} 
              onChange={(e) => this.handleFilterChange('dateFrom', e.target.value)}
              className="admin-search-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Дата до</label>
            <input 
              type="date" 
              value={this.state.dateTo} 
              onChange={(e) => this.handleFilterChange('dateTo', e.target.value)}
              className="admin-search-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Сумма от</label>
            <input 
              type="number" 
              value={this.state.amountMin} 
              onChange={(e) => this.handleFilterChange('amountMin', e.target.value)}
              className="admin-search-input"
              placeholder="Мин"
            />
          </div>
          
          <div className="filter-group">
            <label>Сумма до</label>
            <input 
              type="number" 
              value={this.state.amountMax} 
              onChange={(e) => this.handleFilterChange('amountMax', e.target.value)}
              className="admin-search-input"
              placeholder="Макс"
            />
          </div>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {isLoading && orders.length === 0 ? (
          <div className="admin-loading" style={{ minHeight: '100px' }}>Загрузка заказов...</div>
        ) : (!orders || orders.length === 0) ? (
          <div className="admin-empty">Нет заказов для отображения.</div>
        ) : (
          <>
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
                    <React.Fragment key={order.id}>
                      <tr onClick={() => this.toggleExpandOrder(order.id)} className="clickable-row">
                        <td>{displayId}</td>
                        <td>{date}</td>
                        <td>{client}</td>
                        <td>{total} ₽</td>
                        <td onClick={e => e.stopPropagation()}>
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
                      {expandedOrderId === order.id && (
                        <tr className="admin-order-details">
                          <td colSpan="5">
                            <div style={{ padding: '16px', backgroundColor: '#f9f9f9', border: '1px solid #eee' }}>
                              <h4 style={{ marginTop: 0, marginBottom: '12px' }}>Детали заказа</h4>
                              {order.delivery_address && <p><strong>Адрес доставки:</strong> {order.delivery_address}</p>}
                              {order.customer_phone && <p><strong>Телефон:</strong> {order.customer_phone}</p>}
                              {order.comment && <p><strong>Комментарий:</strong> {order.comment}</p>}
                              
                              <h5 style={{ marginTop: '16px', marginBottom: '8px' }}>Товары:</h5>
                              {order.items && order.items.length > 0 ? (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                  {order.items.map(item => (
                                    <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                                      <span>{item.emoji} {item.name}</span>
                                      <span>{item.quantity} шт. x {Math.trunc(Number(item.price_at_purchase))} ₽</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p>Нет товаров (или ошибка загрузки)</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>

            {this.state.cursor && (
              <div className="admin-load-more-container" style={{ textAlign: 'center', marginTop: '20px' }}>
                <button 
                  onClick={() => this.loadOrders(false)} 
                  className="admin-search-button"
                >
                  Загрузить еще
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
}

export default AdminOrders;
