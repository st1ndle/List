package com.list.mobile.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import androidx.room.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class TokenManager(private val context: Context) {
    companion object {
        val TOKEN_KEY = stringPreferencesKey("jwt_token")
    }

    val tokenFlow: Flow<String?> = context.dataStore.data.map { it[TOKEN_KEY] }

    suspend fun saveToken(token: String) {
        context.dataStore.edit { it[TOKEN_KEY] = token }
    }

    suspend fun clearToken() {
        context.dataStore.edit { it.remove(TOKEN_KEY) }
    }
}

@Entity(tableName = "cart")
data class CartEntity(
    @PrimaryKey val productId: String,
    val name: String,
    val price: Double,
    val quantity: Int,
    val emoji: String?,
    val bg_color: String?
)

@Dao
interface CartDao {
    @Query("SELECT * FROM cart")
    fun getCartItems(): Flow<List<CartEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertItem(item: CartEntity)

    @Query("UPDATE cart SET quantity = quantity + :amount WHERE productId = :productId")
    suspend fun updateQuantity(productId: String, amount: Int)

    @Query("DELETE FROM cart WHERE productId = :productId")
    suspend fun removeItem(productId: String)

    @Query("DELETE FROM cart")
    suspend fun clearCart()
}

@Database(entities = [CartEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun cartDao(): CartDao
}
