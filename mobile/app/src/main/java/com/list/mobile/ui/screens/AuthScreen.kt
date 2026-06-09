package com.list.mobile.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import com.list.mobile.data.remote.LoginRequest
import com.list.mobile.data.remote.RegisterRequest
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
                val response = if (isRegister) {
                    repo.register(RegisterRequest(firstName = name, email = email, password = password))
                } else {
                    repo.login(LoginRequest(login = email, password = password))
                }
                if (response.isSuccessful && response.body() != null) {
                    repo.saveToken(response.body()!!.userId ?: "")
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
    Column(
        modifier = Modifier
            .padding(24.dp)
            .fillMaxSize(),
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = if (viewModel.isRegister) "Регистрация" else "Вход",
            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold)
        )
        Spacer(Modifier.height(24.dp))
        if (viewModel.isRegister) {
            OutlinedTextField(
                value = viewModel.name,
                onValueChange = { viewModel.name = it },
                label = { Text("Имя") },
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.small
            )
            Spacer(Modifier.height(12.dp))
        }
        OutlinedTextField(
            value = viewModel.email,
            onValueChange = { viewModel.email = it },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.small
        )
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
            value = viewModel.password,
            onValueChange = { viewModel.password = it },
            label = { Text("Пароль") },
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.small
        )
        Spacer(Modifier.height(24.dp))
        Button(
            onClick = { viewModel.authenticate { navController.navigate("catalog") { popUpTo("auth") { inclusive = true } } } },
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.small,
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary
            )
        ) {
            Text(
                text = if (viewModel.isRegister) "Зарегистрироваться" else "Войти",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onPrimary)
            )
        }
        Spacer(Modifier.height(8.dp))
        TextButton(onClick = { viewModel.isRegister = !viewModel.isRegister }) {
            Text(
                text = if (viewModel.isRegister) "Уже есть аккаунт? Войти" else "Нет аккаунта? Регистрация",
                color = MaterialTheme.colorScheme.primary,
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold)
            )
        }
        viewModel.error?.let { 
            Spacer(Modifier.height(8.dp))
            Text(it, color = MaterialTheme.colorScheme.error) 
        }
    }
}
