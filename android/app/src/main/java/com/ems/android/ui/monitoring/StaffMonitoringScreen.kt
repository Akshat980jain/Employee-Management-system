package com.ems.android.ui.monitoring

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import com.ems.android.data.models.StaffAttendance

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StaffMonitoringScreen(
    onNavigateBack: () -> Unit,
    viewModel: StaffMonitoringViewModel = hiltViewModel()
) {
    val staffData by viewModel.filteredStaffData.collectAsState()
    val departments by viewModel.departments.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val selectedDepartment by viewModel.selectedDepartment.collectAsState()
    val selectedRole by viewModel.selectedRole.collectAsState()
    
    val roles = listOf(
        null to "All Roles",
        "ADMIN" to "Admin",
        "HR_MANAGER" to "HR",
        "EMPLOYEE" to "Employee"
    )
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Staff Monitoring") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.loadStaffData() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { viewModel.setSearchQuery(it) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                placeholder = { Text("Search by name...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                singleLine = true,
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { viewModel.setSearchQuery("") }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear")
                        }
                    }
                }
            )
            
            // Role Filter Chips
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(roles) { (role, label) ->
                    FilterChip(
                        selected = selectedRole == role,
                        onClick = { viewModel.setRoleFilter(role) },
                        label = { Text(label) }
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Department Filter Chips
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                item {
                    FilterChip(
                        selected = selectedDepartment == null,
                        onClick = { viewModel.setDepartmentFilter(null) },
                        label = { Text("All Depts") }
                    )
                }
                items(departments) { dept ->
                    FilterChip(
                        selected = selectedDepartment == dept.id,
                        onClick = { viewModel.setDepartmentFilter(dept.id) },
                        label = { Text(dept.name) }
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            if (isLoading) {
                LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
            }
            
            // Staff List
            if (staffData.isEmpty() && !isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.Insights,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            "No staff data available",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(staffData) { staff ->
                        StaffCard(staff = staff)
                    }
                }
            }
        }
    }
}

@Composable
fun StaffCard(staff: StaffAttendance) {
    Card(modifier = Modifier.fillMaxWidth()) {
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
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "${staff.employee.firstName} ${staff.employee.lastName}",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = staff.employee.department?.name ?: "No Department",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                // Today's Status
                staff.status?.let { status ->
                    AssistChip(
                        onClick = { },
                        label = { Text(status) },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = when (status.uppercase()) {
                                "PRESENT" -> MaterialTheme.colorScheme.primaryContainer
                                "LATE" -> MaterialTheme.colorScheme.tertiaryContainer
                                "ABSENT" -> MaterialTheme.colorScheme.errorContainer
                                "ON_LEAVE" -> MaterialTheme.colorScheme.secondaryContainer
                                else -> MaterialTheme.colorScheme.surfaceVariant
                            }
                        )
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Stats Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                StaffStatItem(
                    label = "Present",
                    value = staff.presentDays,
                    color = MaterialTheme.colorScheme.primary
                )
                StaffStatItem(
                    label = "Late",
                    value = staff.lateDays,
                    color = MaterialTheme.colorScheme.tertiary
                )
                StaffStatItem(
                    label = "Absent",
                    value = staff.absentDays,
                    color = MaterialTheme.colorScheme.error
                )
                StaffStatItem(
                    label = "Leave",
                    value = staff.leaveDays,
                    color = MaterialTheme.colorScheme.secondary
                )
            }
            
            // Work Hours
            if (staff.totalWorkHours > 0) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Total Work Hours",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "${String.format("%.1f", staff.totalWorkHours)} hrs",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }
    }
}

@Composable
fun StaffStatItem(
    label: String,
    value: Int,
    color: androidx.compose.ui.graphics.Color
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value.toString(),
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = color.copy(alpha = 0.7f)
        )
    }
}
