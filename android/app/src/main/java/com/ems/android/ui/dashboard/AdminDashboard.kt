package com.ems.android.ui.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import android.widget.Toast
import androidx.compose.ui.platform.LocalContext
import com.ems.android.utils.Resource
import com.ems.android.data.models.EmployeeDetail
import com.ems.android.ui.components.StatCard
import com.ems.android.ui.components.WelcomeCard
import java.time.LocalDate
import java.time.format.DateTimeFormatter

// Avatar colors for employees
private val avatarColors = listOf(
    Color(0xFF6366F1), // Indigo
    Color(0xFF8B5CF6), // Violet
    Color(0xFFEC4899), // Pink
    Color(0xFF14B8A6), // Teal
    Color(0xFFF59E0B), // Amber
    Color(0xFF10B981), // Emerald
    Color(0xFF3B82F6), // Blue
    Color(0xFFEF4444), // Red
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminDashboard(
    onLogout: () -> Unit,
    onNavigateToEmployees: () -> Unit = {},
    onNavigateToStaffMonitoring: () -> Unit = {},
    onNavigateToDepartments: () -> Unit = {},
    onNavigateToRoles: () -> Unit = {},
    onNavigateToNotifications: () -> Unit = {},
    onNavigateToProfile: () -> Unit = {},
    onOpenDrawer: () -> Unit = {},
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val user by viewModel.user.collectAsState()
    val pendingLeaveRequests by viewModel.pendingLeaveRequests.collectAsState()
    val pendingJoinRequests by viewModel.pendingJoinRequests.collectAsState()
    val todayStats by viewModel.todayStats.collectAsState()
    val departments by viewModel.departments.collectAsState()
    val employees by viewModel.employees.collectAsState()
    val totalEmployees by viewModel.totalEmployees.collectAsState()
    val recentActivities by viewModel.recentActivities.collectAsState()
    val attendanceStatus by viewModel.attendanceStatus.collectAsState()
    val clockInOutResult by viewModel.clockInOutResult.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    
    var showRejectDialog by remember { mutableStateOf(false) }
    var rejectRequestId by remember { mutableStateOf<String?>(null) }
    var rejectComment by remember { mutableStateOf("") }
    var isJoinRequestReject by remember { mutableStateOf(false) }
    var showSearchDialog by remember { mutableStateOf(false) }
    var showCreateDepartmentDialog by remember { mutableStateOf(false) }
    
    val context = LocalContext.current
    
    LaunchedEffect(Unit) {
        viewModel.refreshDashboardData()
    }
    
    LaunchedEffect(clockInOutResult) {
        clockInOutResult?.let { result ->
            when (result) {
                is Resource.Success -> {
                    val msg = result.data?.message ?: "Successfully clocked ${if (result.data?.session?.checkOut == null) "in" else "out"}!"
                    Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                    viewModel.clearClockResult()
                }
                is Resource.Error -> {
                    Toast.makeText(context, "Failed to clock: ${result.message}", Toast.LENGTH_LONG).show()
                    viewModel.clearClockResult()
                }
                else -> {}
            }
        }
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
    
    // Search Dialog
    if (showSearchDialog) {
        var searchQuery by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { showSearchDialog = false },
            title = { Text("Search") },
            text = {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    label = { Text("Search employees, departments...") },
                    modifier = Modifier.fillMaxWidth(),
                    leadingIcon = { Icon(Icons.Default.Search, null) }
                )
            },
            confirmButton = {
                Button(onClick = { showSearchDialog = false }) {
                    Text("Search")
                }
            },
            dismissButton = {
                TextButton(onClick = { showSearchDialog = false }) {
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
        // Header Row - matching design
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
                .padding(horizontal = 8.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Menu Button (opens drawer)
            IconButton(
                onClick = onOpenDrawer,
                modifier = Modifier.size(36.dp)
            ) {
                Icon(
                    Icons.Default.Menu, 
                    contentDescription = "Menu", 
                    modifier = Modifier.size(22.dp),
                    tint = MaterialTheme.colorScheme.onSurface
                )
            }
            
            Spacer(modifier = Modifier.width(4.dp))
            
            // Title
            Text(
                text = "Admin Dashboard",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.weight(1f)
            )
            
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
        
        if (isLoading) {
            LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
        }
        
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Welcome Card
            WelcomeCard(
                name = "${user?.firstName ?: ""} ${user?.lastName ?: ""}",
                date = LocalDate.now().format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy")),
                role = "Administrator"
            )
            
            // Clock In/Out Section
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = if (attendanceStatus?.isClockedIn == true) 
                        Color(0xFF10B981).copy(alpha = 0.1f) 
                    else 
                        MaterialTheme.colorScheme.surfaceVariant
                ),
                shape = RoundedCornerShape(16.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = if (attendanceStatus?.isClockedIn == true) "You're Clocked In" else "You're Not Clocked In",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = if (attendanceStatus?.isClockedIn == true) Color(0xFF10B981) else MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = if (attendanceStatus?.isClockedIn == true) 
                                "Since ${attendanceStatus?.currentSession?.checkIn?.let { com.ems.android.utils.DateTimeUtils.formatToLocalTime(it) } ?: "N/A"}" 
                            else 
                                "Tap to start your work day",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    
                    Button(
                        onClick = {
                            if (attendanceStatus?.isClockedIn == true) {
                                viewModel.clockOut()
                            } else {
                                viewModel.clockIn()
                            }
                        },
                        enabled = clockInOutResult !is Resource.Loading,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (attendanceStatus?.isClockedIn == true) 
                                Color(0xFFEF4444) 
                            else 
                                Color(0xFF10B981)
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        if (clockInOutResult is Resource.Loading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Icon(
                                imageVector = if (attendanceStatus?.isClockedIn == true) 
                                    Icons.Default.Stop 
                                else 
                                    Icons.Default.PlayArrow,
                                contentDescription = null,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (attendanceStatus?.isClockedIn == true) "Clock Out" else "Clock In",
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }
            
            // Organization Overview - 4 Stats Cards
            Text(
                text = "Organization Overview",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    StatCard(
                        title = "Employees",
                        value = totalEmployees.toString(),
                        icon = Icons.Default.People,
                        iconTint = Color(0xFF6366F1),
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        title = "Departments",
                        value = departments.size.toString(),
                        icon = Icons.Default.AccountTree,
                        iconTint = Color(0xFF8B5CF6),
                        modifier = Modifier.weight(1f)
                    )
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    StatCard(
                        title = "Present Today",
                        value = (todayStats?.present ?: 0).toString(),
                        icon = Icons.Default.CheckCircle,
                        iconTint = Color(0xFF10B981),
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        title = "Projects",
                        value = "12",
                        icon = Icons.Default.Folder,
                        iconTint = Color(0xFFF59E0B),
                        modifier = Modifier.weight(1f)
                    )
                }
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
                        color = Color(0xFF10B981),
                        modifier = Modifier.weight(1f)
                    )
                    AttendanceStatCard(
                        label = "Late",
                        value = stats.late,
                        color = Color(0xFFF59E0B),
                        modifier = Modifier.weight(1f)
                    )
                    AttendanceStatCard(
                        label = "Absent",
                        value = stats.absent,
                        color = Color(0xFFEF4444),
                        modifier = Modifier.weight(1f)
                    )
                    AttendanceStatCard(
                        label = "Leave",
                        value = stats.onLeave,
                        color = Color(0xFF6366F1),
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            
            // Employees Section with Check-in Status
            if (employees.isNotEmpty()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Employees",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    TextButton(onClick = onNavigateToEmployees) {
                        Text("View All")
                        Icon(
                            Icons.Default.ChevronRight,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
                
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    )
                ) {
                    Column {
                        employees.take(5).forEachIndexed { index, employee ->
                            EmployeeCheckInRow(
                                employee = employee,
                                avatarColor = avatarColors[index % avatarColors.size],
                                isCheckedIn = false // TODO: Get from todayStats
                            )
                            if (index < employees.take(5).size - 1) {
                                HorizontalDivider(
                                    modifier = Modifier.padding(horizontal = 16.dp),
                                    color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
                                )
                            }
                        }
                    }
                }
            }
            
            // Quick Actions - 2x2 Grid
            Text(
                text = "Quick Actions",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    QuickActionCard(
                        icon = Icons.Default.Insights,
                        title = "Staff Monitoring",
                        subtitle = "View performance",
                        iconTint = Color(0xFF6366F1),
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToStaffMonitoring
                    )
                    QuickActionCard(
                        icon = Icons.Default.People,
                        title = "View Employees",
                        subtitle = "Manage team",
                        iconTint = Color(0xFF10B981),
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToEmployees
                    )
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    QuickActionCard(
                        icon = Icons.Default.AddBusiness,
                        title = "Create Dept",
                        subtitle = "New department",
                        iconTint = Color(0xFF8B5CF6),
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToDepartments
                    )
                    QuickActionCard(
                        icon = Icons.Default.AdminPanelSettings,
                        title = "Manage Roles",
                        subtitle = "Permissions",
                        iconTint = Color(0xFFF59E0B),
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToRoles
                    )
                }
            }
            
            // System Health Card - Enhanced
            Text(
                text = "System Health",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    SystemHealthRow(
                        label = "Server Status",
                        value = "Operational",
                        isHealthy = true
                    )
                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f))
                    SystemHealthRow(
                        label = "Database",
                        value = "Connected",
                        isHealthy = true
                    )
                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f))
                    SystemHealthRow(
                        label = "API Response",
                        value = "45ms avg",
                        isHealthy = true
                    )
                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f))
                    SystemHealthRow(
                        label = "Storage",
                        value = "86% used",
                        isHealthy = true,
                        isWarning = true
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
                                        text = com.ems.android.utils.DateTimeUtils.formatToLocalDateTime(activity.createdAt),
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
                        onReject = { 
                            rejectRequestId = request.id
                            isJoinRequestReject = true
                            showRejectDialog = true
                        }
                    )
                }
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
            
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
fun EmployeeCheckInRow(
    employee: EmployeeDetail,
    avatarColor: Color,
    isCheckedIn: Boolean
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Avatar
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(avatarColor),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "${employee.firstName.firstOrNull() ?: ""}${employee.lastName.firstOrNull() ?: ""}".uppercase(),
                style = MaterialTheme.typography.titleSmall,
                color = Color.White,
                fontWeight = FontWeight.Bold
            )
        }
        
        Spacer(modifier = Modifier.width(12.dp))
        
        // Name and Role
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = "${employee.firstName} ${employee.lastName}",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = employee.role ?: "Employee",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        
        // Check-in Status Badge
        Surface(
            color = if (isCheckedIn) Color(0xFF10B981).copy(alpha = 0.1f) 
                    else Color(0xFFEF4444).copy(alpha = 0.1f),
            shape = MaterialTheme.shapes.small
        ) {
            Text(
                text = if (isCheckedIn) "CHECKED IN" else "NOT CHECKED IN",
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                style = MaterialTheme.typography.labelSmall,
                color = if (isCheckedIn) Color(0xFF10B981) else Color(0xFFEF4444),
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

@Composable
fun QuickActionCard(
    icon: ImageVector,
    title: String,
    subtitle: String,
    iconTint: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier,
        onClick = onClick,
        colors = CardDefaults.cardColors(
            containerColor = iconTint.copy(alpha = 0.1f)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(iconTint.copy(alpha = 0.2f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(24.dp)
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.SemiBold
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun SystemHealthRow(
    label: String,
    value: String,
    isHealthy: Boolean,
    isWarning: Boolean = false
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = value,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                color = when {
                    isWarning -> Color(0xFFF59E0B)
                    isHealthy -> Color(0xFF10B981)
                    else -> Color(0xFFEF4444)
                }
            )
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(
                        when {
                            isWarning -> Color(0xFFF59E0B)
                            isHealthy -> Color(0xFF10B981)
                            else -> Color(0xFFEF4444)
                        }
                    )
            )
        }
    }
}

@Composable
fun AdminActionCard(
    icon: ImageVector,
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
