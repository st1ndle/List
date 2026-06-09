package com.list.mobile.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
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
    var pickupDate by mutableStateOf("")
    var pickupTime by mutableStateOf("")
    
    var firstName by mutableStateOf("")
    var lastName by mutableStateOf("")
    var phone by mutableStateOf("")
    var comment by mutableStateOf("")
    
    var error by mutableStateOf<String?>(null)
    var isLoading by mutableStateOf(false)
    var isSubmitting by mutableStateOf(false)

    init {
        loadWarehouses()
        
        // Default pickupDate to today
        val sdf = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
        pickupDate = sdf.format(java.util.Date())
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
            if (selectedWarehouse != null && pickupDate.isNotBlank() && pickupTime.isNotBlank() && cart.isNotEmpty()) {
                val formattedComment = listOfNotNull(
                    "Дата: $pickupDate",
                    "Время: $pickupTime",
                    if (comment.isNotBlank()) "Комментарий: $comment" else null
                ).joinToString(" · ")

                val req = OrderRequest(
                    warehouse_code = selectedWarehouse!!.warehouse_code,
                    total_amount = cart.sumOf { it.price * it.quantity },
                    comment = formattedComment,
                    customer_name = "${firstName.trim()} ${lastName.trim()}".trim().ifBlank { null },
                    customer_phone = phone.trim().ifBlank { null },
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
                } else if (pickupDate.isBlank()) {
                    error = "Укажите дату получения"
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
    val context = LocalContext.current
    val calendar = java.util.Calendar.getInstance()
    
    val datePickerDialog = android.app.DatePickerDialog(
        context,
        { _, year, month, dayOfMonth ->
            val formattedMonth = String.format("%02d", month + 1)
            val formattedDay = String.format("%02d", dayOfMonth)
            viewModel.pickupDate = "$year-$formattedMonth-$formattedDay"
        },
        calendar.get(java.util.Calendar.YEAR),
        calendar.get(java.util.Calendar.MONTH),
        calendar.get(java.util.Calendar.DAY_OF_MONTH)
    )

    val timePickerDialog = android.app.TimePickerDialog(
        context,
        { _, hourOfDay, minute ->
            val formattedHour = String.format("%02d", hourOfDay)
            val formattedMinute = String.format("%02d", minute)
            viewModel.pickupTime = "$formattedHour:$formattedMinute"
        },
        calendar.get(java.util.Calendar.HOUR_OF_DAY),
        calendar.get(java.util.Calendar.MINUTE),
        true // 24h format
    )

    Scaffold(
        topBar = {
            Column {
                TopAppBar(
                    title = { Text("Оформление", style = MaterialTheme.typography.titleLarge.copy(color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)) },
                    navigationIcon = {
                        IconButton(onClick = { navController.navigateUp() }) {
                            Text("⬅️")
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background)
                )
                HorizontalDivider(color = MaterialTheme.colorScheme.outline, thickness = 1.dp)
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // Раздел 1: Пункт выдачи
            Text("1. Пункт выдачи самовывоза", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
            Spacer(Modifier.height(8.dp))
            ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = !expanded }) {
                OutlinedTextField(
                    value = viewModel.selectedWarehouse?.address ?: "Выберите пункт",
                    onValueChange = {}, 
                    readOnly = true, 
                    modifier = Modifier.menuAnchor().fillMaxWidth(),
                    shape = MaterialTheme.shapes.small
                )
                ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                    viewModel.warehouses.forEach { wh ->
                        DropdownMenuItem(text = { Text(wh.address) }, onClick = { viewModel.selectedWarehouse = wh; expanded = false })
                    }
                }
            }
            
            Spacer(Modifier.height(20.dp))
            
            // Раздел 2: Дата и время
            Text("2. Дата и время получения", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = viewModel.pickupDate,
                onValueChange = {},
                readOnly = true,
                label = { Text("Дата получения") },
                trailingIcon = {
                    IconButton(onClick = { datePickerDialog.show() }) {
                        Text("📅")
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { datePickerDialog.show() },
                shape = MaterialTheme.shapes.small
            )
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = viewModel.pickupTime,
                onValueChange = {},
                readOnly = true,
                label = { Text("Время получения") },
                trailingIcon = {
                    IconButton(onClick = { timePickerDialog.show() }) {
                        Text("🕐")
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { timePickerDialog.show() },
                shape = MaterialTheme.shapes.small
            )
            
            Spacer(Modifier.height(20.dp))
            
            // Раздел 3: Контактные данные
            Text("3. Контактные данные получателя", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = viewModel.firstName,
                onValueChange = { viewModel.firstName = it },
                label = { Text("Имя") },
                placeholder = { Text("Иван") },
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.small
            )
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = viewModel.lastName,
                onValueChange = { viewModel.lastName = it },
                label = { Text("Фамилия") },
                placeholder = { Text("Иванов") },
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.small
            )
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = viewModel.phone,
                onValueChange = { viewModel.phone = it },
                label = { Text("Телефон") },
                placeholder = { Text("+7 (900) 123-45-67") },
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.small
            )
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = viewModel.comment,
                onValueChange = { viewModel.comment = it },
                label = { Text("Комментарий к заказу") },
                placeholder = { Text("Дополнительная информация...") },
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.small,
                maxLines = 3
            )
            
            Spacer(Modifier.height(20.dp))
            
            viewModel.error?.let {
                Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(vertical = 8.dp))
            }
            
            if (viewModel.isLoading || viewModel.isSubmitting) {
                CircularProgressIndicator(modifier = Modifier.padding(vertical = 8.dp))
            }
            
            Spacer(Modifier.height(8.dp))
            Button(
                onClick = { viewModel.submitOrder { navController.navigate("catalog") { popUpTo(0) } } }, 
                modifier = Modifier.fillMaxWidth(),
                enabled = !viewModel.isLoading && !viewModel.isSubmitting,
                shape = MaterialTheme.shapes.small,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary
                )
            ) {
                Text("Подтвердить заказ", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onPrimary))
            }
            
            if (viewModel.error != null && viewModel.warehouses.isEmpty() && !viewModel.isLoading) {
                Spacer(Modifier.height(8.dp))
                Button(
                    onClick = { viewModel.loadWarehouses() }, 
                    modifier = Modifier.fillMaxWidth(),
                    shape = MaterialTheme.shapes.small
                ) {
                    Text("Повторить загрузку складов")
                }
            }
        }
    }
}

