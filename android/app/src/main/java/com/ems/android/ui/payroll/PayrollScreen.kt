package com.ems.android.ui.payroll

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

data class PayrollEntry(
    val id: String,
    val employeeName: String,
    val employeeId: String,
    val designation: String,
    val basicSalary: Double,
    val allowances: Double,
    val deductions: Double,
    val netSalary: Double,
    val status: String,
    val month: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PayrollScreen(
    onNavigateBack: () -> Unit
) {
    var selectedMonth by remember { mutableStateOf("January 2026") }
    var showGenerateDialog by remember { mutableStateOf(false) }
    
    // Sample payroll data
    val payrollEntries = remember {
        listOf(
            PayrollEntry("1", "Akshat Jain", "EMP001", "Administrator", 75000.0, 15000.0, 5000.0, 85000.0, "PAID", "January 2026"),
            PayrollEntry("2", "John Doe", "EMP002", "Developer", 60000.0, 12000.0, 4000.0, 68000.0, "PENDING", "January 2026"),
            PayrollEntry("3", "Jane Smith", "EMP003", "HR Manager", 65000.0, 13000.0, 4500.0, 73500.0, "PAID", "January 2026"),
            PayrollEntry("4", "Mike Wilson", "EMP004", "Designer", 55000.0, 11000.0, 3500.0, 62500.0, "PROCESSING", "January 2026"),
            PayrollEntry("5", "Sarah Brown", "EMP005", "Analyst", 50000.0, 10000.0, 3000.0, 57000.0, "PENDING", "January 2026"),
        )
    }
    
    // Generate Payroll Dialog
    if (showGenerateDialog) {
        AlertDialog(
            onDismissRequest = { showGenerateDialog = false },
            title = { Text("Generate Payroll") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Generate payroll for all employees?")
                    OutlinedTextField(
                        value = selectedMonth,
                        onValueChange = { selectedMonth = it },
                        label = { Text("Month") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(onClick = { showGenerateDialog = false }) {
                    Text("Generate")
                }
            },
            dismissButton = {
                TextButton(onClick = { showGenerateDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Payroll Management") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { showGenerateDialog = true }) {
                        Icon(Icons.Default.Add, contentDescription = "Generate Payroll")
                    }
                }
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { showGenerateDialog = true },
                icon = { Icon(Icons.Default.Calculate, contentDescription = null) },
                text = { Text("Generate Payroll") }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Summary Cards
            item {
                Text(
                    text = "Payroll Summary - $selectedMonth",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    PayrollSummaryCard(
                        title = "Total Salary",
                        value = "₹3,46,000",
                        icon = Icons.Default.Payments,
                        color = Color(0xFF6366F1),
                        modifier = Modifier.weight(1f)
                    )
                    PayrollSummaryCard(
                        title = "Employees",
                        value = "5",
                        icon = Icons.Default.People,
                        color = Color(0xFF10B981),
                        modifier = Modifier.weight(1f)
                    )
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    PayrollSummaryCard(
                        title = "Paid",
                        value = "2",
                        icon = Icons.Default.CheckCircle,
                        color = Color(0xFF10B981),
                        modifier = Modifier.weight(1f)
                    )
                    PayrollSummaryCard(
                        title = "Pending",
                        value = "3",
                        icon = Icons.Default.Pending,
                        color = Color(0xFFF59E0B),
                        modifier = Modifier.weight(1f)
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Employee Payroll",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }
            
            // Payroll Entries
            items(payrollEntries) { entry ->
                PayrollCard(entry = entry)
            }
            
            item { Spacer(modifier = Modifier.height(80.dp)) }
        }
    }
}

@Composable
fun PayrollSummaryCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.1f))
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(icon, contentDescription = null, tint = color)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = color
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
fun PayrollCard(entry: PayrollEntry) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = entry.employeeName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "${entry.employeeId} • ${entry.designation}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Surface(
                    color = when (entry.status) {
                        "PAID" -> Color(0xFF10B981).copy(alpha = 0.1f)
                        "PENDING" -> Color(0xFFF59E0B).copy(alpha = 0.1f)
                        else -> Color(0xFF6366F1).copy(alpha = 0.1f)
                    },
                    shape = MaterialTheme.shapes.small
                ) {
                    Text(
                        text = entry.status,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = when (entry.status) {
                            "PAID" -> Color(0xFF10B981)
                            "PENDING" -> Color(0xFFF59E0B)
                            else -> Color(0xFF6366F1)
                        }
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            HorizontalDivider()
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                PayrollDetailItem("Basic", "₹${entry.basicSalary.toInt()}")
                PayrollDetailItem("Allowances", "+₹${entry.allowances.toInt()}")
                PayrollDetailItem("Deductions", "-₹${entry.deductions.toInt()}")
                PayrollDetailItem("Net", "₹${entry.netSalary.toInt()}", highlight = true)
            }
        }
    }
}

@Composable
fun PayrollDetailItem(label: String, value: String, highlight: Boolean = false) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = if (highlight) FontWeight.Bold else FontWeight.Normal,
            color = if (highlight) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
        )
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
