package com.list.mobile.data.repository;

import com.list.mobile.data.local.CartDao;
import com.list.mobile.data.local.TokenManager;
import com.list.mobile.data.remote.ApiService;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata("javax.inject.Singleton")
@QualifierMetadata
@DaggerGenerated
@Generated(
    value = "dagger.internal.codegen.ComponentProcessor",
    comments = "https://dagger.dev"
)
@SuppressWarnings({
    "unchecked",
    "rawtypes",
    "KotlinInternal",
    "KotlinInternalInJava"
})
public final class AppRepository_Factory implements Factory<AppRepository> {
  private final Provider<ApiService> apiProvider;

  private final Provider<CartDao> cartDaoProvider;

  private final Provider<TokenManager> tokenManagerProvider;

  public AppRepository_Factory(Provider<ApiService> apiProvider, Provider<CartDao> cartDaoProvider,
      Provider<TokenManager> tokenManagerProvider) {
    this.apiProvider = apiProvider;
    this.cartDaoProvider = cartDaoProvider;
    this.tokenManagerProvider = tokenManagerProvider;
  }

  @Override
  public AppRepository get() {
    return newInstance(apiProvider.get(), cartDaoProvider.get(), tokenManagerProvider.get());
  }

  public static AppRepository_Factory create(Provider<ApiService> apiProvider,
      Provider<CartDao> cartDaoProvider, Provider<TokenManager> tokenManagerProvider) {
    return new AppRepository_Factory(apiProvider, cartDaoProvider, tokenManagerProvider);
  }

  public static AppRepository newInstance(ApiService api, CartDao cartDao,
      TokenManager tokenManager) {
    return new AppRepository(api, cartDao, tokenManager);
  }
}
