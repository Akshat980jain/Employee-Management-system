package com.ems.android.ui.roles

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

data class Role(
    val id: String,
    val name: String,
    val description: String,
    val permissions: List<String>,
    val userCount: Int,
    val isSystem: Boolean
)

data class Permission(
    val key: String,
    val name: String,
    val description: String,
    val category: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RolesManagementScreen(
    onNavigateBack: () -> Unit
) {
    var showAddRoleDialog by remember { mutableStateOf(false) }
    var selectedRole by remember { mutableStateOf<Role?>(null) }
    
    val roles = remember {
        listOf(
            Role(
                "1", "Administrator", "Full system access",
                listOf("*:*"),
                2, true
            ),
            Role(
                "2", "HR Manager", "Manage employees and leave",
                listOf("employees:*", "leave:*", "attendance:*", "reports:read"),
                3, true
            ),
            Role(
                "3", "Employee", "Basic employee access",
                listOf("attendance:create", "attendance:read", "leave:create", "leave:read"),
                45, true
            ),
            Role(
                "4", "Team Lead", "Team management access",
                listOf("employees:read", "attendance:read", "leave:approve", "reports:read"),
                8, false
            ),
        )
    }
    
    val allPermissions = remember {
        listOf(
            Permission("employees:create", "Create Employees", "Add new employees", "Employees"),
            Permission("employees:read", "View Employees", "View employee details", "Employees"),
            Permission("employees:update", "Update Employees", "Edit employee info", "Employees"),
            Permission("employees:delete", "Delete Employees", "Remove employees", "Employees"),
            Permission("attendance:create", "Clock In/Out", "Record attendance", "Attendance"),
            Permission("attendance:read", "View Attendance", "View attendance records", "Attendance"),
            Permission("attendance:update", "Update Attendance", "Modify records", "Attendance"),
            Permission("leave:create", "Apply Leave", "Submit leave requests", "Leave"),
            Permission("leave:read", "View Leave", "View leave requests", "Leave"),
            Permission("leave:approve", "Approve Leave", "Approve/reject leave", "Leave"),
            Permission("reports:read", "View Reports", "Access reports", "Reports"),
            Permission("reports:export", "Export Reports", "Download reports", "Reports"),
        )
    }
    
    // Add Role Dialog
    if (showAddRoleDialog) {
        var roleName by remember { mutableStateOf("") }
        var roleDescription by remember { mutableStateOf("") }
        var selectedPermissions by remember { mutableStateOf(setOf<String>()) }
        
        AlertDialog(
            onDismissRequest = { showAddRoleDialog = false },
            title = { Text("Create New Role") },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedTextField(
                        value = roleName,
                        onValueChange = { roleName = it },
                        label = { Text("Role Name") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = roleDescription,
                        onValueChange = { roleDescription = it },
                        label = { Text("Description") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    Text(
                        text = "Permissions",
                        style = MaterialTheme.typography.labelLarge
                    )
                    
                    Column(modifier = Modifier.heightIn(max = 200.dp)) {
                        allPermissions.groupBy { it.category }.forEach { (category, permissions) ->
                            Text(
                                text = category,
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.primary
                            )
                            permissions.forEach { permission ->
                                Row(
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Checkbox(
                                        checked = selectedPermissions.contains(permission.key),
                                        onCheckedChange = { checked ->
                                            selectedPermissions = if (checked) {
                                                selectedPermissions + permission.key
                                            } else {
                                                selectedPermissions - permission.key
                                            }
                                        }
                                    )
                                    Text(
                                        text = permission.name,
                                        style = MaterialTheme.typography.bodySmall
                                    )
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(onClick = { showAddRoleDialog = false }) {
                    Text("Create")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddRoleDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
    
    // Role Detail Sheet
    if (selectedRole != null) {
        AlertDialog(
            onDismissRequest = { selectedRole = null },
            title = { 
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(selectedRole!!.name)
                    if (selectedRole!!.isSystem) {
                        Surface(
                            color = Color(0xFF6366F1).copy(alpha = 0.1f),
                            shape = MaterialTheme.shapes.small
                        ) {
                            Text(
                                text = "SYSTEM",
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                style = MaterialTheme.typography.labelSmall,
                                color = Color(0xFF6366F1)
                            )
                        }
                    }
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        text = selectedRole!!.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    Text(
                        text = "Users with this role: ${selectedRole!!.userCount}",
                        style = MaterialTheme.typography.bodySmall
                    )
                    
                    HorizontalDivider()
                    
                    Text(
                        text = "Permissions",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.SemiBold
                    )
                    
                    selectedRole!!.permissions.forEach { permission ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.Check,
                                contentDescription = null,
                                tint = Color(0xFF10B981),
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = permission,
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                    }
                }
            },
            confirmButton = {
                if (!selectedRole!!.isSystem) {
                    Button(onClick = { selectedRole = null }) {
                        Text("Edit")
                    }
                }
            },
            dismissButton = {
                TextButton(onClick = { selectedRole = null }) {
                    Text("Close")
                }
            }
        )
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Manage Roles") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { showAddRoleDialog = true }) {
                Icon(Icons.Default.Add, contentDescription = "Add Role")
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFF6366F1).copy(alpha = 0.1f)
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.AdminPanelSettings,
                            contentDescription = null,
                            tint = Color(0xFF6366F1),
                            modifier = Modifier.size(40.dp)
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                        Column {
                            Text(
                                text = "Role-Based Access Control",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = "Manage user permissions and access levels",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
            
            item {
                Text(
                    text = "Roles (${roles.size})",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }
            
            items(roles) { role ->
                RoleCard(
                    role = role,
                    onClick = { selectedRole = role }
                )
            }
            
            item { Spacer(modifier = Modifier.height(80.dp)) }
        }
    }
}

@Composable
fun RoleCard(
    role: Role,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = onClick,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .padding(4.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = when (role.name) {
                            "Administrator" -> Icons.Default.Security
                            "HR Manager" -> Icons.Default.SupervisorAccount
                            "Employee" -> Icons.Default.Person
                            else -> Icons.Default.Badge
                        },
                        contentDescription = null,
                        tint = when (role.name) {
                            "Administrator" -> Color(0xFFEF4444)
                            "HR Manager" -> Color(0xFF6366F1)
                            "Employee" -> Color(0xFF10B981)
                            else -> Color(0xFFF59E0B)
                        },
                        modifier = Modifier.size(32.dp)
                    )
                }
                
                Spacer(modifier = Modifier.width(12.dp))
                
                Column {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = role.name,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                        if (role.isSystem) {
                            Surface(
                                color = Color(0xFF9CA3AF).copy(alpha = 0.2f),
                                shape = MaterialTheme.shapes.small
                            ) {
                                Text(
                                    text = "SYSTEM",
                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = Color(0xFF6B7280)
                                )
                            }
                        }
                    }
                    Text(
                        text = role.description,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "${role.userCount} users • ${role.permissions.size} permissions",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            
            Icon(
                Icons.Default.ChevronRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
