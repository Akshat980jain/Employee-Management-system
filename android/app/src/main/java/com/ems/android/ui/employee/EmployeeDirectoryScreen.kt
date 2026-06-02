package com.ems.android.ui.employee

import androidx.compose.foundation.background
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.ems.android.ui.theme.Primary
import com.ems.android.ui.theme.Success

data class Employee(
    val id: String,
    val firstName: String,
    val lastName: String,
    val email: String,
    val role: String,
    val department: String,
    val avatar: String? = null,
    val isActive: Boolean = true
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmployeeDirectoryScreen(
    onNavigateBack: () -> Unit = {},
    onEmployeeClick: (String) -> Unit = {}
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedDepartment by remember { mutableStateOf("All") }
    
    val departments = listOf("All", "Engineering", "HR", "Finance", "Marketing", "Sales")
    
    // Sample data - in real app, this would come from ViewModel
    val employees = remember {
        listOf(
            Employee("1", "John", "Smith", "john@company.com", "EMPLOYEE", "Engineering", isActive = true),
            Employee("2", "Sarah", "Johnson", "sarah@company.com", "HR_MANAGER", "HR", isActive = true),
            Employee("3", "Michael", "Chen", "michael@company.com", "EMPLOYEE", "Finance", isActive = true),
            Employee("4", "Emily", "Brown", "emily@company.com", "EMPLOYEE", "Marketing", isActive = false),
            Employee("5", "David", "Wilson", "david@company.com", "ADMIN", "Engineering", isActive = true),
            Employee("6", "Lisa", "Taylor", "lisa@company.com", "EMPLOYEE", "Sales", isActive = true)
        )
    }
    
    val filteredEmployees = employees.filter { employee ->
        val matchesSearch = searchQuery.isEmpty() || 
            "${employee.firstName} ${employee.lastName}".contains(searchQuery, ignoreCase = true) ||
            employee.email.contains(searchQuery, ignoreCase = true)
        val matchesDepartment = selectedDepartment == "All" || employee.department == selectedDepartment
        matchesSearch && matchesDepartment
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Top App Bar
        TopAppBar(
            title = { 
                Text(
                    "Employee Directory",
                    fontWeight = FontWeight.SemiBold
                )
            },
            navigationIcon = {
                IconButton(onClick = onNavigateBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        )
        
        Column(
            modifier = Modifier.padding(horizontal = 16.dp)
        ) {
            Spacer(modifier = Modifier.height(8.dp))
            
            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { 
                    Text(
                        "Search employees...",
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                },
                leadingIcon = {
                    Icon(
                        Icons.Default.Search,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(
                                Icons.Default.Clear,
                                contentDescription = "Clear",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    } else {
                        IconButton(onClick = { /* Filter options */ }) {
                            Icon(
                                Icons.Default.FilterList,
                                contentDescription = "Filter",
                                tint = Primary
                            )
                        }
                    }
                },
                singleLine = true,
                shape = MaterialTheme.shapes.medium,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline,
                    focusedContainerColor = MaterialTheme.colorScheme.surface,
                    unfocusedContainerColor = MaterialTheme.colorScheme.surface
                )
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Department Filter Chips
            SingleChoiceSegmentedButtonRow(
                modifier = Modifier.fillMaxWidth()
            ) {
                // Show first 4 departments as chips due to space constraints
                val visibleDepts = departments.take(4)
                visibleDepts.forEachIndexed { index, dept ->
                    SegmentedButton(
                        selected = selectedDepartment == dept,
                        onClick = { selectedDepartment = dept },
                        shape = SegmentedButtonDefaults.itemShape(
                            index = index,
                            count = visibleDepts.size
                        ),
                        colors = SegmentedButtonDefaults.colors(
                            activeContainerColor = Primary,
                            activeContentColor = Color.White
                        )
                    ) {
                        Text(
                            text = dept,
                            style = MaterialTheme.typography.labelMedium,
                            maxLines = 1
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Results count
            Text(
                text = "${filteredEmployees.size} employees found",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        // Employee List
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(filteredEmployees) { employee ->
                EmployeeCard(
                    employee = employee,
                    onClick = { onEmployeeClick(employee.id) }
                )
            }
            
            item {
                Spacer(modifier = Modifier.height(80.dp))
            }
        }
    }
}

@Composable
private fun EmployeeCard(
    employee: Employee,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
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
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Avatar
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(MaterialTheme.shapes.medium)
                    .background(MaterialTheme.colorScheme.surfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                if (employee.avatar != null) {
                    AsyncImage(
                        model = employee.avatar,
                        contentDescription = "Profile",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Text(
                        text = "${employee.firstName.first()}${employee.lastName.first()}",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = Primary
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            // Employee Info
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "${employee.firstName} ${employee.lastName}",
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    
                    Spacer(modifier = Modifier.width(8.dp))
                    
                    // Status indicator
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(MaterialTheme.shapes.extraSmall)
                            .background(
                                if (employee.isActive) Success else MaterialTheme.colorScheme.outline
                            )
                    )
                }
                
                Text(
                    text = when (employee.role) {
                        "ADMIN" -> "Administrator"
                        "HR_MANAGER" -> "HR Manager"
                        else -> "Employee"
                    },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                // Department chip
                Surface(
                    shape = MaterialTheme.shapes.extraSmall,
                    color = Primary.copy(alpha = 0.1f)
                ) {
                    Text(
                        text = employee.department,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = Primary
                    )
                }
            }
            
            // Action button
            IconButton(onClick = { /* More options */ }) {
                Icon(
                    Icons.Default.MoreVert,
                    contentDescription = "Options",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
