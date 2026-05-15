package com.list.mobile.data.remote

import retrofit2.http.*
import retrofit2.Response

data class AuthRequest(val email: String, val password: String, val name: String? = null)
data class AuthResponse(val token: String, val user: User)
data class User(val id: String, val email: String, val name: String?)

data class Category(val id: String, val name: String)
data class Product(val id: String, val name: String, val description: String?, val price: Double, val image_url: String?, val category_id: String)
data class Warehouse(val id: String, val address: String, val working_hours: String?)

data class OrderItemRequest(val product_id: String, val quantity: Int)
data class OrderRequest(val warehouse_id: String, val pickup_time: String, val items: List<OrderItemRequest>)
data class OrderResponse(val order_id: String, val status: String)

data class HistoryItem(val product_id: String, val name: String, val quantity: Int, val price: Double)
data class HistoryOrder(val order_id: String, val status: String, val total_price: Double, val date: String, val items: List<HistoryItem>)

interface ApiService {
    @POST("auth/register")
    suspend fun register(@Body request: AuthRequest): Response<AuthResponse>

    @POST("auth/login")
    suspend fun login(@Body request: AuthRequest): Response<AuthResponse>

    @GET("catalog/categories")
    suspend fun getCategories(): Response<List<Category>>

    @GET("catalog/products")
    suspend fun getProducts(@Query("category") categoryId: String? = null): Response<List<Product>>

    @GET("warehouses")
    suspend fun getWarehouses(): Response<List<Warehouse>>

    @POST("orders")
    suspend fun createOrder(@Body request: OrderRequest): Response<OrderResponse>

    @GET("orders/history")
    suspend fun getOrderHistory(): Response<List<HistoryOrder>>
}
