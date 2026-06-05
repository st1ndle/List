package com.list.mobile.ui.screens

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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import com.list.mobile.data.remote.Category
import com.list.mobile.data.remote.Product
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
            TopAppBar(
                title = { Text("Каталог") },
                actions = {
                    IconButton(onClick = { navController.navigate("cart") }) { Text("🛒") }
                    IconButton(onClick = { navController.navigate("history") }) { Text("📜") }
                    IconButton(onClick = { 
                        viewModel.logout()
                        navController.navigate("auth") { popUpTo(0) }
                    }) { Text("🚪") }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding)) {
            ScrollableTabRow(
                selectedTabIndex = viewModel.categories.indexOfFirst { it.id == viewModel.selectedCategory }.coerceAtLeast(0).let { if (viewModel.selectedCategory == null) 0 else it + 1 }
            ) {
                Tab(selected = viewModel.selectedCategory == null, onClick = { viewModel.loadProducts(null) }, text = { Text("Все") })
                viewModel.categories.forEachIndexed { index, cat ->
                    Tab(selected = viewModel.selectedCategory == cat.id, onClick = { viewModel.loadProducts(cat.id) }, text = { Text(cat.name) })
                }
            }
            
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
                    LazyColumn(modifier = Modifier.fillMaxSize()) {
                        items(viewModel.products) { product ->
                            Card(modifier = Modifier.padding(8.dp).fillMaxWidth()) {
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
                                                modifier = Modifier.height(24.dp).padding(bottom = 4.dp)
                                            )
                                        }
                                        Text(product.brand, style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                                        Text(product.name, style = MaterialTheme.typography.titleMedium)
                                        Spacer(Modifier.height(4.dp))
                                        Text(
                                            text = "${product.price} ₽ / ${product.unit_name}",
                                            style = MaterialTheme.typography.bodyLarge,
                                            color = MaterialTheme.colorScheme.primary
                                        )
                                    }
                                    Button(onClick = { viewModel.addToCart(product) }) {
                                        Text("В корзину")
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

