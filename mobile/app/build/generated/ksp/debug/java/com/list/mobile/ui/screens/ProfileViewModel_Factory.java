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
public final class ProfileViewModel_Factory implements Factory<ProfileViewModel> {
  private final Provider<AppRepository> repoProvider;

  public ProfileViewModel_Factory(Provider<AppRepository> repoProvider) {
    this.repoProvider = repoProvider;
  }

  @Override
  public ProfileViewModel get() {
    return newInstance(repoProvider.get());
  }

  public static ProfileViewModel_Factory create(Provider<AppRepository> repoProvider) {
    return new ProfileViewModel_Factory(repoProvider);
  }

  public static ProfileViewModel newInstance(AppRepository repo) {
    return new ProfileViewModel(repo);
  }
}
