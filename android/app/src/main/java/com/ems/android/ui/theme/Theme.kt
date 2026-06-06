package com.ems.android.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary              = Primary,              // Deep Indigo-Navy (#1A2980)
    onPrimary            = Color.White,
    primaryContainer     = Color(0xFFE8ECFA),    // Soft Blue-Gray container
    onPrimaryContainer   = Primary,
    secondary            = Secondary,            // Premium Teal (#00B4A0)
    onSecondary          = Color.White,
    secondaryContainer   = Color(0xFFE0F7F5),    // Soft Teal container
    onSecondaryContainer = SecondaryDark,
    tertiary             = Accent,               // Electric Blue (#4F6FFF)
    onTertiary           = Color.White,
    background           = Background,           // Clean Light (#F4F6FB)
    onBackground         = OnSurface,            // Crisp Navy Text (#0D1340)
    surface              = Surface,              // Pure White (#FFFFFF)
    onSurface            = OnSurface,
    surfaceVariant       = SurfaceVariant,       // Soft Gray-Blue (#ECEFF8)
    onSurfaceVariant     = OnSurfaceVariant,     // Muted Blue-Gray (#5C6584)
    outline              = Outline,              // (#BEC6E0)
    outlineVariant       = OutlineVariant,       // (#D8DFEF)
    // Upgraded light status containers (Pastels)
    error                = Error,                // Premium Red (#FF4D6A)
    onError              = Color.White,
    errorContainer       = Color(0xFFFFEBEE),    // Light pink-red
    onErrorContainer     = Error,
)

// HD Premium Dark Color Scheme
private val DarkColorScheme = darkColorScheme(
    primary              = PrimaryVariant,         // electric blue — vivid on dark
    onPrimary            = Color(0xFFF0F4FF),
    primaryContainer     = Color(0xFF1E2A4A),
    onPrimaryContainer   = AccentLight,
    secondary            = SecondaryLight,         // bright teal
    onSecondary          = Color(0xFF001A17),
    secondaryContainer   = Color(0xFF00261E),
    onSecondaryContainer = Color(0xFF00D4BC),
    tertiary             = AccentLight,
    onTertiary           = Color(0xFF0D1340),
    error                = ErrorLight,
    onError              = Color(0xFF3D0014),
    errorContainer       = Color(0xFF5C0020),
    onErrorContainer     = ErrorLight,
    background           = DarkBackground,         // near-black deep blue
    onBackground         = DarkOnSurface,
    surface              = DarkSurface,            // rich navy surface
    onSurface            = DarkOnSurface,
    surfaceVariant       = DarkSurfaceVariant,     // elevated card
    onSurfaceVariant     = DarkOnSurfaceVariant,
    outline              = DarkOutline,
    outlineVariant       = Color(0xFF1E2A4A),
    inverseSurface       = DarkOnSurface,
    inverseOnSurface     = DarkSurface,
    inversePrimary       = Primary,
    scrim                = Color(0x99000000)
)

@Suppress("DEPRECATION")
@Composable
fun EMSProTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),     // Dynamic default from system
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            // Transparent status bar for full HD edge-to-edge
            window.statusBarColor = Color.Transparent.toArgb()
            WindowCompat.setDecorFitsSystemWindows(window, false)
            // Adjust status bar icon colors based on theme: dark icons in light mode, light icons in dark mode
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        shapes = Shapes,
        content = content
    )
}
