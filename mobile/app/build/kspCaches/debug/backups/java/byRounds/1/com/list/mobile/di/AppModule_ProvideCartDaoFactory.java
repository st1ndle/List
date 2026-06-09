package com.list.mobile.di;

import com.list.mobile.data.local.AppDatabase;
import com.list.mobile.data.local.CartDao;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata
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
public final class AppModule_ProvideCartDaoFactory implements Factory<CartDao> {
  private final Provider<AppDatabase> dbProvider;

  public AppModule_ProvideCartDaoFactory(Provider<AppDatabase> dbProvider) {
    this.dbProvider = dbProvider;
  }

  @Override
  public CartDao get() {
    return provideCartDao(dbProvider.get());
  }

  public static AppModule_ProvideCartDaoFactory create(Provider<AppDatabase> dbProvider) {
    return new AppModule_ProvideCartDaoFactory(dbProvider);
  }

  public static CartDao provideCartDao(AppDatabase db) {
    return Preconditions.checkNotNullFromProvides(AppModule.INSTANCE.provideCartDao(db));
  }
}
