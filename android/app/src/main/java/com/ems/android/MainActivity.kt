package com.ems.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.ems.android.data.local.TokenManager
import com.ems.android.ui.navigation.AppNavigation
import com.ems.android.ui.navigation.Routes
import com.ems.android.ui.theme.EMSProTheme
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

import com.ems.android.ui.components.LocalThemeController
import com.ems.android.ui.components.ThemeController
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    @Inject
    lateinit var tokenManager: TokenManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        setContent {
            val isDarkTheme by tokenManager.isDarkTheme().collectAsState(initial = true)
            val coroutineScope = rememberCoroutineScope()
            val themeController = remember(isDarkTheme) {
                ThemeController(
                    isDark = isDarkTheme,
                    toggleTheme = {
                        coroutineScope.launch {
                            tokenManager.setDarkTheme(!isDarkTheme)
                        }
                    }
                )
            }
            CompositionLocalProvider(LocalThemeController provides themeController) {
                EMSProTheme(darkTheme = isDarkTheme) {
                    Surface(
                        modifier = Modifier.fillMaxSize(),
                        color = MaterialTheme.colorScheme.background
                    ) {
                        val navController = rememberNavController()
                        val isLoggedIn by tokenManager.isLoggedIn().collectAsState(initial = null)
                        val user by tokenManager.getUser().collectAsState(initial = null)
                        
                        if (isLoggedIn == null) {
                            Box(
                                modifier = Modifier.fillMaxSize(),
                                contentAlignment = Alignment.Center
                            ) {
                                CircularProgressIndicator(
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                        } else {
                            val startDestination = when {
                                isLoggedIn == true && user?.isVerified == false -> Routes.PENDING_VERIFICATION
                                isLoggedIn == true -> Routes.MAIN
                                else -> Routes.LOGIN
                            }
                            AppNavigation(
                                navController = navController,
                                startDestination = startDestination
                            )
                        }
                    }
                }
            }
        }
    }
}
