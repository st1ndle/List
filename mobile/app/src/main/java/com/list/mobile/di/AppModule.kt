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
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import javax.inject.Singleton

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
            .addInterceptor(logging)
            .addInterceptor(authInterceptor)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            // Используем 10.0.2.2 для обращения к localhost компьютера из эмулятора Android
            .baseUrl("http://10.0.2.2:8080/api/") 
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
