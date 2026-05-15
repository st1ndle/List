package com.list.mobile.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.list.mobile.data.remote.Category
import com.list.mobile.data.remote.Product
import com.list.mobile.data.repository.AppRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CatalogViewModel @Inject constructor(private val repo: AppRepository) : ViewModel() {
    var categories by mutableStateOf<List<Category>>(emptyList())
    var products by mutableStateOf<List<Product>>(emptyList())
    var selectedCategory by mutableStateOf<String?>(null)

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            try {
                val catRes = repo.getCategories()
                if (catRes.isSuccessful) categories = catRes.body() ?: emptyList()
                loadProducts()
            } catch (e: Exception) { /* Handle error */ }
        }
    }

    fun loadProducts(categoryId: String? = selectedCategory) {
        selectedCategory = categoryId
        viewModelScope.launch {
            try {
                val res = repo.getProducts(categoryId)
                if (res.isSuccessful) products = res.body() ?: emptyList()
            } catch (e: Exception) { /* Handle error */ }
        }
    }

    fun addToCart(product: Product) {
        viewModelScope.launch { repo.addToCart(product) }
    }
    
    fun logout() {
        viewModelScope.launch { repo.clearToken() }
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
            LazyColumn {
                items(viewModel.products) { product ->
                    Card(modifier = Modifier.padding(8.dp).fillMaxWidth()) {
                        Row(Modifier.padding(8.dp)) {
                            AsyncImage(model = product.image_url, contentDescription = null, modifier = Modifier.size(80.dp))
                            Spacer(Modifier.width(8.dp))
                            Column {
                                Text(product.name, style = MaterialTheme.typography.titleMedium)
                                Text("${product.price} ₽", style = MaterialTheme.typography.bodyLarge)
                                Button(onClick = { viewModel.addToCart(product) }) { Text("В корзину") }
                            }
                        }
                    }
                }
            }
        }
    }
}
