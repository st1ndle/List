package com.list.mobile.ui

import androidx.compose.runtime.*
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.list.mobile.data.repository.AppRepository
import com.list.mobile.ui.screens.*
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(val repository: AppRepository) : ViewModel()

@Composable
fun Navigation() {
    val navController = rememberNavController()
    val viewModel: MainViewModel = hiltViewModel()
    val token by viewModel.repository.tokenFlow.collectAsState(initial = "loading")

    if (token == "loading") return // Wait for datastore

    NavHost(
        navController = navController,
        startDestination = if (token.isNullOrEmpty()) "auth" else "catalog"
    ) {
        composable("auth") { AuthScreen(navController) }
        composable("catalog") { CatalogScreen(navController) }
        composable("cart") { CartScreen(navController) }
        composable("checkout") { CheckoutScreen(navController) }
        composable("history") { HistoryScreen(navController) }
        composable("profile") { ProfileScreen(navController) }
        composable("info") { InfoScreen(navController) }
    }
}
