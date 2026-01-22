package com.ems.android.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(
    onNavigateToLogin: () -> Unit,
    onRegisterSuccess: () -> Unit,
    onPendingApproval: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val state by viewModel.registerState.collectAsState()
    val organizations by viewModel.organizations.collectAsState()
    var passwordVisible by remember { mutableStateOf(false) }
    var confirmPasswordVisible by remember { mutableStateOf(false) }
    var showOrgDropdown by remember { mutableStateOf(false) }
    
    LaunchedEffect(state.isRegistered, state.pendingApproval) {
        when {
            state.pendingApproval -> onPendingApproval()
            state.isRegistered -> onRegisterSuccess()
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Create Account") },
                navigationIcon = {
                    IconButton(onClick = onNavigateToLogin) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(24.dp)
        ) {
            // Role Selection
            Text(
                text = "Select Your Role",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("EMPLOYEE", "HR_MANAGER", "ADMIN").forEach { role ->
                    FilterChip(
                        selected = state.role == role,
                        onClick = { viewModel.updateRegisterField(role = role) },
                        label = { 
                            Text(
                                when (role) {
                                    "ADMIN" -> "Admin"
                                    "HR_MANAGER" -> "HR Manager"
                                    else -> "Employee"
                                }
                            )
                        },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Organization Choice (only for Admin)
            if (state.role == "ADMIN") {
                Text(
                    text = "Organization",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(8.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = state.organizationChoice == "CREATE_NEW",
                        onClick = { viewModel.updateRegisterField(organizationChoice = "CREATE_NEW") },
                        label = { Text("Create New") },
                        modifier = Modifier.weight(1f)
                    )
                    FilterChip(
                        selected = state.organizationChoice == "JOIN_EXISTING",
                        onClick = { viewModel.updateRegisterField(organizationChoice = "JOIN_EXISTING") },
                        label = { Text("Join Existing") },
                        modifier = Modifier.weight(1f)
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
            }
            
            // Create New Organization Fields
            if (state.role == "ADMIN" && state.organizationChoice == "CREATE_NEW") {
                OutlinedTextField(
                    value = state.organizationName,
                    onValueChange = { viewModel.updateRegisterField(organizationName = it) },
                    label = { Text("Organization Name *") },
                    leadingIcon = { Icon(Icons.Default.Business, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = MaterialTheme.shapes.medium
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedTextField(
                    value = state.industry,
                    onValueChange = { viewModel.updateRegisterField(industry = it) },
                    label = { Text("Industry") },
                    leadingIcon = { Icon(Icons.Default.Category, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = MaterialTheme.shapes.medium
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedTextField(
                    value = state.size,
                    onValueChange = { viewModel.updateRegisterField(size = it) },
                    label = { Text("Company Size") },
                    leadingIcon = { Icon(Icons.Default.Groups, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = MaterialTheme.shapes.medium
                )
                
                Spacer(modifier = Modifier.height(16.dp))
            }
            
            // Join Existing Organization
            if (state.organizationChoice == "JOIN_EXISTING") {
                Text(
                    text = "Search Organization",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(8.dp))
                
                ExposedDropdownMenuBox(
                    expanded = showOrgDropdown && organizations.isNotEmpty(),
                    onExpandedChange = { showOrgDropdown = it }
                ) {
                    OutlinedTextField(
                        value = state.searchQuery,
                        onValueChange = { 
                            viewModel.searchOrganizations(it)
                            showOrgDropdown = true
                        },
                        label = { Text("Search by name") },
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(),
                        singleLine = true,
                        shape = MaterialTheme.shapes.medium
                    )
                    
                    ExposedDropdownMenu(
                        expanded = showOrgDropdown && organizations.isNotEmpty(),
                        onDismissRequest = { showOrgDropdown = false }
                    ) {
                        organizations.forEach { org ->
                            DropdownMenuItem(
                                text = { 
                                    Column {
                                        Text(org.name)
                                        org.industry?.let {
                                            Text(
                                                text = it,
                                                style = MaterialTheme.typography.bodySmall,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                    }
                                },
                                onClick = {
                                    viewModel.updateRegisterField(
                                        organizationId = org.id,
                                        organizationName = org.name
                                    )
                                    viewModel.searchOrganizations(org.name)
                                    showOrgDropdown = false
                                }
                            )
                        }
                    }
                }
                
                if (state.organizationId != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Selected: ${state.organizationName}")
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedTextField(
                    value = state.message,
                    onValueChange = { viewModel.updateRegisterField(message = it) },
                    label = { Text("Message (Optional)") },
                    leadingIcon = { Icon(Icons.Default.Message, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2,
                    maxLines = 4,
                    shape = MaterialTheme.shapes.medium
                )
                
                Spacer(modifier = Modifier.height(16.dp))
            }
            
            // Personal Details Section
            HorizontalDivider()
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = "Personal Details",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                OutlinedTextField(
                    value = state.firstName,
                    onValueChange = { viewModel.updateRegisterField(firstName = it) },
                    label = { Text("First Name *") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    shape = MaterialTheme.shapes.medium
                )
                
                OutlinedTextField(
                    value = state.lastName,
                    onValueChange = { viewModel.updateRegisterField(lastName = it) },
                    label = { Text("Last Name *") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    shape = MaterialTheme.shapes.medium
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = state.email,
                onValueChange = { viewModel.updateRegisterField(email = it) },
                label = { Text("Email *") },
                leadingIcon = { Icon(Icons.Default.Email, contentDescription = null) },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                singleLine = true,
                shape = MaterialTheme.shapes.medium
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = state.password,
                onValueChange = { viewModel.updateRegisterField(password = it) },
                label = { Text("Password *") },
                leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                trailingIcon = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = null
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                singleLine = true,
                shape = MaterialTheme.shapes.medium
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = state.confirmPassword,
                onValueChange = { viewModel.updateRegisterField(confirmPassword = it) },
                label = { Text("Confirm Password *") },
                leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                trailingIcon = {
                    IconButton(onClick = { confirmPasswordVisible = !confirmPasswordVisible }) {
                        Icon(
                            if (confirmPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = null
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                visualTransformation = if (confirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                singleLine = true,
                shape = MaterialTheme.shapes.medium,
                isError = state.confirmPassword.isNotEmpty() && state.password != state.confirmPassword
            )
            
            // Error Message
            if (state.error != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = state.error!!,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Register Button
            Button(
                onClick = { viewModel.register() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                enabled = !state.isLoading,
                shape = MaterialTheme.shapes.medium
            ) {
                if (state.isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text(
                        text = "Create Account",
                        style = MaterialTheme.typography.titleMedium
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Login Link
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Already have an account? ",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                TextButton(onClick = onNavigateToLogin) {
                    Text(
                        text = "Sign In",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}
