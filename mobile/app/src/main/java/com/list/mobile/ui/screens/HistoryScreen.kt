package com.list.mobile.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import com.list.mobile.data.remote.HistoryOrder
import com.list.mobile.data.remote.Product
import com.list.mobile.data.repository.AppRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HistoryViewModel @Inject constructor(private val repo: AppRepository) : ViewModel() {
    var orders by mutableStateOf<List<HistoryOrder>>(emptyList())

    init {
        viewModelScope.launch {
            try {
                val res = repo.getOrderHistory()
                if (res.isSuccessful) orders = res.body() ?: emptyList()
            } catch (e: Exception) {}
        }
    }

    fun repeatOrder(order: HistoryOrder, onSuccess: () -> Unit) {
        viewModelScope.launch {
            repo.clearCart()
            order.items.forEach { item ->
                // Image URL is null here since history doesn't provide it, but backend would ideally.
                repo.addToCart(Product(item.product_id, item.name, null, item.price, null, ""))
                if (item.quantity > 1) {
                    repo.updateCartQuantity(item.product_id, item.quantity - 1)
                }
            }
            onSuccess()
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(navController: NavController, viewModel: HistoryViewModel = hiltViewModel()) {
    Scaffold(topBar = { TopAppBar(title = { Text("История заказов") }) }) { padding ->
        LazyColumn(modifier = Modifier.padding(padding)) {
            items(viewModel.orders) { order ->
                Card(modifier = Modifier.padding(8.dp).fillMaxWidth()) {
                    Column(Modifier.padding(16.dp)) {
                        Text("Заказ #${order.order_id}", style = MaterialTheme.typography.titleMedium)
                        Text("Статус: ${order.status}")
                        Text("Сумма: ${order.total_price} ₽")
                        Text("Дата: ${order.date}")
                        Spacer(Modifier.height(8.dp))
                        Button(onClick = { viewModel.repeatOrder(order) { navController.navigate("cart") } }) {
                            Text("Повторить заказ")
                        }
                    }
                }
            }
        }
    }
}
