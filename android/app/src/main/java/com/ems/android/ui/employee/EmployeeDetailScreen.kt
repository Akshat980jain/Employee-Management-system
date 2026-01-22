package com.ems.android.ui.employee

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmployeeDetailScreen(
    employeeId: String,
    onNavigateBack: () -> Unit,
    onEdit: (String) -> Unit,
    viewModel: EmployeeViewModel = hiltViewModel()
) {
    val employee by viewModel.selectedEmployee.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val actionResult by viewModel.actionResult.collectAsState()
    var showDeactivateDialog by remember { mutableStateOf(false) }
    
    LaunchedEffect(employeeId) {
        viewModel.loadEmployeeDetail(employeeId)
    }
    
    LaunchedEffect(actionResult) {
        if (actionResult != null) {
            kotlinx.coroutines.delay(2000)
            viewModel.clearActionResult()
        }
    }
    
    if (showDeactivateDialog) {
        AlertDialog(
            onDismissRequest = { showDeactivateDialog = false },
            title = { Text("Deactivate Employee") },
            text = { Text("Are you sure you want to deactivate this employee? They will no longer be able to access the system.") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deactivateEmployee(employeeId)
                        showDeactivateDialog = false
                        onNavigateBack()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Deactivate")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeactivateDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Employee Details") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { employee?.let { onEdit(it.id) } }) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit")
                    }
                }
            )
        }
    ) { padding ->
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else if (employee == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Text("Employee not found", color = MaterialTheme.colorScheme.error)
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Profile Header
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Card(
                            modifier = Modifier.size(80.dp),
                            shape = MaterialTheme.shapes.extraLarge
                        ) {
                            if (employee!!.avatar != null) {
                                AsyncImage(
                                    model = employee!!.avatar,
                                    contentDescription = null,
                                    modifier = Modifier.fillMaxSize()
                                )
                            } else {
                                Box(
                                    modifier = Modifier.fillMaxSize(),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "${employee!!.firstName.firstOrNull() ?: ""}${employee!!.lastName.firstOrNull() ?: ""}",
                                        style = MaterialTheme.typography.headlineMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Text(
                            text = "${employee!!.firstName} ${employee!!.lastName}",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold
                        )
                        
                        Text(
                            text = employee!!.email,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            AssistChip(
                                onClick = { },
                                label = {
                                    Text(when (employee!!.role) {
                                        "ADMIN" -> "Administrator"
                                        "HR_MANAGER" -> "HR Manager"
                                        else -> "Employee"
                                    })
                                }
                            )
                            if (employee!!.status != "ACTIVE") {
                                AssistChip(
                                    onClick = { },
                                    label = { Text("Inactive") },
                                    colors = AssistChipDefaults.assistChipColors(
                                        containerColor = MaterialTheme.colorScheme.errorContainer
                                    )
                                )
                            }
                        }
                    }
                }
                
                // Contact Info
                Text(
                    text = "Contact Information",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        InfoRow(
                            icon = Icons.Default.Email,
                            label = "Email",
                            value = employee!!.email
                        )
                        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                        InfoRow(
                            icon = Icons.Default.Phone,
                            label = "Phone",
                            value = employee!!.phone ?: "Not set"
                        )
                    }
                }
                
                // Employment Info
                Text(
                    text = "Employment Information",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        InfoRow(
                            icon = Icons.Default.Badge,
                            label = "Employee ID",
                            value = employee!!.employeeId ?: employee!!.id.take(8)
                        )
                        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                        InfoRow(
                            icon = Icons.Default.AccountTree,
                            label = "Department",
                            value = employee!!.department?.name ?: "Unassigned"
                        )
                        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                        InfoRow(
                            icon = Icons.Default.CalendarToday,
                            label = "Join Date",
                            value = employee!!.joinDate?.take(10) ?: employee!!.createdAt?.take(10) ?: "Unknown"
                        )
                    }
                }
                
                // Actions
                if (employee!!.status == "ACTIVE") {
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Button(
                        onClick = { showDeactivateDialog = true },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.errorContainer,
                            contentColor = MaterialTheme.colorScheme.error
                        )
                    ) {
                        Icon(Icons.Default.Block, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Deactivate Employee")
                    }
                }
            }
        }
    }
}

@Composable
fun InfoRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            icon,
            contentDescription = null,
            modifier = Modifier.size(20.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.width(12.dp))
        Column {
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = value,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}
