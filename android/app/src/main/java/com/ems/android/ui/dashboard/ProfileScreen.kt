package com.ems.android.ui.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.ems.android.ui.theme.GradientEnd
import com.ems.android.ui.theme.GradientStart
import com.ems.android.ui.theme.Primary
import kotlinx.coroutines.launch
import com.ems.android.ui.components.LocalThemeController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onLogout: () -> Unit,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val themeController = LocalThemeController.current
    val user by viewModel.user.collectAsState()
    val scope = rememberCoroutineScope()
    var showLogoutDialog by remember { mutableStateOf(false) }
    
    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = { 
                Text(
                    "Sign Out",
                    fontWeight = FontWeight.SemiBold
                )
            },
            text = { 
                Text(
                    "Are you sure you want to sign out of your account?",
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        scope.launch {
                            viewModel.logout()
                            onLogout()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Text("Sign Out")
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { showLogoutDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp)
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(GradientStart, GradientEnd)
                    )
                )
        ) {
            // Theme toggle button at top right
            IconButton(
                onClick = { themeController.toggleTheme() },
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .statusBarsPadding()
                    .padding(8.dp)
            ) {
                Icon(
                    imageVector = if (themeController.isDark) Icons.Default.LightMode else Icons.Default.DarkMode,
                    contentDescription = "Toggle Theme",
                    tint = Color.White
                )
            }
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(top = 40.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Profile",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
                
                Spacer(modifier = Modifier.height(20.dp))
                
                // Avatar
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .clip(MaterialTheme.shapes.extraLarge)
                        .background(Color.White)
                ) {
                    if (user?.avatar != null) {
                        AsyncImage(
                            model = user?.avatar,
                            contentDescription = "Profile Photo",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                    } else {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.Person,
                                contentDescription = null,
                                modifier = Modifier.size(48.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }
        
        // Content
        Column(
            modifier = Modifier
                .fillMaxSize()
                .offset(y = (-20).dp)
                .clip(MaterialTheme.shapes.large)
                .background(MaterialTheme.colorScheme.background)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "${user?.firstName ?: ""} ${user?.lastName ?: ""}",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = user?.email ?: "",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Role Chip
            Surface(
                shape = MaterialTheme.shapes.small,
                color = Primary.copy(alpha = 0.1f)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        when (user?.role) {
                            "ADMIN" -> Icons.Default.AdminPanelSettings
                            "HR_MANAGER" -> Icons.Default.Badge
                            else -> Icons.Default.Person
                        },
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = Primary
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        when (user?.role) {
                            "ADMIN" -> "Administrator"
                            "HR_MANAGER" -> "HR Manager"
                            else -> "Employee"
                        },
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Medium,
                        color = Primary
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Quick Actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                QuickProfileAction(
                    icon = Icons.Default.Mail,
                    label = "Email",
                    onClick = { }
                )
                QuickProfileAction(
                    icon = Icons.Default.Phone,
                    label = "Call",
                    onClick = { }
                )
                QuickProfileAction(
                    icon = Icons.Default.Share,
                    label = "Share",
                    onClick = { }
                )
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Settings Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.large,
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column {
                    ProfileOption(
                        icon = Icons.Default.Person,
                        title = "Edit Profile",
                        onClick = { }
                    )
                    HorizontalDivider(
                        modifier = Modifier.padding(start = 56.dp),
                        color = MaterialTheme.colorScheme.outlineVariant
                    )
                    ProfileOption(
                        icon = Icons.Default.Lock,
                        title = "Change Password",
                        onClick = { }
                    )
                    HorizontalDivider(
                        modifier = Modifier.padding(start = 56.dp),
                        color = MaterialTheme.colorScheme.outlineVariant
                    )
                    ProfileOption(
                        icon = Icons.Default.Notifications,
                        title = "Notifications",
                        onClick = { }
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Preferences Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.large,
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column {
                    ProfileOption(
                        icon = Icons.Default.DarkMode,
                        title = "Appearance",
                        onClick = { }
                    )
                    HorizontalDivider(
                        modifier = Modifier.padding(start = 56.dp),
                        color = MaterialTheme.colorScheme.outlineVariant
                    )
                    ProfileOption(
                        icon = Icons.Default.Language,
                        title = "Language",
                        onClick = { }
                    )
                    HorizontalDivider(
                        modifier = Modifier.padding(start = 56.dp),
                        color = MaterialTheme.colorScheme.outlineVariant
                    )
                    ProfileOption(
                        icon = Icons.AutoMirrored.Filled.Help,
                        title = "Help & Support",
                        onClick = { }
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Logout Button
            Button(
                onClick = { showLogoutDialog = true },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = MaterialTheme.shapes.medium,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.errorContainer,
                    contentColor = MaterialTheme.colorScheme.error
                )
            ) {
                Icon(
                    Icons.AutoMirrored.Filled.Logout, 
                    contentDescription = null,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    "Sign Out",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
            }
            
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
private fun QuickProfileAction(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        FilledTonalIconButton(
            onClick = onClick,
            modifier = Modifier.size(48.dp),
            colors = IconButtonDefaults.filledTonalIconButtonColors(
                containerColor = Primary.copy(alpha = 0.1f),
                contentColor = Primary
            )
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                modifier = Modifier.size(22.dp)
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
fun ProfileOption(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        color = Color.Transparent
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .background(
                        MaterialTheme.colorScheme.surfaceVariant,
                        MaterialTheme.shapes.small
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.weight(1f)
            )
            Icon(
                Icons.Default.ChevronRight,
                contentDescription = null,
                modifier = Modifier.size(20.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
