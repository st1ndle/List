package com.list.mobile.data.repository

import com.list.mobile.data.local.*
import com.list.mobile.data.remote.*
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AppRepository @Inject constructor(
    private val api: ApiService,
    private val cartDao: CartDao,
    private val tokenManager: TokenManager
) {
    val tokenFlow = tokenManager.tokenFlow
    val cartItems: Flow<List<CartEntity>> = cartDao.getCartItems()

    suspend fun saveToken(token: String) = tokenManager.saveToken(token)
    suspend fun clearToken() = tokenManager.clearToken()

    suspend fun login(req: LoginRequest) = api.login(req)
    suspend fun register(req: RegisterRequest) = api.register(req)

    suspend fun getCategories() = api.getCategories()
    suspend fun getProducts(categoryId: String? = null) = api.getProducts(categoryId)
    suspend fun getWarehouses() = api.getWarehouses()
    suspend fun createOrder(req: OrderRequest) = api.createOrder(req)
    suspend fun getOrderHistory() = api.getOrderHistory()
    suspend fun getProfile() = api.getProfile()

    suspend fun addToCart(product: Product) {
        cartDao.insertItem(CartEntity(product.id, product.name, product.price, 1, product.emoji, product.bg_color))
    }
    suspend fun updateCartQuantity(productId: String, change: Int) {
        cartDao.updateQuantity(productId, change)
    }
    suspend fun removeFromCart(productId: String) {
        cartDao.removeItem(productId)
    }
    suspend fun clearCart() {
        cartDao.clearCart()
    }
    suspend fun logout() {
        try {
            api.logout()
        } catch (e: Exception) {
            // Игнорируем сетевые ошибки при логауте
        }
        tokenManager.clearToken()
    }
}
