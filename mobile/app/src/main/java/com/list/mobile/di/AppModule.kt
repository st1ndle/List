package com.list.mobile.di

import android.content.Context
import androidx.room.Room
import com.list.mobile.data.local.AppDatabase
import com.list.mobile.data.local.CartDao
import com.list.mobile.data.local.TokenManager
import com.list.mobile.data.remote.ApiService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import javax.inject.Singleton

class MemoryCookieJar : CookieJar {
    private val cookieStore = HashMap<String, List<Cookie>>()

    override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
        cookieStore[url.host] = cookies
    }

    override fun loadForRequest(url: HttpUrl): List<Cookie> {
        return cookieStore[url.host] ?: ArrayList()
    }
}

class DynamicBaseUrlInterceptor : Interceptor {
    @Volatile
    private var currentHost = "127.0.0.1"

    override fun intercept(chain: Interceptor.Chain): okhttp3.Response {
        val request = chain.request()
        val originalUrl = request.url

        if (originalUrl.host == "127.0.0.1" || originalUrl.host == "10.0.2.2") {
            val newUrl = originalUrl.newBuilder().host(currentHost).build()
            val newRequest = request.newBuilder().url(newUrl).build()
            try {
                return chain.proceed(newRequest)
            } catch (e: java.io.IOException) {
                // Если текущий хост недоступен, переключаемся на альтернативный и пробуем снова
                val fallbackHost = if (currentHost == "127.0.0.1") "10.0.2.2" else "127.0.0.1"
                currentHost = fallbackHost
                
                val fallbackUrl = originalUrl.newBuilder().host(fallbackHost).build()
                val fallbackRequest = request.newBuilder().url(fallbackUrl).build()
                return chain.proceed(fallbackRequest)
            }
        }
        return chain.proceed(request)
    }
}

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideTokenManager(@ApplicationContext context: Context): TokenManager = TokenManager(context)

    @Provides
    @Singleton
    fun provideOkHttpClient(tokenManager: TokenManager): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY }
        val authInterceptor = Interceptor { chain ->
            val token = runBlocking { tokenManager.tokenFlow.firstOrNull() }
            val request = chain.request().newBuilder()
            if (!token.isNullOrEmpty()) {
                request.addHeader("Authorization", "Bearer $token")
            }
            chain.proceed(request.build())
        }
        return OkHttpClient.Builder()
            .addInterceptor(DynamicBaseUrlInterceptor())
            .addInterceptor(logging)
            .addInterceptor(authInterceptor)
            .cookieJar(MemoryCookieJar())
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl("http://127.0.0.1:8080/") 
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService = retrofit.create(ApiService::class.java)

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(context, AppDatabase::class.java, "app_database").build()
    }

    @Provides
    fun provideCartDao(db: AppDatabase): CartDao = db.cartDao()
}

