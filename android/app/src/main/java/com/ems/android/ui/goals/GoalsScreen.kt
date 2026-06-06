package com.ems.android.ui.goals

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
import com.ems.android.ui.components.SharedHeader

data class Goal(
    val id: String,
    val title: String,
    val description: String,
    val assignedTo: String,
    val dueDate: String,
    val progress: Float,
    val status: String,
    val priority: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GoalsScreen(
    onNavigateBack: () -> Unit
) {
    var showAddGoalDialog by remember { mutableStateOf(false) }
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("All Goals", "My Goals", "Team Goals")
    
    val goals = remember {
        listOf(
            Goal("1", "Complete Q1 Sales Target", "Achieve 100% of quarterly sales target", "John Doe", "Mar 31, 2026", 0.75f, "IN_PROGRESS", "HIGH"),
            Goal("2", "Employee Training Program", "Complete mandatory training modules", "All Employees", "Feb 28, 2026", 0.45f, "IN_PROGRESS", "MEDIUM"),
            Goal("3", "Code Review Implementation", "Review 50 pull requests", "Dev Team", "Jan 31, 2026", 1.0f, "COMPLETED", "HIGH"),
            Goal("4", "Customer Satisfaction Score", "Achieve 95% customer satisfaction", "Support Team", "Mar 15, 2026", 0.6f, "IN_PROGRESS", "HIGH"),
            Goal("5", "Documentation Update", "Update all API documentation", "Jane Smith", "Feb 15, 2026", 0.2f, "AT_RISK", "LOW"),
        )
    }
    
    // Add Goal Dialog
    if (showAddGoalDialog) {
        var goalTitle by remember { mutableStateOf("") }
        var goalDescription by remember { mutableStateOf("") }
        
        AlertDialog(
            onDismissRequest = { showAddGoalDialog = false },
            title = { Text("Create New Goal") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedTextField(
                        value = goalTitle,
                        onValueChange = { goalTitle = it },
                        label = { Text("Goal Title") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = goalDescription,
                        onValueChange = { goalDescription = it },
                        label = { Text("Description") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3
                    )
                }
            },
            confirmButton = {
                Button(onClick = { showAddGoalDialog = false }) {
                    Text("Create Goal")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddGoalDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
    
    Scaffold(
        floatingActionButton = {
            FloatingActionButton(onClick = { showAddGoalDialog = true }) {
                Icon(Icons.Default.Add, contentDescription = "Add Goal")
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            SharedHeader(
                title = "Goals & Objectives",
                navigationIcon = Icons.AutoMirrored.Filled.ArrowBack,
                onNavigationClick = onNavigateBack
            )
            // Tabs
            TabRow(selectedTabIndex = selectedTab) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { Text(title) }
                    )
                }
            }
            
            // Summary Cards
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                GoalStatCard(
                    count = goals.count { it.status == "COMPLETED" },
                    label = "Completed",
                    color = Color(0xFF10B981),
                    modifier = Modifier.weight(1f)
                )
                GoalStatCard(
                    count = goals.count { it.status == "IN_PROGRESS" },
                    label = "In Progress",
                    color = Color(0xFF6366F1),
                    modifier = Modifier.weight(1f)
                )
                GoalStatCard(
                    count = goals.count { it.status == "AT_RISK" },
                    label = "At Risk",
                    color = Color(0xFFEF4444),
                    modifier = Modifier.weight(1f)
                )
            }
            
            // Goals List
            LazyColumn(
                modifier = Modifier.padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(goals) { goal ->
                    GoalCard(goal = goal)
                }
                item { Spacer(modifier = Modifier.height(80.dp)) }
            }
        }
    }
}

@Composable
fun GoalStatCard(
    count: Int,
    label: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.1f))
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = count.toString(),
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = color
            )
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun GoalCard(goal: Goal) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = goal.title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = goal.description,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Surface(
                    color = when (goal.priority) {
                        "HIGH" -> Color(0xFFEF4444).copy(alpha = 0.1f)
                        "MEDIUM" -> Color(0xFFF59E0B).copy(alpha = 0.1f)
                        else -> Color(0xFF10B981).copy(alpha = 0.1f)
                    },
                    shape = MaterialTheme.shapes.small
                ) {
                    Text(
                        text = goal.priority,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = when (goal.priority) {
                            "HIGH" -> Color(0xFFEF4444)
                            "MEDIUM" -> Color(0xFFF59E0B)
                            else -> Color(0xFF10B981)
                        }
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Progress Bar
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Progress",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "${(goal.progress * 100).toInt()}%",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                LinearProgressIndicator(
                    progress = { goal.progress },
                    modifier = Modifier.fillMaxWidth(),
                    color = when (goal.status) {
                        "COMPLETED" -> Color(0xFF10B981)
                        "AT_RISK" -> Color(0xFFEF4444)
                        else -> MaterialTheme.colorScheme.primary
                    }
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Person,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = goal.assignedTo,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.CalendarToday,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = goal.dueDate,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}
