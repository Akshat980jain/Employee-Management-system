package com.ems.android.ui.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminDashboard(
    onLogout: () -> Unit,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val user by viewModel.user.collectAsState()
    val pendingLeaveRequests by viewModel.pendingLeaveRequests.collectAsState()
    val pendingJoinRequests by viewModel.pendingJoinRequests.collectAsState()
    val todayStats by viewModel.todayStats.collectAsState()
    val departments by viewModel.departments.collectAsState()
    val recentActivities by viewModel.recentActivities.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    
    var showRejectDialog by remember { mutableStateOf(false) }
    var rejectRequestId by remember { mutableStateOf<String?>(null) }
    var rejectComment by remember { mutableStateOf("") }
    
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
            },
            title = { Text("Reject Leave Request") },
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
                        viewModel.rejectLeaveRequest(rejectRequestId!!, rejectComment.ifBlank { null })
                        showRejectDialog = false
                        rejectRequestId = null
                        rejectComment = ""
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
        TopAppBar(
            title = { Text("Admin Dashboard") },
            actions = {
                IconButton(onClick = { viewModel.refreshDashboardData() }) {
                    Icon(Icons.Default.Refresh, contentDescription = "Refresh")
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
                role = "Administrator"
            )
            
            // Organization Stats Row
            Text(
                text = "Organization Overview",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StatCard(
                    title = "Departments",
                    value = departments.size.toString(),
                    icon = Icons.Default.AccountTree,
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Pending",
                    value = (pendingLeaveRequests.size + pendingJoinRequests.size).toString(),
                    icon = Icons.Default.Pending,
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
            
            // System Status Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "System Status",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Medium
                            )
                            Text(
                                text = "All services operational",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                    AssistChip(
                        onClick = { },
                        label = { Text("Healthy") },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer
                        )
                    )
                }
            }
            
            // Recent Activities
            if (recentActivities.isNotEmpty()) {
                Text(
                    text = "Recent Activities",
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
                        recentActivities.take(5).forEachIndexed { index, activity ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 8.dp),
                                verticalAlignment = Alignment.Top
                            ) {
                                Icon(
                                    Icons.Default.History,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = activity.action,
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.Medium
                                    )
                                    activity.description?.let {
                                        Text(
                                            text = it,
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                    Text(
                                        text = activity.createdAt.take(16),
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                                    )
                                }
                            }
                            if (index < recentActivities.take(5).size - 1) {
                                HorizontalDivider()
                            }
                        }
                    }
                }
            }
            
            // Quick Admin Actions
            Text(
                text = "Quick Actions",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                AdminActionCard(
                    icon = Icons.Default.People,
                    title = "Employees",
                    modifier = Modifier.weight(1f),
                    onClick = { }
                )
                AdminActionCard(
                    icon = Icons.Default.AccountTree,
                    title = "Departments",
                    modifier = Modifier.weight(1f),
                    onClick = { }
                )
                AdminActionCard(
                    icon = Icons.Default.Settings,
                    title = "Settings",
                    modifier = Modifier.weight(1f),
                    onClick = { }
                )
            }
            
            // Pending Leave Requests
            if (pendingLeaveRequests.isNotEmpty()) {
                Text(
                    text = "Pending Leave Requests",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                
                pendingLeaveRequests.take(3).forEach { request ->
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
                
                pendingJoinRequests.take(3).forEach { request ->
                    PendingRequestCard(
                        title = "${request.user?.firstName} ${request.user?.lastName}",
                        subtitle = request.user?.email ?: "",
                        onApprove = { viewModel.approveJoinRequest(request.id) },
                        onReject = { viewModel.rejectJoinRequest(request.id) }
                    )
                }
            }
        }
    }
}

@Composable
fun AdminActionCard(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier,
        onClick = onClick,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.3f)
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
                tint = MaterialTheme.colorScheme.secondary,
                modifier = Modifier.size(28.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium
            )
        }
    }
}
