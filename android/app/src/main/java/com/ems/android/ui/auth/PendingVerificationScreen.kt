package com.ems.android.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.HourglassEmpty
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.ems.android.ui.components.LocalThemeController
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Cancel
import androidx.hilt.navigation.compose.hiltViewModel
import kotlinx.coroutines.delay


@Composable
fun PendingVerificationScreen(
    onLogout: () -> Unit,
    onApproved: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val loginState by viewModel.loginState.collectAsState()
    val themeController = LocalThemeController.current
    val isDark = themeController.isDark
    
    // Auto-refresh to check approval status
    LaunchedEffect(Unit) {
        while (true) {
            viewModel.checkJoinRequestStatus()
            delay(10000) // Check every 10 seconds
        }
    }
    
    LaunchedEffect(loginState.isLoggedIn, loginState.pendingApproval) {
        if (loginState.isLoggedIn && !loginState.pendingApproval) {
            onApproved()
        }
    }
    
    val isRejected = loginState.joinRequestStatus == "REJECTED"
    val orgName = loginState.joinRequestOrgName ?: loginState.user?.organization?.name ?: "your organization"
    
    Box(modifier = Modifier.fillMaxSize()) {
        // Theme Switcher Toggle at top right
        IconButton(
            onClick = { themeController.toggleTheme() },
            modifier = Modifier
                .align(Alignment.TopEnd)
                .statusBarsPadding()
                .padding(16.dp)
        ) {
            Icon(
                imageVector = if (isDark) Icons.Default.LightMode else Icons.Default.DarkMode,
                contentDescription = "Toggle Theme",
                tint = MaterialTheme.colorScheme.onSurface
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Status Icon
            Card(
                modifier = Modifier.size(120.dp),
                shape = MaterialTheme.shapes.extraLarge,
                colors = CardDefaults.cardColors(
                    containerColor = if (isRejected) 
                        MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.3f)
                    else 
                        MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
                )
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (isRejected) Icons.Default.Cancel else Icons.Default.HourglassEmpty,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = if (isRejected) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Text(
                text = if (isRejected) "Request Declined" else "Pending Approval",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = if (isRejected) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = if (isRejected) 
                    "Unfortunately, your request to join $orgName was not approved."
                else
                    "Your request to join $orgName is being reviewed by the organization administrator.",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = if (isRejected)
                    "Please contact your organization's HR department for further details."
                else
                    "You will be notified once your account is approved.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )
            
            val rejectionReason = loginState.rejectionReason
            if (isRejected && !rejectionReason.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(16.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.15f)
                    ),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.error.copy(alpha = 0.3f))
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Text(
                            text = "Reason for Rejection:",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.error
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = rejectionReason,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Info Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                )
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Text(
                        text = if (isRejected) "What can you do?" else "What happens next?",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    if (isRejected) {
                        Text(
                            text = "• Contact organization administrators directly",
                            style = MaterialTheme.typography.bodyMedium
                        )
                        Text(
                            text = "• Sign out and request to join a different organization",
                            style = MaterialTheme.typography.bodyMedium
                        )
                    } else {
                        Text(
                            text = "• An HR Manager or Admin will review your request",
                            style = MaterialTheme.typography.bodyMedium
                        )
                        Text(
                            text = "• You'll receive access once approved",
                            style = MaterialTheme.typography.bodyMedium
                        )
                        Text(
                            text = "• This page will auto-refresh periodically",
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            if (!isRejected) {
                // Check Status Button
                Button(
                    onClick = { viewModel.checkJoinRequestStatus() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = MaterialTheme.shapes.medium,
                    enabled = !loginState.isLoading
                ) {
                    if (loginState.isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = MaterialTheme.colorScheme.onPrimary,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = null,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Check Status")
                    }
                }
                
                Spacer(modifier = Modifier.height(12.dp))
            }
            
            // Logout Button
            OutlinedButton(
                onClick = {
                    viewModel.logout()
                    onLogout()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = MaterialTheme.shapes.medium
            ) {
                Icon(
                    Icons.AutoMirrored.Filled.Logout,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Sign Out")
            }
        }
    }
}
