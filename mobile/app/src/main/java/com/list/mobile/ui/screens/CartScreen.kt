package com.list.mobile.ui.screens

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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import com.list.mobile.data.local.CartEntity
import com.list.mobile.data.repository.AppRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CartViewModel @Inject constructor(private val repo: AppRepository) : ViewModel() {
    val cartItems = repo.cartItems

    fun updateQuantity(id: String, current: Int, change: Int) {
        if (current + change <= 0) {
            viewModelScope.launch { repo.removeFromCart(id) }
        } else {
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

    Scaffold(
        topBar = { TopAppBar(title = { Text("Корзина") }) },
        bottomBar = {
            if (items.isNotEmpty()) {
                BottomAppBar {
                    Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text("Итого: $total ₽", style = MaterialTheme.typography.titleLarge)
                        Button(onClick = { navController.navigate("checkout") }) { Text("Оформить") }
                    }
                }
            }
        }
    ) { padding ->
        LazyColumn(modifier = Modifier.padding(padding)) {
            items(items) { item ->
                Card(modifier = Modifier.padding(8.dp).fillMaxWidth()) {
                    Row(Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
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
                            Text(item.name, style = MaterialTheme.typography.titleMedium)
                            Text("${item.price} ₽", style = MaterialTheme.typography.bodyLarge)
                        }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(onClick = { viewModel.updateQuantity(item.productId, item.quantity, -1) }) { Text("-") }
                            Text(item.quantity.toString())
                            IconButton(onClick = { viewModel.updateQuantity(item.productId, item.quantity, 1) }) { Text("+") }
                            IconButton(onClick = { viewModel.removeItem(item.productId) }) { Text("🗑") }
                        }
                    }
                }
            }
        }
    }
}

