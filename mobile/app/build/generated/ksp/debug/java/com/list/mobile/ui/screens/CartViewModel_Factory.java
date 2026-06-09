package com.list.mobile.ui.screens;

import com.list.mobile.data.repository.AppRepository;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
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
public final class CartViewModel_Factory implements Factory<CartViewModel> {
  private final Provider<AppRepository> repoProvider;

  public CartViewModel_Factory(Provider<AppRepository> repoProvider) {
    this.repoProvider = repoProvider;
  }

  @Override
  public CartViewModel get() {
    return newInstance(repoProvider.get());
  }

  public static CartViewModel_Factory create(Provider<AppRepository> repoProvider) {
    return new CartViewModel_Factory(repoProvider);
  }

  public static CartViewModel newInstance(AppRepository repo) {
    return new CartViewModel(repo);
  }
}
