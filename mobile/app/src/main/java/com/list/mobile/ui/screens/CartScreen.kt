package com.list.mobile.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import com.list.mobile.data.local.CartEntity
import com.list.mobile.data.remote.Product
import com.list.mobile.data.repository.AppRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CartViewModel @Inject constructor(private val repo: AppRepository) : ViewModel() {
    val cartItems = repo.cartItems
    var products by mutableStateOf<List<Product>>(emptyList())
        private set

    init {
        loadProducts()
    }

    fun loadProducts() {
        viewModelScope.launch {
            try {
                val res = repo.getProducts()
                if (res.isSuccessful) {
                    products = res.body() ?: emptyList()
                }
            } catch (e: Exception) {
                // Fallback
            }
        }
    }

    fun updateQuantity(id: String, current: Int, change: Int) {
        if (current + change <= 0) {
            viewModelScope.launch { repo.removeFromCart(id) }
        } else {
            val product = products.find { it.id == id }
            if (product != null && change > 0 && current + change > product.stock_quantity) {
                return
            }
            viewModelScope.launch { repo.updateCartQuantity(id, change) }
        }
    }
    
    fun removeItem(id: String) {
        viewModelScope.launch { repo.removeFromCart(id) }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(navController: NavController, viewModel: CartViewModel = hiltViewModel()) {
    val items by viewModel.cartItems.collectAsState(initial = emptyList())
    val total = items.sumOf { it.price * it.quantity }
    val hasValidationErrors = items.any { item ->
        val product = viewModel.products.find { it.id == item.productId }
        product != null && (item.quantity > product.stock_quantity || product.stock_quantity == 0)
    }

    Scaffold(
        topBar = {
            Column {
                TopAppBar(
                    title = { Text("Корзина", style = MaterialTheme.typography.titleLarge.copy(color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)) },
                    navigationIcon = {
                        IconButton(onClick = { navController.navigateUp() }) {
                            Text("⬅️")
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background)
                )
                HorizontalDivider(color = MaterialTheme.colorScheme.outline, thickness = 1.dp)
            }
        },
        bottomBar = {
            if (items.isNotEmpty()) {
                Column {
                    HorizontalDivider(color = MaterialTheme.colorScheme.outline, thickness = 1.dp)
                    Surface(
                        color = MaterialTheme.colorScheme.surface,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Итого: $total ₽", style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold))
                            Button(
                                onClick = { navController.navigate("checkout") },
                                enabled = !hasValidationErrors,
                                shape = MaterialTheme.shapes.small,
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.primary,
                                    contentColor = MaterialTheme.colorScheme.onPrimary
                                )
                            ) {
                                Text(
                                    text = if (hasValidationErrors) "Ошибка остатков" else "Оформить",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onPrimary)
                                )
                            }
                        }
                    }
                }
            }
        }
    ) { padding ->
        LazyColumn(modifier = Modifier.padding(padding)) {
            items(items) { item ->
                val product = viewModel.products.find { it.id == item.productId }
                val stockText = if (product != null) {
                    if (product.stock_quantity == 0) "Нет в наличии" else "Доступно: ${product.stock_quantity} шт."
                } else {
                    ""
                }
                val isOverStock = product != null && item.quantity > product.stock_quantity
                val isMaxLimit = product != null && item.quantity >= product.stock_quantity

                Card(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp).fillMaxWidth(),
                    shape = MaterialTheme.shapes.medium,
                    border = BorderStroke(
                        width = 1.5.dp,
                        color = if (isOverStock) Color(0xFF9B2020) else MaterialTheme.colorScheme.outline
                    ),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isOverStock) Color(0xFFFFEBEE) else MaterialTheme.colorScheme.surface
                    )
                ) {
                    Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(60.dp)
                                .background(
                                    color = parseHtmlColor(item.bg_color),
                                    shape = RoundedCornerShape(8.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(item.emoji ?: "📦", style = TextStyle(fontSize = 32.sp))
                        }
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(item.name, style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
                            Text(
                                text = "${item.price} ₽",
                                style = MaterialTheme.typography.titleMedium.copy(color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                            )
                            if (stockText.isNotEmpty()) {
                                Text(
                                    text = stockText,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = if (product?.stock_quantity == 0 || isOverStock) Color(0xFF9B2020) else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(top = 2.dp)
                                )
                            }
                        }
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .background(
                                    color = MaterialTheme.colorScheme.surfaceVariant,
                                    shape = RoundedCornerShape(8.dp)
                                )
                        ) {
                            IconButton(
                                onClick = { viewModel.updateQuantity(item.productId, item.quantity, -1) },
                                modifier = Modifier.size(36.dp)
                            ) { 
                                Text("-", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)) 
                            }
                            Text(
                                text = item.quantity.toString(),
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                modifier = Modifier.padding(horizontal = 8.dp)
                            )
                            IconButton(
                                onClick = { viewModel.updateQuantity(item.productId, item.quantity, 1) },
                                enabled = !isMaxLimit,
                                modifier = Modifier.size(36.dp)
                            ) {
                                Text(
                                    text = "+",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                    color = if (isMaxLimit) Color.LightGray else MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                        Spacer(Modifier.width(8.dp))
                        IconButton(
                            onClick = { viewModel.removeItem(item.productId) },
                            modifier = Modifier.size(36.dp)
                        ) { 
                            Text("🗑") 
                        }
                    }
                }
            }
        }
    }
}

