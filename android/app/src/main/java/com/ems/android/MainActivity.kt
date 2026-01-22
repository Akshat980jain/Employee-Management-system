package com.ems.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.ems.android.data.local.TokenManager
import com.ems.android.ui.navigation.AppNavigation
import com.ems.android.ui.navigation.Routes
import com.ems.android.ui.theme.EMSProTheme
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    @Inject
    lateinit var tokenManager: TokenManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        setContent {
            EMSProTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    val isLoggedIn by tokenManager.isLoggedIn().collectAsState(initial = false)
                    
                    AppNavigation(
                        navController = navController,
                        startDestination = if (isLoggedIn) Routes.MAIN else Routes.LOGIN
                    )
                }
            }
        }
    }
}
