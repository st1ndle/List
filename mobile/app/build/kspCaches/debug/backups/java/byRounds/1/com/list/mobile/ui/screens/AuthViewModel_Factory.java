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
public final class AuthViewModel_Factory implements Factory<AuthViewModel> {
  private final Provider<AppRepository> repoProvider;

  public AuthViewModel_Factory(Provider<AppRepository> repoProvider) {
    this.repoProvider = repoProvider;
  }

  @Override
  public AuthViewModel get() {
    return newInstance(repoProvider.get());
  }

  public static AuthViewModel_Factory create(Provider<AppRepository> repoProvider) {
    return new AuthViewModel_Factory(repoProvider);
  }

  public static AuthViewModel newInstance(AppRepository repo) {
    return new AuthViewModel(repo);
  }
}
