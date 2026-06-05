package com.list.mobile.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import com.list.mobile.data.remote.OrderItemRequest
import com.list.mobile.data.remote.OrderRequest
import com.list.mobile.data.remote.Warehouse
import com.list.mobile.data.repository.AppRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CheckoutViewModel @Inject constructor(private val repo: AppRepository) : ViewModel() {
    var warehouses by mutableStateOf<List<Warehouse>>(emptyList())
    var selectedWarehouse by mutableStateOf<Warehouse?>(null)
    var pickupTime by mutableStateOf("")
    var error by mutableStateOf<String?>(null)
    var isLoading by mutableStateOf(false)
    var isSubmitting by mutableStateOf(false)

    init {
        loadWarehouses()
    }

    fun loadWarehouses() {
        error = null
        isLoading = true
        viewModelScope.launch {
            try {
                val res = repo.getWarehouses()
                if (res.isSuccessful) {
                    warehouses = res.body() ?: emptyList()
                    selectedWarehouse = warehouses.firstOrNull()
                } else {
                    error = "Ошибка загрузки пунктов выдачи: ${res.code()}"
                }
            } catch (e: Exception) {
                error = "Ошибка подключения: ${e.localizedMessage ?: e.message}"
            } finally {
                isLoading = false
            }
        }
    }

    fun submitOrder(onSuccess: () -> Unit) {
        error = null
        isSubmitting = true
        viewModelScope.launch {
            val cart = repo.cartItems.first()
            if (selectedWarehouse != null && pickupTime.isNotBlank() && cart.isNotEmpty()) {
                val req = OrderRequest(
                    warehouse_code = selectedWarehouse!!.warehouse_code,
                    total_amount = cart.sumOf { it.price * it.quantity },
                    comment = "Самовывоз. Время получения: $pickupTime",
                    items = cart.map { OrderItemRequest(id = it.productId, quantity = it.quantity, price_at_purchase = it.price) }
                )
                try {
                    val res = repo.createOrder(req)
                    if (res.isSuccessful) {
                        repo.clearCart()
                        onSuccess()
                    } else {
                        error = "Ошибка оформления заказа: ${res.code()}"
                    }
                } catch (e: Exception) {
                    error = "Ошибка отправки заказа: ${e.localizedMessage ?: e.message}"
                } finally {
                    isSubmitting = false
                }
            } else {
                isSubmitting = false
                if (cart.isEmpty()) {
                    error = "Корзина пуста"
                } else if (selectedWarehouse == null) {
                    error = "Выберите пункт выдачи"
                } else if (pickupTime.isBlank()) {
                    error = "Укажите время получения"
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(navController: NavController, viewModel: CheckoutViewModel = hiltViewModel()) {
    var expanded by remember { mutableStateOf(false) }

    Scaffold(topBar = { TopAppBar(title = { Text("Оформление") }) }) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            Text("Пункт выдачи:", style = MaterialTheme.typography.titleMedium)
            ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = !expanded }) {
                OutlinedTextField(
                    value = viewModel.selectedWarehouse?.address ?: "Выберите пункт",
                    onValueChange = {}, readOnly = true, modifier = Modifier.menuAnchor().fillMaxWidth()
                )
                ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                    viewModel.warehouses.forEach { wh ->
                        DropdownMenuItem(text = { Text(wh.address) }, onClick = { viewModel.selectedWarehouse = wh; expanded = false })
                    }
                }
            }
            Spacer(Modifier.height(16.dp))
            OutlinedTextField(
                value = viewModel.pickupTime,
                onValueChange = { viewModel.pickupTime = it },
                label = { Text("Время получения (например: 14:00)") },
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(Modifier.height(16.dp))
            
            viewModel.error?.let {
                Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(vertical = 8.dp))
            }
            
            if (viewModel.isLoading || viewModel.isSubmitting) {
                CircularProgressIndicator(modifier = Modifier.padding(vertical = 8.dp))
            }
            
            Spacer(Modifier.height(16.dp))
            Button(
                onClick = { viewModel.submitOrder { navController.navigate("catalog") { popUpTo(0) } } }, 
                modifier = Modifier.fillMaxWidth(),
                enabled = !viewModel.isLoading && !viewModel.isSubmitting
            ) {
                Text("Подтвердить заказ")
            }
            
            if (viewModel.error != null && viewModel.warehouses.isEmpty() && !viewModel.isLoading) {
                Spacer(Modifier.height(8.dp))
                Button(onClick = { viewModel.loadWarehouses() }, modifier = Modifier.fillMaxWidth()) {
                    Text("Повторить загрузку складов")
                }
            }
        }
    }
}

