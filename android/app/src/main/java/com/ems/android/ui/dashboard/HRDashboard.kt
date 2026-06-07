package com.ems.android.ui.dashboard

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.ems.android.ui.components.WelcomeCard
import java.time.LocalDate
import java.time.format.DateTimeFormatter

import com.ems.android.ui.components.SharedHeader
import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.draw.clip
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable

@Composable
fun HRDashboard(
    onLogout: () -> Unit,
    onOpenDrawer: () -> Unit = {},
    onNavigateToNotifications: () -> Unit = {},
    onNavigateToProfile: () -> Unit = {},
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val user by viewModel.user.collectAsState()
    val pendingLeaveRequests by viewModel.pendingLeaveRequests.collectAsState()
    val pendingJoinRequests by viewModel.pendingJoinRequests.collectAsState()
    val todayStats by viewModel.todayStats.collectAsState()
    val departments by viewModel.departments.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    
    var showRejectDialog by remember { mutableStateOf(false) }
    var rejectRequestId by remember { mutableStateOf<String?>(null) }
    var rejectComment by remember { mutableStateOf("") }
    var isJoinRequestReject by remember { mutableStateOf(false) }
    
    LaunchedEffect(Unit) {
        viewModel.refreshDashboardData()
    }
    
    // Reject Dialog
    if (showRejectDialog && rejectRequestId != null) {
        AlertDialog(
            onDismissRequest = { 
                showRejectDialog = false
                rejectRequestId = null
                rejectComment = ""
                isJoinRequestReject = false
            },
            title = { Text(if (isJoinRequestReject) "Reject Join Request" else "Reject Leave Request") },
            text = {
                OutlinedTextField(
                    value = rejectComment,
                    onValueChange = { rejectComment = it },
                    label = { Text("Reason (Optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (isJoinRequestReject) {
                            viewModel.rejectJoinRequest(rejectRequestId!!, rejectComment.ifBlank { null })
                        } else {
                            viewModel.rejectLeaveRequest(rejectRequestId!!, rejectComment.ifBlank { null })
                        }
                        showRejectDialog = false
                        rejectRequestId = null
                        rejectComment = ""
                        isJoinRequestReject = false
                    }
                ) {
                    Text("Reject")
                }
            },
            dismissButton = {
                TextButton(onClick = { 
                    showRejectDialog = false
                    rejectRequestId = null
                    rejectComment = ""
                    isJoinRequestReject = false
                }) {
                    Text("Cancel")
                }
            }
        )
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
    ) {
        // Standardized Custom Header Row
        SharedHeader(
            title = "HR Dashboard",
            navigationIcon = Icons.Default.Menu,
            onNavigationClick = onOpenDrawer,
            actions = {
                // Notifications with Badge
                BadgedBox(
                    badge = {
                        val pendingCount = pendingLeaveRequests.size + pendingJoinRequests.size
                        if (pendingCount > 0) {
                            Badge { Text(pendingCount.toString()) }
                        }
                    }
                ) {
                    IconButton(
                        onClick = onNavigateToNotifications,
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            Icons.Default.Notifications, 
                            contentDescription = "Notifications", 
                            modifier = Modifier.size(22.dp),
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
                
                Spacer(modifier = Modifier.width(4.dp))
                
                // Profile Avatar - Teal color to match design
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF14B8A6)) // Teal color
                        .clickable { onNavigateToProfile() },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "${user?.firstName?.firstOrNull() ?: ""}${user?.lastName?.firstOrNull() ?: ""}".uppercase(),
                        style = MaterialTheme.typography.labelMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        )
        
        if (isLoading) {
            LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
        }
        
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            WelcomeCard(
                name = "${user?.firstName ?: ""} ${user?.lastName ?: ""}",
                date = LocalDate.now().format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy")),
                role = "HR Manager"
            )
            
            // Stats Cards Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StatCard(
                    title = "Pending Leave",
                    value = pendingLeaveRequests.size.toString(),
                    icon = Icons.AutoMirrored.Filled.EventNote,
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Join Requests",
                    value = pendingJoinRequests.size.toString(),
                    icon = Icons.Default.PersonAdd,
                    modifier = Modifier.weight(1f)
                )
            }
            
            // Today's Attendance Stats
            todayStats?.let { stats ->
                Text(
                    text = "Today's Attendance",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    AttendanceStatCard(
                        label = "Present",
                        value = stats.present,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.weight(1f)
                    )
                    AttendanceStatCard(
                        label = "Late",
                        value = stats.late,
                        color = MaterialTheme.colorScheme.tertiary,
                        modifier = Modifier.weight(1f)
                    )
                    AttendanceStatCard(
                        label = "Absent",
                        value = stats.absent,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.weight(1f)
                    )
                    AttendanceStatCard(
                        label = "On Leave",
                        value = stats.onLeave,
                        color = MaterialTheme.colorScheme.secondary,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            
            // Department Overview
            if (departments.isNotEmpty()) {
                Text(
                    text = "Departments",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    )
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        departments.take(5).forEachIndexed { index, dept ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 8.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        Icons.Default.AccountTree,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Text(
                                        text = dept.name,
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                                AssistChip(
                                    onClick = { },
                                    label = { Text("${dept.employeeCount} employees") }
                                )
                            }
                            if (index < departments.take(5).size - 1) {
                                HorizontalDivider()
                            }
                        }
                    }
                }
            }
            
            // Pending Leave Requests
            if (pendingLeaveRequests.isNotEmpty()) {
                Text(
                    text = "Pending Leave Requests",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                
                pendingLeaveRequests.take(5).forEach { request ->
                    PendingRequestCard(
                        title = "${request.employee?.firstName} ${request.employee?.lastName}",
                        subtitle = "${request.leaveType?.name ?: "Leave"}: ${request.startDate.take(10)} - ${request.endDate.take(10)}",
                        onApprove = { viewModel.approveLeaveRequest(request.id) },
                        onReject = { 
                            rejectRequestId = request.id
                            showRejectDialog = true
                        }
                    )
                }
            }
            
            // Pending Join Requests
            if (pendingJoinRequests.isNotEmpty()) {
                Text(
                    text = "Pending Join Requests",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                
                pendingJoinRequests.take(5).forEach { request ->
                    PendingRequestCard(
                        title = "${request.user?.firstName} ${request.user?.lastName}",
                        subtitle = request.user?.email ?: "",
                        onApprove = { viewModel.approveJoinRequest(request.id) },
                        onReject = { 
                            rejectRequestId = request.id
                            isJoinRequestReject = true
                            showRejectDialog = true
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun AttendanceStatCard(
    label: String,
    value: Int,
    color: androidx.compose.ui.graphics.Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = color.copy(alpha = 0.1f)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = value.toString(),
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = color
            )
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = color.copy(alpha = 0.8f)
            )
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(28.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun PendingRequestCard(
    title: String,
    subtitle: String,
    onApprove: () -> Unit,
    onReject: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                IconButton(
                    onClick = onReject,
                    colors = IconButtonDefaults.iconButtonColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    )
                ) {
                    Icon(
                        Icons.Default.Close,
                        contentDescription = "Reject",
                        tint = MaterialTheme.colorScheme.error
                    )
                }
                IconButton(
                    onClick = onApprove,
                    colors = IconButtonDefaults.iconButtonColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Icon(
                        Icons.Default.Check,
                        contentDescription = "Approve",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }
    }
}
