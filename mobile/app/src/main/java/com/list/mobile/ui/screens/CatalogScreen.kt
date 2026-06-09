package com.list.mobile.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
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
import com.list.mobile.data.remote.Category
import com.list.mobile.data.remote.Product
import com.list.mobile.data.remote.Warehouse
import com.list.mobile.data.repository.AppRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

fun parseHtmlColor(colorStr: String?): Color {
    val defaultColor = Color(red = 0x1A, green = 0x4A, blue = 0x6B, alpha = 0x12)
    if (colorStr.isNullOrBlank()) return defaultColor
    return try {
        if (colorStr.startsWith("#")) {
            Color(android.graphics.Color.parseColor(colorStr))
        } else if (colorStr.startsWith("rgba")) {
            val parts = colorStr.substringAfter("(").substringBefore(")").split(",")
            val r = parts[0].trim().toInt()
            val g = parts[1].trim().toInt()
            val b = parts[2].trim().toInt()
            val alpha = parts[3].trim().toFloat()
            Color(r, g, b, (alpha * 255).toInt())
        } else if (colorStr.startsWith("rgb")) {
            val parts = colorStr.substringAfter("(").substringBefore(")").split(",")
            val r = parts[0].trim().toInt()
            val g = parts[1].trim().toInt()
            val b = parts[2].trim().toInt()
            Color(r, g, b)
        } else {
            defaultColor
        }
    } catch (e: Exception) {
        defaultColor
    }
}

@HiltViewModel
class CatalogViewModel @Inject constructor(private val repo: AppRepository) : ViewModel() {
    var categories by mutableStateOf<List<Category>>(emptyList())
    var products by mutableStateOf<List<Product>>(emptyList())
    var selectedCategory by mutableStateOf<String?>(null)
    var error by mutableStateOf<String?>(null)
    var isLoading by mutableStateOf(false)

    var warehouses by mutableStateOf<List<Warehouse>>(emptyList())
    var showWarehousesDialog by mutableStateOf(false)

    init {
        loadData()
    }

    fun loadData() {
        error = null
        isLoading = true
        viewModelScope.launch {
            try {
                val catRes = repo.getCategories()
                if (catRes.isSuccessful) {
                    categories = catRes.body() ?: emptyList()
                    loadProducts()
                } else {
                    error = "Ошибка загрузки категорий: ${catRes.code()}"
                    isLoading = false
                }
                
                // Fetch warehouses in background
                val whRes = repo.getWarehouses()
                if (whRes.isSuccessful) {
                    warehouses = whRes.body() ?: emptyList()
                }
            } catch (e: Exception) {
                error = "Ошибка подключения: ${e.localizedMessage ?: e.message}"
                isLoading = false
            }
        }
    }

    fun loadProducts(categoryId: String? = selectedCategory) {
        selectedCategory = categoryId
        error = null
        isLoading = true
        viewModelScope.launch {
            try {
                val res = repo.getProducts(categoryId)
                if (res.isSuccessful) {
                    products = res.body() ?: emptyList()
                } else {
                    error = "Ошибка загрузки товаров: ${res.code()}"
                }
            } catch (e: Exception) {
                error = "Ошибка подключения: ${e.localizedMessage ?: e.message}"
            } finally {
                isLoading = false
            }
        }
    }

    fun addToCart(product: Product) {
        viewModelScope.launch { repo.addToCart(product) }
    }
    
    fun logout() {
        viewModelScope.launch { repo.logout() }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CatalogScreen(navController: NavController, viewModel: CatalogViewModel = hiltViewModel()) {
    Scaffold(
        topBar = {
            Column {
                TopAppBar(
                    title = { Text("Каталог", style = MaterialTheme.typography.titleLarge.copy(color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)) },
                    actions = {
                        IconButton(onClick = { viewModel.showWarehousesDialog = true }) { Text("🏢") }
                        IconButton(onClick = { navController.navigate("info") }) { Text("ℹ️") }
                        IconButton(onClick = { navController.navigate("cart") }) { Text("🛒") }
                        IconButton(onClick = { navController.navigate("history") }) { Text("📜") }
                        IconButton(onClick = { navController.navigate("profile") }) { Text("👤") }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background)
                )
                HorizontalDivider(color = MaterialTheme.colorScheme.outline, thickness = 1.dp)
            }
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding)) {
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.background)
                    .padding(vertical = 12.dp, horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                item {
                    CategoryPill(
                        text = "Все",
                        isSelected = viewModel.selectedCategory == null,
                        onClick = { viewModel.loadProducts(null) }
                    )
                }
                items(viewModel.categories) { cat ->
                    CategoryPill(
                        text = cat.name,
                        isSelected = viewModel.selectedCategory == cat.id,
                        onClick = { viewModel.loadProducts(cat.id) }
                    )
                }
            }
            HorizontalDivider(color = MaterialTheme.colorScheme.outline, thickness = 1.dp)
            
            Box(modifier = Modifier.fillMaxSize()) {
                if (viewModel.isLoading) {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                } else if (viewModel.error != null) {
                    Column(
                        modifier = Modifier.align(Alignment.Center).padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(viewModel.error ?: "", color = MaterialTheme.colorScheme.error)
                        Spacer(Modifier.height(8.dp))
                        Button(onClick = { viewModel.loadData() }) {
                            Text("Повторить")
                        }
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(vertical = 8.dp)
                    ) {
                        items(viewModel.products) { product ->
                            Card(
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp).fillMaxWidth(),
                                shape = MaterialTheme.shapes.medium,
                                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                            ) {
                                Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(80.dp)
                                            .background(
                                                color = parseHtmlColor(product.bg_color),
                                                shape = RoundedCornerShape(12.dp)
                                            ),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = product.emoji ?: "📦",
                                            style = TextStyle(fontSize = 40.sp)
                                        )
                                    }
                                    Spacer(Modifier.width(16.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        if (!product.badge.isNullOrBlank()) {
                                            SuggestionChip(
                                                onClick = {},
                                                label = { Text(product.badge, fontSize = 10.sp) },
                                                modifier = Modifier.height(24.dp).padding(bottom = 4.dp),
                                                shape = RoundedCornerShape(20.dp)
                                            )
                                        }
                                        Text(product.brand, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        Text(product.name, style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
                                        Spacer(Modifier.height(4.dp))
                                        Text(
                                            text = "${product.price} ₽ / ${product.unit_name}",
                                            style = MaterialTheme.typography.titleLarge.copy(color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                                        )
                                        Spacer(Modifier.height(2.dp))
                                        val stockText = if (product.stock_quantity == 0) "Нет в наличии" else "В наличии: ${product.stock_quantity} шт."
                                        val stockColor = if (product.stock_quantity == 0) Color(0xFF9B2020) else if (product.stock_quantity < 10) Color(0xFFC8920A) else MaterialTheme.colorScheme.onSurfaceVariant
                                        Text(
                                            text = stockText,
                                            style = MaterialTheme.typography.bodySmall,
                                            color = stockColor
                                        )
                                    }
                                    Button(
                                        onClick = { viewModel.addToCart(product) },
                                        enabled = product.stock_quantity > 0,
                                        shape = MaterialTheme.shapes.small,
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = MaterialTheme.colorScheme.primary,
                                            contentColor = MaterialTheme.colorScheme.onPrimary
                                        )
                                    ) {
                                        Text(if (product.stock_quantity > 0) "В корзину" else "Нет")
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (viewModel.showWarehousesDialog) {
        AlertDialog(
            onDismissRequest = { viewModel.showWarehousesDialog = false },
            title = { Text("Наши склады", style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)) },
            text = {
                LazyColumn(modifier = Modifier.fillMaxWidth().heightIn(max = 400.dp)) {
                    if (viewModel.warehouses.isEmpty()) {
                        item {
                            Text("Склады не найдены или загружаются...", style = MaterialTheme.typography.bodyMedium)
                        }
                    } else {
                        items(viewModel.warehouses) { wh ->
                            Card(
                                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                shape = MaterialTheme.shapes.small,
                                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Text(
                                        text = "${wh.city ?: ""} — ${wh.name}",
                                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                    )
                                    Spacer(Modifier.height(4.dp))
                                    Text(text = "Адрес: ${wh.address}", style = MaterialTheme.typography.bodyMedium)
                                    if (!wh.phone.isNullOrBlank()) {
                                        Text(text = "Тел: ${wh.phone}", style = MaterialTheme.typography.bodyMedium)
                                    }
                                    if (!wh.working_hours_start.isNullOrBlank() && !wh.working_hours_end.isNullOrBlank()) {
                                        Text(
                                            text = "🕐 Часы работы: ${wh.working_hours_start.slice(0..4)} – ${wh.working_hours_end.slice(0..4)}",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { viewModel.showWarehousesDialog = false }) {
                    Text("Закрыть", style = MaterialTheme.typography.titleMedium.copy(color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold))
                }
            },
            shape = MaterialTheme.shapes.medium,
            containerColor = MaterialTheme.colorScheme.background
        )
    }
}

@Composable
fun CategoryPill(text: String, isSelected: Boolean, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(24.dp),
        border = BorderStroke(
            width = 1.5.dp,
            color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline
        ),
        color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface,
        contentColor = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 22.dp, vertical = 8.dp),
            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold)
        )
    }
}

