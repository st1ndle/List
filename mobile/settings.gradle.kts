pluginManagement {
    repositories {
        maven { url = java.net.URI("https://mirrors.cloud.tencent.com/nexus/repository/google/") }
        maven { url = java.net.URI("https://mirrors.cloud.tencent.com/nexus/repository/maven-public/") }
        maven { url = java.net.URI("https://mirrors.cloud.tencent.com/nexus/repository/gradle-plugins/") }
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        maven { url = java.net.URI("https://mirrors.cloud.tencent.com/nexus/repository/google/") }
        maven { url = java.net.URI("https://mirrors.cloud.tencent.com/nexus/repository/maven-public/") }
        google()
        mavenCentral()
    }
}
rootProject.name = "ListMobile"
include(":app")
