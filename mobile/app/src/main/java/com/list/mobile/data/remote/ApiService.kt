package com.list.mobile.data.remote

import retrofit2.http.*
import retrofit2.Response

data class LoginRequest(val login: String, val password: String)
data class RegisterRequest(val firstName: String, val email: String, val password: String)
data class AuthResponse(val status: String, val userId: String?)

data class Category(val id: String, val name: String)

data class Product(
    val id: String,
    val name: String,
    val price: Double,
    val category_id: String = "",
    val brand: String = "",
    val unit_name: String = "",
    val description: String? = null,
    val emoji: String? = null,
    val bg_color: String? = null,
    val badge: String? = null,
    val stock_quantity: Int = 0
)

data class Warehouse(
    val id: String,
    val warehouse_code: String,
    val name: String,
    val city: String,
    val address: String,
    val phone: String?,
    val working_hours_start: String?,
    val working_hours_end: String?,
    val is_active: Boolean
)

data class OrderItemRequest(
    val id: String,
    val quantity: Int,
    val price_at_purchase: Double
)

data class OrderRequest(
    val warehouse_code: String?,
    val items: List<OrderItemRequest>,
    val total_amount: Double,
    val comment: String? = null,
    val customer_name: String? = null,
    val customer_phone: String? = null
)

data class OrderResponse(val status: String, val order_id: String)

data class UserProfile(
    val id: String,
    val first_name: String,
    val last_name: String?,
    val phone: String?,
    val email: String?,
    val role: String
)

data class UserProfileResponse(
    val user: UserProfile?
)

data class HistoryItem(
    val id: String,
    val name: String,
    val q: Int,
    val price: Double,
    val emoji: String?
)

data class HistoryOrder(
    val id: String,
    val public_id: String,
    val status: String,
    val total_amount: Double,
    val created_at: String,
    val items: List<HistoryItem>
)

interface ApiService {
    @POST("api/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("api/auth/logout")
    suspend fun logout(): Response<AuthResponse>

    @GET("categories")
    suspend fun getCategories(): Response<List<Category>>

    @GET("products")
    suspend fun getProducts(@Query("category_id") categoryId: String? = null): Response<List<Product>>

    @GET("api/warehouses")
    suspend fun getWarehouses(): Response<List<Warehouse>>

    @POST("api/orders")
    suspend fun createOrder(@Body request: OrderRequest): Response<OrderResponse>

    @GET("api/orders")
    suspend fun getOrderHistory(): Response<List<HistoryOrder>>

    @GET("api/auth/me")
    suspend fun getProfile(): Response<UserProfileResponse>
}

