package com.list.mobile.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// ─── Design Palette (matching index.css) ─────────────────────────────────────
val BgColor = Color(0xFFF7F5F0)         // --bg
val Bg2Color = Color(0xFFEDEAE3)        // --bg2
val CardColor = Color(0xFFFFFFFF)       // --card
val InkColor = Color(0xFF16201A)        // --ink
val Ink2Color = Color(0xFF3D4E45)       // --ink2
val Ink3Color = Color(0xFF7A8E84)       // --ink3
val GreenColor = Color(0xFF1A5C38)      // --green
val Green2Color = Color(0xFF22784A)     // --green2
val Green3Color = Color(0xFF2E9A5F)     // --green3
val GreenLightColor = Color(0xFFE8F5EE) // --green-light
val GoldColor = Color(0xFFC8920A)       // --gold
val RedColor = Color(0xFF9B2020)        // --red
val BorderColor = Color(0xFFDDD9D0)     // --border

// ─── Color Scheme ────────────────────────────────────────────────────────────
private val LightColorScheme = lightColorScheme(
    primary = Green2Color,
    secondary = Green3Color,
    background = BgColor,
    surface = CardColor,
    onPrimary = Color.White,
    onBackground = InkColor,
    onSurface = InkColor,
    outline = BorderColor,
    error = RedColor,
    primaryContainer = GreenLightColor,
    onPrimaryContainer = Green2Color,
    surfaceVariant = Bg2Color,
    onSurfaceVariant = Ink2Color
)

// ─── Shapes (18dp for cards/dialogs, 10dp for buttons/inputs) ─────────────────
val ListMobileShapes = Shapes(
    small = RoundedCornerShape(10.dp),
    medium = RoundedCornerShape(18.dp),
    large = RoundedCornerShape(24.dp)
)

// ─── Typography (emulating Geologica and Bebas Neue) ─────────────────────────
val ListMobileTypography = Typography(
    headlineLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Black,
        fontSize = 32.sp,
        lineHeight = 38.sp,
        letterSpacing = 0.5.sp,
        color = InkColor
    ),
    headlineMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 26.sp,
        lineHeight = 32.sp,
        letterSpacing = 0.5.sp,
        color = InkColor
    ),
    titleLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 20.sp,
        lineHeight = 26.sp,
        color = InkColor
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 17.sp,
        lineHeight = 22.sp,
        color = InkColor
    ),
    bodyLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 15.sp,
        lineHeight = 22.sp,
        color = Ink2Color
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        color = Ink2Color
    ),
    bodySmall = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        color = Ink3Color
    )
)

@Composable
fun ListMobileTheme(
    darkTheme: Boolean = isSystemInDarkTheme(), // We default to the light color scheme for visual identity
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        shapes = ListMobileShapes,
        typography = ListMobileTypography,
        content = content
    )
}
