package com.list.mobile.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import com.list.mobile.data.remote.AuthRequest
import com.list.mobile.data.repository.AppRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(private val repo: AppRepository) : ViewModel() {
    var email by mutableStateOf("")
    var password by mutableStateOf("")
    var name by mutableStateOf("")
    var isRegister by mutableStateOf(false)
    var error by mutableStateOf<String?>(null)

    fun authenticate(onSuccess: () -> Unit) {
        viewModelScope.launch {
            try {
                val req = AuthRequest(email, password, if (isRegister) name else null)
                val response = if (isRegister) repo.register(req) else repo.login(req)
                if (response.isSuccessful && response.body() != null) {
                    repo.saveToken(response.body()!!.token)
                    onSuccess()
                } else {
                    error = "Ошибка: ${response.code()}"
                }
            } catch (e: Exception) {
                error = e.message
            }
        }
    }
}

@Composable
fun AuthScreen(navController: NavController, viewModel: AuthViewModel = hiltViewModel()) {
    Column(modifier = Modifier.padding(16.dp).fillMaxSize(), verticalArrangement = Arrangement.Center) {
        Text(if (viewModel.isRegister) "Регистрация" else "Вход", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(16.dp))
        if (viewModel.isRegister) {
            OutlinedTextField(value = viewModel.name, onValueChange = { viewModel.name = it }, label = { Text("Имя") }, modifier = Modifier.fillMaxWidth())
        }
        OutlinedTextField(value = viewModel.email, onValueChange = { viewModel.email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = viewModel.password, onValueChange = { viewModel.password = it }, label = { Text("Пароль") }, modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(16.dp))
        Button(onClick = { viewModel.authenticate { navController.navigate("catalog") { popUpTo("auth") { inclusive = true } } } }, modifier = Modifier.fillMaxWidth()) {
            Text(if (viewModel.isRegister) "Зарегистрироваться" else "Войти")
        }
        TextButton(onClick = { viewModel.isRegister = !viewModel.isRegister }) {
            Text(if (viewModel.isRegister) "Уже есть аккаунт? Войти" else "Нет аккаунта? Регистрация")
        }
        viewModel.error?.let { Text(it, color = MaterialTheme.colorScheme.error) }
    }
}
