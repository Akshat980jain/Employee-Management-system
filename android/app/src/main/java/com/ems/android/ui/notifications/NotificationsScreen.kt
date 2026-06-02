package com.ems.android.ui.notifications

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp

data class Notification(
    val id: String,
    val type: String,
    val title: String,
    val message: String,
    val timestamp: String,
    val isRead: Boolean,
    val actionUrl: String? = null
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsScreen(
    onNavigateBack: () -> Unit
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("All", "Unread")
    
    val notifications = remember {
        mutableStateListOf(
            Notification("1", "LEAVE", "Leave Request Approved", "Your annual leave request for Jan 28-30 has been approved.", "2 min ago", false),
            Notification("2", "ATTENDANCE", "Late Check-in Alert", "You checked in 15 minutes late today.", "1 hour ago", false),
            Notification("3", "SYSTEM", "Password Expiry Reminder", "Your password will expire in 7 days. Please update it.", "3 hours ago", true),
            Notification("4", "LEAVE", "New Leave Request", "John Doe has requested leave from Feb 1-5.", "5 hours ago", false),
            Notification("5", "JOIN", "New Join Request", "Sarah Wilson has requested to join the organization.", "Yesterday", true),
            Notification("6", "REVIEW", "Performance Review Due", "Your Q4 2025 performance review is pending.", "Yesterday", true),
            Notification("7", "PAYROLL", "Payslip Generated", "Your January 2026 payslip is now available.", "2 days ago", true),
            Notification("8", "GOAL", "Goal Deadline Approaching", "Project milestone deadline is in 3 days.", "3 days ago", true),
        )
    }
    
    fun markAsRead(id: String) {
        val index = notifications.indexOfFirst { it.id == id }
        if (index >= 0) {
            notifications[index] = notifications[index].copy(isRead = true)
        }
    }
    
    fun markAllAsRead() {
        notifications.forEachIndexed { index, notification ->
            if (!notification.isRead) {
                notifications[index] = notification.copy(isRead = true)
            }
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Notifications") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    TextButton(onClick = { markAllAsRead() }) {
                        Text("Mark all read")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Tabs
            TabRow(selectedTabIndex = selectedTab) {
                tabs.forEachIndexed { index, title ->
                    val count = if (index == 1) notifications.count { !it.isRead } else notifications.size
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { 
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text(title)
                                if (index == 1 && count > 0) {
                                    Badge { Text(count.toString()) }
                                }
                            }
                        }
                    )
                }
            }
            
            val filteredNotifications = when (selectedTab) {
                1 -> notifications.filter { !it.isRead }
                else -> notifications.toList()
            }
            
            if (filteredNotifications.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            Icons.Default.NotificationsOff,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                        )
                        Text(
                            text = "No notifications",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    items(filteredNotifications, key = { it.id }) { notification ->
                        NotificationItem(
                            notification = notification,
                            onMarkRead = { markAsRead(notification.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun NotificationItem(
    notification: Notification,
    onMarkRead: () -> Unit
) {
    val iconAndColor = when (notification.type) {
        "LEAVE" -> Pair(Icons.AutoMirrored.Filled.EventNote, Color(0xFF6366F1))
        "ATTENDANCE" -> Pair(Icons.Default.AccessTime, Color(0xFFF59E0B))
        "SYSTEM" -> Pair(Icons.Default.Settings, Color(0xFF9CA3AF))
        "JOIN" -> Pair(Icons.Default.PersonAdd, Color(0xFF10B981))
        "REVIEW" -> Pair(Icons.Default.Star, Color(0xFFF59E0B))
        "PAYROLL" -> Pair(Icons.Default.Payments, Color(0xFF10B981))
        "GOAL" -> Pair(Icons.Default.Flag, Color(0xFFEF4444))
        else -> Pair(Icons.Default.Notifications, Color(0xFF6366F1))
    }
    
    Surface(
        onClick = onMarkRead,
        color = if (notification.isRead) 
            MaterialTheme.colorScheme.surface 
        else 
            MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.1f)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Icon
            Surface(
                color = iconAndColor.second.copy(alpha = 0.1f),
                shape = MaterialTheme.shapes.medium,
                modifier = Modifier.size(48.dp)
            ) {
                Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                    Icon(
                        iconAndColor.first,
                        contentDescription = null,
                        tint = iconAndColor.second,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
            
            // Content
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Text(
                        text = notification.title,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = if (notification.isRead) FontWeight.Normal else FontWeight.SemiBold,
                        modifier = Modifier.weight(1f)
                    )
                    Text(
                        text = notification.timestamp,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = notification.message,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }
            
            // Unread indicator
            if (!notification.isRead) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .padding(top = 4.dp)
                ) {
                    Surface(
                        color = MaterialTheme.colorScheme.primary,
                        shape = MaterialTheme.shapes.small,
                        modifier = Modifier.size(8.dp)
                    ) {}
                }
            }
        }
    }
    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
}
