package com.ems.android.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.ems.android.data.models.AttendanceSession
import com.ems.android.data.models.LeaveBalance
import com.ems.android.ui.theme.*
import java.time.Duration
import java.time.Instant
import androidx.compose.ui.graphics.vector.ImageVector

@Composable
fun WelcomeCard(
    name: String,
    date: String,
    role: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(
            containerColor = Color.Transparent
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(MaterialTheme.shapes.large)
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(GradientStart, GradientEnd)
                    )
                )
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Welcome back,",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White.copy(alpha = 0.8f)
                    )
                    Text(
                        text = name,
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = date,
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.White.copy(alpha = 0.8f)
                    )
                }
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .clip(MaterialTheme.shapes.medium)
                        .background(Color.White.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = when (role) {
                            "ADMIN" -> Icons.Default.AdminPanelSettings
                            "HR_MANAGER" -> Icons.Default.Badge
                            else -> Icons.Default.Person
                        },
                        contentDescription = null,
                        modifier = Modifier.size(28.dp),
                        tint = Color.White
                    )
                }
            }
        }
    }
}

@Composable
fun ClockInOutCard(
    isClockedIn: Boolean,
    currentSession: AttendanceSession?,
    onClockIn: () -> Unit,
    onClockOut: () -> Unit,
    isLoading: Boolean = false
) {
    var currentTime by remember { mutableLongStateOf(System.currentTimeMillis()) }
    
    // Update timer every second when clocked in
    LaunchedEffect(isClockedIn) {
        while (isClockedIn) {
            kotlinx.coroutines.delay(1000)
            currentTime = System.currentTimeMillis()
        }
    }
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Status indicator
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(MaterialTheme.shapes.extraLarge)
                    .background(
                        if (isClockedIn) 
                            SuccessContainer
                        else 
                            MaterialTheme.colorScheme.surfaceVariant
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.AccessTime,
                    contentDescription = null,
                    modifier = Modifier.size(40.dp),
                    tint = if (isClockedIn) Success else MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            if (isClockedIn && currentSession != null) {
                val checkInTime = try {
                    Instant.parse(currentSession.checkIn).toEpochMilli()
                } catch (e: Exception) {
                    currentTime
                }
                val duration = Duration.ofMillis(currentTime - checkInTime)
                val hours = duration.toHours()
                val minutes = duration.toMinutes() % 60
                val seconds = duration.seconds % 60
                
                Text(
                    text = String.format("%02d:%02d:%02d", hours, minutes, seconds),
                    style = MaterialTheme.typography.displaySmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = "Time worked today",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else {
                Text(
                    text = "Not clocked in",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = "Tap below to start your workday",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                )
            }
            
            Spacer(modifier = Modifier.height(20.dp))
            
            Button(
                onClick = if (isClockedIn) onClockOut else onClockIn,
                enabled = !isLoading,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = MaterialTheme.shapes.medium,
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isClockedIn) Error else Success
                )
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                } else {
                    Icon(
                        imageVector = if (isClockedIn) Icons.Default.Stop else Icons.Default.PlayArrow,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (isClockedIn) "Clock Out" else "Clock In",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}

@Composable
fun LeaveBalanceCard(
    balance: LeaveBalance,
    modifier: Modifier = Modifier
) {
    val progress = if (balance.total > 0) balance.available.toFloat() / balance.total else 0f
    val animatedProgress by animateFloatAsState(
        targetValue = progress,
        animationSpec = tween(1000),
        label = "progress"
    )
    
    val progressColor = when {
        progress > 0.5f -> Success
        progress > 0.25f -> Warning
        else -> Error
    }
    
    Card(
        modifier = modifier,
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Circular progress indicator
            Box(
                modifier = Modifier.size(56.dp),
                contentAlignment = Alignment.Center
            ) {
                Canvas(modifier = Modifier.size(56.dp)) {
                    // Background circle
                    drawArc(
                        color = progressColor.copy(alpha = 0.2f),
                        startAngle = -90f,
                        sweepAngle = 360f,
                        useCenter = false,
                        style = Stroke(width = 6.dp.toPx(), cap = StrokeCap.Round)
                    )
                    // Progress arc
                    drawArc(
                        color = progressColor,
                        startAngle = -90f,
                        sweepAngle = animatedProgress * 360f,
                        useCenter = false,
                        style = Stroke(width = 6.dp.toPx(), cap = StrokeCap.Round)
                    )
                }
                Text(
                    text = balance.available.toString(),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = progressColor
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = balance.leaveType.name,
                style = MaterialTheme.typography.bodySmall,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface,
                maxLines = 1
            )
            
            Text(
                text = "${balance.used}/${balance.total} used",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconTint: Color = Primary,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(MaterialTheme.shapes.medium)
                    .background(iconTint.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    modifier = Modifier.size(24.dp),
                    tint = iconTint
                )
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column {
                Text(
                    text = value,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun QuickActionButton(
    text: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier.height(44.dp),
        shape = MaterialTheme.shapes.medium,
        colors = ButtonDefaults.outlinedButtonColors(
            contentColor = Primary
        ),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(18.dp)
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = text,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Medium
        )
    }
}

data class ThemeController(
    val isDark: Boolean,
    val toggleTheme: () -> Unit
)

val LocalThemeController = compositionLocalOf<ThemeController> {
    error("No ThemeController provided")
}

@Composable
fun SharedHeader(
    title: String,
    navigationIcon: ImageVector? = null,
    onNavigationClick: (() -> Unit)? = null,
    actions: @Composable (RowScope.() -> Unit)? = null
) {
    val themeController = LocalThemeController.current
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surface)
            .padding(horizontal = 8.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (navigationIcon != null && onNavigationClick != null) {
            IconButton(
                onClick = onNavigationClick,
                modifier = Modifier.size(36.dp)
            ) {
                Icon(
                    imageVector = navigationIcon,
                    contentDescription = null,
                    modifier = Modifier.size(22.dp),
                    tint = MaterialTheme.colorScheme.onSurface
                )
            }
            Spacer(modifier = Modifier.width(4.dp))
        } else {
            Spacer(modifier = Modifier.width(8.dp))
        }

        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.weight(1f)
        )

        if (actions != null) {
            actions()
        }

        // Global Theme Switch Toggle Button
        IconButton(
            onClick = { themeController.toggleTheme() },
            modifier = Modifier.size(36.dp)
        ) {
            Icon(
                imageVector = if (themeController.isDark) Icons.Default.LightMode else Icons.Default.DarkMode,
                contentDescription = "Toggle Theme",
                modifier = Modifier.size(20.dp),
                tint = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}
