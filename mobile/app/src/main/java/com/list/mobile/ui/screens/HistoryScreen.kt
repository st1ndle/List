package com.list.mobile.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
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
    var isLoading by mutableStateOf(false)
    var error by mutableStateOf<String?>(null)

    init {
        loadHistory()
    }

    fun loadHistory() {
        isLoading = true
        error = null
        viewModelScope.launch {
            try {
                val res = repo.getOrderHistory()
                if (res.isSuccessful) {
                    orders = res.body() ?: emptyList()
                } else {
                    error = "Ошибка загрузки истории: ${res.code()}"
                }
            } catch (e: Exception) {
                error = "Ошибка подключения: ${e.localizedMessage ?: e.message}"
            } finally {
                isLoading = false
            }
        }
    }

    fun repeatOrder(order: HistoryOrder, onSuccess: () -> Unit) {
        viewModelScope.launch {
            repo.clearCart()
            order.items.forEach { item ->
                repo.addToCart(Product(id = item.id, name = item.name, price = item.price, emoji = item.emoji))
                if (item.q > 1) {
                    repo.updateCartQuantity(item.id, item.q - 1)
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
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            if (viewModel.isLoading) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
            } else if (viewModel.error != null) {
                Column(
                    modifier = Modifier.align(Alignment.Center).padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(viewModel.error ?: "", color = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.height(8.dp))
                    Button(onClick = { viewModel.loadHistory() }) {
                        Text("Повторить")
                    }
                }
            } else {
                LazyColumn(modifier = Modifier.fillMaxSize()) {
                    items(viewModel.orders) { order ->
                        Card(modifier = Modifier.padding(8.dp).fillMaxWidth()) {
                            Column(Modifier.padding(16.dp)) {
                                Text("Заказ #${order.public_id}", style = MaterialTheme.typography.titleMedium)
                                Text("Статус: ${order.status}")
                                Text("Сумма: ${order.total_amount} ₽")
                                Text("Дата: ${order.created_at}")
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
    }
}

