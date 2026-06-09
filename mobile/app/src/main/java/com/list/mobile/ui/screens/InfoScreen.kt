package com.list.mobile.ui.screens

import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import com.list.mobile.data.remote.Warehouse
import com.list.mobile.data.repository.AppRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class InfoViewModel @Inject constructor(private val repo: AppRepository) : ViewModel() {
    var warehouses by mutableStateOf<List<Warehouse>>(emptyList())
    var isLoadingWarehouses by mutableStateOf(false)
    var warehousesError by mutableStateOf<String?>(null)

    init {
        loadWarehouses()
    }

    fun loadWarehouses() {
        isLoadingWarehouses = true
        warehousesError = null
        viewModelScope.launch {
            try {
                val res = repo.getWarehouses()
                if (res.isSuccessful) {
                    warehouses = res.body() ?: emptyList()
                } else {
                    warehousesError = "Ошибка загрузки складов: ${res.code()}"
                }
            } catch (e: Exception) {
                warehousesError = "Ошибка подключения: ${e.localizedMessage ?: e.message}"
            } finally {
                isLoadingWarehouses = false
            }
        }
    }
}

enum class InfoTab(val title: String) {
    ABOUT("О компании"),
    SERVICES("Услуги"),
    TARIFFS("Тарифы"),
    CONTACTS("Контакты")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InfoScreen(navController: NavController, viewModel: InfoViewModel = hiltViewModel()) {
    var selectedTab by remember { mutableStateOf(InfoTab.ABOUT) }

    Scaffold(
        topBar = {
            Column {
                TopAppBar(
                    title = { Text("Информация", style = MaterialTheme.typography.titleLarge.copy(color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)) },
                    navigationIcon = {
                        IconButton(onClick = { navController.navigateUp() }) {
                            Text("⬅️")
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background)
                )
                HorizontalDivider(color = MaterialTheme.colorScheme.outline, thickness = 1.dp)
                
                TabRow(
                    selectedTabIndex = selectedTab.ordinal,
                    containerColor = MaterialTheme.colorScheme.background,
                    contentColor = MaterialTheme.colorScheme.primary
                ) {
                    InfoTab.values().forEach { tab ->
                        Tab(
                            selected = selectedTab == tab,
                            onClick = { selectedTab = tab },
                            text = { Text(tab.title, fontWeight = FontWeight.Bold, fontSize = 13.sp) }
                        )
                    }
                }
                HorizontalDivider(color = MaterialTheme.colorScheme.outline, thickness = 1.dp)
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
        ) {
            when (selectedTab) {
                InfoTab.ABOUT -> AboutTabContent()
                InfoTab.SERVICES -> ServicesTabContent()
                InfoTab.TARIFFS -> TariffsTabContent()
                InfoTab.CONTACTS -> ContactsTabContent(viewModel)
            }
        }
    }
}

@Composable
fun AboutTabContent() {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "ООО ЛиСТ — Складское предприятие",
                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
            )
            Spacer(Modifier.height(8.dp))
            Text(
                text = "Компания успешно функционирует на рынке складской логистики и дистрибуции напитков с 1998 года. Реализовав два десятилетия назад масштабный проект создания полнофункциональной транспортной компании, сегодня ООО ЛиСТ прочно занимает тематическую нишу и расширяет сеть.",
                style = MaterialTheme.typography.bodyLarge
            )
            Spacer(Modifier.height(8.dp))
            Text(
                text = "В начале пути компания специализировалась на дистрибуции и была ориентирована на крупных оптовых клиентов. Первым якорным клиентом стала международная группа компаний Anadolu Efes. В 2012 году открыт собственный логистический комплекс в Москве.",
                style = MaterialTheme.typography.bodyLarge
            )
        }
        
        item {
            Text(
                text = "📊 Ключевые показатели",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
            )
            Spacer(Modifier.height(8.dp))
            
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    StatCard("1998", "год основания", modifier = Modifier.weight(1f))
                    StatCard("150", "сотрудников", modifier = Modifier.weight(1f))
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    StatCard("2000+", "адресов доставки в день", modifier = Modifier.weight(1f))
                    StatCard("500т", "грузов в сутки", modifier = Modifier.weight(1f))
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    StatCard("17 000", "паллетомест", modifier = Modifier.weight(1f))
                    StatCard("Класс А", "класс склада", modifier = Modifier.weight(1f))
                }
            }
        }
        
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.medium,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "🏢 Масштабные проекты",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary),
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                    Text(
                        text = "Создан и успешно запущен распределительный транспортно-логистический центр федерального уровня для компании «Балтика» с оборотом не менее 600 паллет в сутки.",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }
    }
}

@Composable
fun StatCard(value: String, label: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = MaterialTheme.shapes.medium,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
            )
            Spacer(Modifier.height(4.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun ServicesTabContent() {
    var palletRate by remember { mutableStateOf(32) } // default: 32 (Euro)
    var palletCountStr by remember { mutableStateOf("10") }
    var daysCountStr by remember { mutableStateOf("30") }
    
    val palletCount = palletCountStr.toIntOrNull() ?: 0
    val daysCount = daysCountStr.toIntOrNull() ?: 0
    val totalCost = palletRate * palletCount * daysCount

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Расчёт стоимости хранения",
                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
            )
            Spacer(Modifier.height(4.dp))
            Text(
                text = "Быстрый калькулятор для оценки стоимости ответственного хранения на нашем складе.",
                style = MaterialTheme.typography.bodyMedium
            )
        }
        
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.medium,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        text = "🧮 Параметры расчёта",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    )
                    
                    Column {
                        Text("Тип паллета", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(4.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            FilterChip(
                                selected = palletRate == 32,
                                onClick = { palletRate = 32 },
                                label = { Text("Европаллет (32 ₽/сутки)", fontSize = 12.sp) }
                            )
                            FilterChip(
                                selected = palletRate == 36,
                                onClick = { palletRate = 36 },
                                label = { Text("Финский/Амер. (36 ₽/сутки)", fontSize = 12.sp) }
                            )
                        }
                    }
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        OutlinedTextField(
                            value = palletCountStr,
                            onValueChange = { palletCountStr = it.filter { char -> char.isDigit() } },
                            label = { Text("Количество паллет") },
                            modifier = Modifier.weight(1f),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            shape = MaterialTheme.shapes.small
                        )
                        OutlinedTextField(
                            value = daysCountStr,
                            onValueChange = { daysCountStr = it.filter { char -> char.isDigit() } },
                            label = { Text("Количество дней") },
                            modifier = Modifier.weight(1f),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            shape = MaterialTheme.shapes.small
                        )
                    }
                    
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = MaterialTheme.shapes.small,
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "ОРИЕНТИРОВОЧНАЯ СТОИМОСТЬ",
                                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onPrimaryContainer)
                                )
                                Text(
                                    text = "без НДС",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Text(
                                text = "${totalCost.toLocaleString()} ₽",
                                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                              )
                        }
                    }
                }
            }
        }
    }
}

private fun Int.toLocaleString(): String {
    return String.format("%,d", this).replace(',', ' ')
}

@Composable
fun TariffsTabContent() {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Тарифы на грузоперевозки",
                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
            )
            Spacer(Modifier.height(4.dp))
            Text(
                text = "Доставка «от двери до двери» по Москве и Московской области. Собственный автопарк из 120 единиц транспорта.",
                style = MaterialTheme.typography.bodyMedium
            )
        }
        
        item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                TariffCard(
                    type = "🚛 Малотоннажный транспорт",
                    load = "до 5 тонн",
                    priceKm = "24 ₽ / км",
                    priceHour = "2 300 ₽ / час",
                    features = listOf(
                        "Грузоподъёмность до 5 тонн",
                        "Объём кузова до 21.4 м³",
                        "Вместимость до 10 европаллет",
                        "Минимум 8 часов работы",
                        "Идеально для малого бизнеса"
                    ),
                    isFeatured = true
                )
                
                TariffCard(
                    type = "🚛 Крупнотоннажный транспорт",
                    load = "до 20 тонн",
                    priceKm = "45 ₽ / км",
                    priceHour = "4 000 ₽ / час",
                    features = listOf(
                        "Грузоподъёмность до 20 тонн",
                        "Объём кузова до 82 м³",
                        "Вместимость до 32 европаллет",
                        "Минимум 8 часов работы",
                        "Для крупных партий"
                    ),
                    isFeatured = false
                )
            }
        }
        
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.medium,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
            ) {
                Row(modifier = Modifier.padding(16.dp), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    Text("💡", fontSize = 28.sp)
                    Column {
                        Text(
                            text = "Сборные грузы",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            text = "Также доступна доставка сборными грузами со склада ответственного хранения. Позволяет уменьшить тариф и снимает ограничения на минимальный объём заказа. Уточняйте условия у менеджера.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun TariffCard(
    type: String,
    load: String,
    priceKm: String,
    priceHour: String,
    features: List<String>,
    isFeatured: Boolean
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium,
        border = BorderStroke(
            width = if (isFeatured) 2.dp else 1.dp,
            color = if (isFeatured) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline
        ),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = type,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                )
                SuggestionChip(
                    onClick = {},
                    label = { Text(load, fontSize = 11.sp) },
                    shape = MaterialTheme.shapes.small
                )
            }
            Spacer(Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = priceKm,
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                )
                Text(
                    text = "или",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = priceHour,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                )
            }
            Spacer(Modifier.height(12.dp))
            HorizontalDivider(color = MaterialTheme.colorScheme.outline, thickness = 0.5.dp)
            Spacer(Modifier.height(12.dp))
            
            features.forEach { feature ->
                Row(
                    modifier = Modifier.padding(vertical = 2.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text("•", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                    Text(text = feature, style = MaterialTheme.typography.bodySmall)
                }
            }
        }
    }
}

@Composable
fun ContactsTabContent(viewModel: InfoViewModel) {
    val context = LocalContext.current
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var comment by remember { mutableStateOf("") }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Контакты компании",
                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
            )
            Spacer(Modifier.height(8.dp))
            
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.medium,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        text = "📞 Связь по телефону",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    )
                    Column {
                        Text("Телефон (Москва):", style = MaterialTheme.typography.bodySmall)
                        Text("+7 (495) 229-40-05", style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold))
                    }
                    Column {
                        Text("Телефон (Тула):", style = MaterialTheme.typography.bodySmall)
                        Text("+7 (4872) 25-14-07", style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold))
                    }
                }
            }
        }
        
        item {
            Text(
                text = "📍 Список складов",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
            )
        }
        
        if (viewModel.isLoadingWarehouses) {
            item {
                Box(modifier = Modifier.fillMaxWidth().padding(24.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
        } else if (viewModel.warehousesError != null) {
            item {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(viewModel.warehousesError ?: "", color = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.height(8.dp))
                    Button(onClick = { viewModel.loadWarehouses() }) {
                        Text("Повторить")
                    }
                }
            }
        } else if (viewModel.warehouses.isEmpty()) {
            item {
                Text("Склады не найдены", style = MaterialTheme.typography.bodyMedium, modifier = Modifier.padding(horizontal = 16.dp))
            }
        } else {
            items(viewModel.warehouses) { wh ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = MaterialTheme.shapes.medium,
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "${wh.city} — ${wh.name}",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(text = "Адрес: ${wh.address}", style = MaterialTheme.typography.bodyMedium)
                        if (!wh.phone.isNullOrBlank()) {
                            Text(text = "Тел: ${wh.phone}", style = MaterialTheme.typography.bodyMedium)
                        }
                        if (!wh.working_hours_start.isNullOrBlank() && !wh.working_hours_end.isNullOrBlank()) {
                            Text(
                                text = "🕐 Часы работы: ${wh.working_hours_start.slice(0..4)} – ${wh.working_hours_end.slice(0..4)}",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }
        
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.medium,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        text = "✉️ Форма обратной связи",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    )
                    
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Ваше имя") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = MaterialTheme.shapes.small
                    )
                    
                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Телефон") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        shape = MaterialTheme.shapes.small
                    )
                    
                    OutlinedTextField(
                        value = comment,
                        onValueChange = { comment = it },
                        label = { Text("Комментарий") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3,
                        maxLines = 5,
                        shape = MaterialTheme.shapes.small
                    )
                    
                    Text(
                        text = "Нажимая кнопку «Отправить», вы соглашаетесь на обработку персональных данных.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    Button(
                        onClick = {
                            if (name.isBlank() || phone.isBlank()) {
                                Toast.makeText(context, "⚠️ Заполните имя и телефон", Toast.LENGTH_SHORT).show()
                            } else {
                                Toast.makeText(context, "✓ Заявка отправлена! Мы свяжемся с вами в ближайшее время.", Toast.LENGTH_LONG).show()
                                name = ""
                                phone = ""
                                comment = ""
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = MaterialTheme.shapes.small,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = MaterialTheme.colorScheme.onPrimary
                        )
                    ) {
                        Text("Отправить", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onPrimary))
                    }
                }
            }
        }
    }
}
