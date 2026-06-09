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
public final class CatalogViewModel_Factory implements Factory<CatalogViewModel> {
  private final Provider<AppRepository> repoProvider;

  public CatalogViewModel_Factory(Provider<AppRepository> repoProvider) {
    this.repoProvider = repoProvider;
  }

  @Override
  public CatalogViewModel get() {
    return newInstance(repoProvider.get());
  }

  public static CatalogViewModel_Factory create(Provider<AppRepository> repoProvider) {
    return new CatalogViewModel_Factory(repoProvider);
  }

  public static CatalogViewModel newInstance(AppRepository repo) {
    return new CatalogViewModel(repo);
  }
}
