package com.ems.android.ui.employee

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.ems.android.data.models.DepartmentDetails

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddEditEmployeeScreen(
    employeeId: String? = null,
    onNavigateBack: () -> Unit,
    viewModel: EmployeeViewModel = hiltViewModel()
) {
    val departments by viewModel.departments.collectAsState()
    val selectedEmployee by viewModel.selectedEmployee.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val actionResult by viewModel.actionResult.collectAsState()
    val error by viewModel.error.collectAsState()
    
    val isEdit = employeeId != null
    
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var selectedRole by remember { mutableStateOf("EMPLOYEE") }
    var selectedDepartment by remember { mutableStateOf<DepartmentDetails?>(null) }
    var roleExpanded by remember { mutableStateOf(false) }
    var deptExpanded by remember { mutableStateOf(false) }
    
    LaunchedEffect(employeeId) {
        if (employeeId != null) {
            viewModel.loadEmployeeDetail(employeeId)
        }
        viewModel.loadDepartments()
    }
    
    LaunchedEffect(selectedEmployee) {
        if (isEdit && selectedEmployee != null) {
            firstName = selectedEmployee!!.firstName
            lastName = selectedEmployee!!.lastName
            email = selectedEmployee!!.email
            phone = selectedEmployee!!.phone ?: ""
            selectedRole = selectedEmployee!!.role ?: "EMPLOYEE"
            selectedDepartment = selectedEmployee!!.department
        }
    }
    
    LaunchedEffect(actionResult) {
        if (actionResult != null) {
            onNavigateBack()
        }
    }
    
    val roles = listOf(
        "EMPLOYEE" to "Employee",
        "HR_MANAGER" to "HR Manager",
        "ADMIN" to "Administrator"
    )
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (isEdit) "Edit Employee" else "Add Employee") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            if (isLoading) {
                LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
            }
            
            error?.let { errorMsg ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    )
                ) {
                    Text(
                        text = errorMsg,
                        modifier = Modifier.padding(16.dp),
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
            
            // First Name
            OutlinedTextField(
                value = firstName,
                onValueChange = { firstName = it },
                label = { Text("First Name") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) }
            )
            
            // Last Name
            OutlinedTextField(
                value = lastName,
                onValueChange = { lastName = it },
                label = { Text("Last Name") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) }
            )
            
            // Email
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                leadingIcon = { Icon(Icons.Default.Email, contentDescription = null) },
                enabled = !isEdit // Can't change email on edit
            )
            
            // Password (only on create)
            if (!isEdit) {
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Password") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) }
                )
            }
            
            // Phone
            OutlinedTextField(
                value = phone,
                onValueChange = { phone = it },
                label = { Text("Phone (Optional)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null) }
            )
            
            // Role Dropdown
            ExposedDropdownMenuBox(
                expanded = roleExpanded,
                onExpandedChange = { roleExpanded = it }
            ) {
                OutlinedTextField(
                    value = roles.find { it.first == selectedRole }?.second ?: "",
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Role") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = roleExpanded) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(MenuAnchorType.PrimaryNotEditable),
                    leadingIcon = { Icon(Icons.Default.Badge, contentDescription = null) }
                )
                ExposedDropdownMenu(
                    expanded = roleExpanded,
                    onDismissRequest = { roleExpanded = false }
                ) {
                    roles.forEach { (value, label) ->
                        DropdownMenuItem(
                            text = { Text(label) },
                            onClick = {
                                selectedRole = value
                                roleExpanded = false
                            }
                        )
                    }
                }
            }
            
            // Department Dropdown
            ExposedDropdownMenuBox(
                expanded = deptExpanded,
                onExpandedChange = { deptExpanded = it }
            ) {
                OutlinedTextField(
                    value = selectedDepartment?.name ?: "Select Department",
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Department (Optional)") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = deptExpanded) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(MenuAnchorType.PrimaryNotEditable),
                    leadingIcon = { Icon(Icons.Default.AccountTree, contentDescription = null) }
                )
                ExposedDropdownMenu(
                    expanded = deptExpanded,
                    onDismissRequest = { deptExpanded = false }
                ) {
                    DropdownMenuItem(
                        text = { Text("No Department") },
                        onClick = {
                            selectedDepartment = null
                            deptExpanded = false
                        }
                    )
                    departments.forEach { dept ->
                        DropdownMenuItem(
                            text = { Text(dept.name) },
                            onClick = {
                                selectedDepartment = dept
                                deptExpanded = false
                            }
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Submit Button
            Button(
                onClick = {
                    if (isEdit) {
                        viewModel.updateEmployee(
                            employeeId = employeeId,
                            firstName = firstName,
                            lastName = lastName,
                            phone = phone.takeIf { it.isNotBlank() },
                            departmentId = selectedDepartment?.id
                        )
                    } else {
                        viewModel.createEmployee(
                            firstName = firstName,
                            lastName = lastName,
                            email = email,
                            password = password,
                            role = selectedRole,
                            phone = phone.takeIf { it.isNotBlank() },
                            departmentId = selectedDepartment?.id
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = firstName.isNotBlank() && lastName.isNotBlank() && 
                         email.isNotBlank() && (isEdit || password.isNotBlank())
            ) {
                Icon(if (isEdit) Icons.Default.Save else Icons.Default.PersonAdd, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(if (isEdit) "Update Employee" else "Add Employee")
            }
        }
    }
}
