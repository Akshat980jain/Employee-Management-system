package com.ems.android.ui.leave

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.ems.android.ui.components.LeaveBalanceCard
import com.ems.android.ui.dashboard.PendingRequestCard
import com.ems.android.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LeaveScreen(
    viewModel: LeaveViewModel = hiltViewModel()
) {
    val leaveTypes by viewModel.leaveTypes.collectAsState()
    val leaveBalances by viewModel.leaveBalances.collectAsState()
    val myRequests by viewModel.myRequests.collectAsState()
    val pendingRequests by viewModel.pendingRequests.collectAsState()
    val user by viewModel.user.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val requestResult by viewModel.requestResult.collectAsState()
    
    var selectedTab by remember { mutableIntStateOf(0) }
    var showRequestDialog by remember { mutableStateOf(false) }
    
    var showRejectDialog by remember { mutableStateOf(false) }
    var rejectRequestId by remember { mutableStateOf<String?>(null) }
    var rejectComment by remember { mutableStateOf("") }
    
    val isHROrAdmin = user?.role in listOf("ADMIN", "HR_MANAGER")
    
    LaunchedEffect(Unit) {
        viewModel.loadLeaveData()
    }
    
    // Reject with reason dialog
    if (showRejectDialog && rejectRequestId != null) {
        AlertDialog(
            onDismissRequest = { 
                showRejectDialog = false
                rejectRequestId = null
                rejectComment = ""
            },
            title = { 
                Text(
                    "Reject Leave Request",
                    fontWeight = FontWeight.SemiBold
                )
            },
            text = {
                OutlinedTextField(
                    value = rejectComment,
                    onValueChange = { rejectComment = it },
                    label = { Text("Reason for rejection (Optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2,
                    shape = MaterialTheme.shapes.medium,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Primary
                    )
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.rejectRequest(rejectRequestId!!, rejectComment.ifBlank { null })
                        showRejectDialog = false
                        rejectRequestId = null
                        rejectComment = ""
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Error
                    )
                ) {
                    Text("Reject")
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { 
                    showRejectDialog = false
                    rejectRequestId = null
                    rejectComment = ""
                }) {
                    Text("Cancel")
                }
            }
        )
    }
    
    // Show snackbar for request result
    requestResult?.let { message ->
        LaunchedEffect(message) {
            kotlinx.coroutines.delay(2000)
            viewModel.clearRequestResult()
        }
    }
    
    if (showRequestDialog) {
        NewLeaveRequestDialog(
            leaveTypes = leaveTypes,
            onDismiss = { showRequestDialog = false },
            onSubmit = { typeId, startDate, endDate, reason ->
                viewModel.createLeaveRequest(typeId, startDate, endDate, reason)
                showRequestDialog = false
            }
        )
    }
    
    Scaffold(
        floatingActionButton = {
            if (selectedTab == 0) {
                FloatingActionButton(
                    onClick = { showRequestDialog = true },
                    containerColor = Primary,
                    contentColor = Color.White
                ) {
                    Icon(Icons.Default.Add, contentDescription = "New Request")
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(paddingValues)
        ) {
            TopAppBar(
                title = { 
                    Text(
                        "Leave Management",
                        fontWeight = FontWeight.SemiBold
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                ),
                actions = {
                    IconButton(onClick = { viewModel.loadLeaveData() }) {
                        Icon(
                            Icons.Default.Refresh, 
                            contentDescription = "Refresh",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            )
            
            if (isLoading) {
                LinearProgressIndicator(
                    modifier = Modifier.fillMaxWidth(),
                    color = Primary
                )
            }
            
            // Tabs with modern styling
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = Primary
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { 
                        Text(
                            "My Requests",
                            fontWeight = if (selectedTab == 0) FontWeight.SemiBold else FontWeight.Normal
                        )
                    }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { 
                        Text(
                            "Balances",
                            fontWeight = if (selectedTab == 1) FontWeight.SemiBold else FontWeight.Normal
                        )
                    }
                )
                if (isHROrAdmin) {
                    Tab(
                        selected = selectedTab == 2,
                        onClick = { selectedTab = 2 },
                        text = { 
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    "Pending",
                                    fontWeight = if (selectedTab == 2) FontWeight.SemiBold else FontWeight.Normal
                                )
                                if (pendingRequests.isNotEmpty()) {
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Badge(
                                        containerColor = Warning
                                    ) {
                                        Text(
                                            pendingRequests.size.toString(),
                                            color = Color.White
                                        )
                                    }
                                }
                            }
                        }
                    )
                }
            }
            
            when (selectedTab) {
                0 -> MyRequestsTab(
                    requests = myRequests,
                    onCancel = { viewModel.cancelLeaveRequest(it) }
                )
                1 -> BalancesTab(balances = leaveBalances)
                2 -> PendingTab(
                    requests = pendingRequests,
                    onApprove = { viewModel.approveRequest(it) },
                    onReject = { requestId ->
                        rejectRequestId = requestId
                        showRejectDialog = true
                    }
                )
            }
        }
    }
}

@Composable
fun MyRequestsTab(
    requests: List<com.ems.android.data.models.LeaveRequest>,
    onCancel: (String) -> Unit
) {
    if (requests.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .clip(MaterialTheme.shapes.extraLarge)
                        .background(MaterialTheme.colorScheme.surfaceVariant),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.EventNote,
                        contentDescription = null,
                        modifier = Modifier.size(40.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "No leave requests",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Tap + to create a new request",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    } else {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            requests.forEach { request ->
                LeaveRequestCard(
                    request = request,
                    onCancel = if (request.status == "PENDING") { { onCancel(request.id) } } else null
                )
            }
            Spacer(modifier = Modifier.height(72.dp))
        }
    }
}

@Composable
fun LeaveRequestCard(
    request: com.ems.android.data.models.LeaveRequest,
    onCancel: (() -> Unit)?
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(MaterialTheme.shapes.small)
                            .background(Primary.copy(alpha = 0.1f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.BeachAccess,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp),
                            tint = Primary
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = request.leaveType?.name ?: "Leave",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
                
                Surface(
                    shape = MaterialTheme.shapes.small,
                    color = when (request.status) {
                        "APPROVED" -> SuccessContainer
                        "REJECTED" -> ErrorContainer
                        else -> WarningContainer
                    }
                ) {
                    Text(
                        text = request.status,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Medium,
                        color = when (request.status) {
                            "APPROVED" -> Success
                            "REJECTED" -> Error
                            else -> Warning
                        }
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.DateRange,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "${request.startDate.take(10)} → ${request.endDate.take(10)}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            request.reason?.let { reason ->
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = reason,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f)
                )
            }
            
            if (onCancel != null) {
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedButton(
                    onClick = onCancel,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = Error
                    ),
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        width = 1.dp,
                        brush = androidx.compose.ui.graphics.SolidColor(Error)
                    )
                ) {
                    Icon(
                        Icons.Default.Close,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Cancel Request")
                }
            }
        }
    }
}

@Composable
fun BalancesTab(
    balances: List<com.ems.android.data.models.LeaveBalance>
) {
    if (balances.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = Primary)
        }
    } else {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Summary Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                balances.take(3).forEach { balance ->
                    LeaveBalanceCard(
                        balance = balance,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Leave Details",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            balances.forEach { balance ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
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
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(MaterialTheme.shapes.small)
                                    .background(Primary.copy(alpha = 0.1f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    when (balance.leaveType.name.lowercase()) {
                                        "sick" -> Icons.Default.LocalHospital
                                        "annual" -> Icons.Default.WbSunny
                                        "casual" -> Icons.Default.EventAvailable
                                        else -> Icons.Default.BeachAccess
                                    },
                                    contentDescription = null,
                                    modifier = Modifier.size(20.dp),
                                    tint = Primary
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = balance.leaveType.name,
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Medium,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "${balance.used} used of ${balance.total} days",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                        
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = balance.available.toString(),
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.Bold,
                                color = Primary
                            )
                            Text(
                                text = "Available",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PendingTab(
    requests: List<com.ems.android.data.models.LeaveRequest>,
    onApprove: (String) -> Unit,
    onReject: (String) -> Unit
) {
    if (requests.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .clip(MaterialTheme.shapes.extraLarge)
                        .background(SuccessContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.CheckCircle,
                        contentDescription = null,
                        modifier = Modifier.size(40.dp),
                        tint = Success
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "All caught up!",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "No pending requests to review",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    } else {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            requests.forEach { request ->
                PendingRequestCard(
                    title = "${request.employee?.firstName} ${request.employee?.lastName}",
                    subtitle = "${request.leaveType?.name}: ${request.startDate.take(10)} - ${request.endDate.take(10)}",
                    onApprove = { onApprove(request.id) },
                    onReject = { onReject(request.id) }
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NewLeaveRequestDialog(
    leaveTypes: List<com.ems.android.data.models.LeaveType>,
    onDismiss: () -> Unit,
    onSubmit: (typeId: String, startDate: String, endDate: String, reason: String?) -> Unit
) {
    var selectedType by remember { mutableStateOf<com.ems.android.data.models.LeaveType?>(null) }
    var startDate by remember { mutableStateOf("") }
    var endDate by remember { mutableStateOf("") }
    var reason by remember { mutableStateOf("") }
    var expanded by remember { mutableStateOf(false) }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { 
            Text(
                "New Leave Request",
                fontWeight = FontWeight.SemiBold
            )
        },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Leave Type Dropdown
                ExposedDropdownMenuBox(
                    expanded = expanded,
                    onExpandedChange = { expanded = it }
                ) {
                    OutlinedTextField(
                        value = selectedType?.name ?: "",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Leave Type") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(),
                        shape = MaterialTheme.shapes.medium,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Primary
                        )
                    )
                    
                    ExposedDropdownMenu(
                        expanded = expanded,
                        onDismissRequest = { expanded = false }
                    ) {
                        leaveTypes.forEach { type ->
                            DropdownMenuItem(
                                text = { Text(type.name) },
                                onClick = {
                                    selectedType = type
                                    expanded = false
                                },
                                leadingIcon = {
                                    Icon(
                                        Icons.Default.BeachAccess,
                                        contentDescription = null,
                                        modifier = Modifier.size(18.dp),
                                        tint = Primary
                                    )
                                }
                            )
                        }
                    }
                }
                
                // Start Date
                OutlinedTextField(
                    value = startDate,
                    onValueChange = { startDate = it },
                    label = { Text("Start Date (YYYY-MM-DD)") },
                    leadingIcon = {
                        Icon(
                            Icons.Default.DateRange,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = MaterialTheme.shapes.medium,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Primary
                    )
                )
                
                // End Date
                OutlinedTextField(
                    value = endDate,
                    onValueChange = { endDate = it },
                    label = { Text("End Date (YYYY-MM-DD)") },
                    leadingIcon = {
                        Icon(
                            Icons.Default.DateRange,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = MaterialTheme.shapes.medium,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Primary
                    )
                )
                
                // Reason
                OutlinedTextField(
                    value = reason,
                    onValueChange = { reason = it },
                    label = { Text("Reason (Optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2,
                    shape = MaterialTheme.shapes.medium,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Primary
                    )
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    selectedType?.let { type ->
                        onSubmit(type.id, startDate, endDate, reason.ifBlank { null })
                    }
                },
                enabled = selectedType != null && startDate.isNotBlank() && endDate.isNotBlank(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Primary
                )
            ) {
                Text("Submit Request")
            }
        },
        dismissButton = {
            OutlinedButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
