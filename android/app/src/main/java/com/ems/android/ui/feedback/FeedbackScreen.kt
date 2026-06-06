package com.ems.android.ui.feedback

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

data class Feedback(
    val id: String,
    val type: String,
    val subject: String,
    val message: String,
    val submittedBy: String,
    val submittedAt: String,
    val status: String,
    val isAnonymous: Boolean
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedbackScreen(
    onNavigateBack: () -> Unit
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    var showSubmitDialog by remember { mutableStateOf(false) }
    val tabs = listOf("All Feedback", "Suggestions", "Concerns")
    
    val feedbackList = remember {
        listOf(
            Feedback("1", "SUGGESTION", "Flexible Work Hours", "Would appreciate more flexibility in work hours for better work-life balance.", "Anonymous", "Jan 20, 2026", "NEW", true),
            Feedback("2", "CONCERN", "Office Temperature", "The AC in the main office area is too cold. Can we adjust it?", "John Doe", "Jan 19, 2026", "IN_REVIEW", false),
            Feedback("3", "SUGGESTION", "Team Building Activities", "Monthly team outings would boost morale and collaboration.", "Jane Smith", "Jan 18, 2026", "IMPLEMENTED", false),
            Feedback("4", "APPRECIATION", "Great Leadership", "Want to appreciate the leadership team for the transparent communication.", "Anonymous", "Jan 17, 2026", "ACKNOWLEDGED", true),
            Feedback("5", "CONCERN", "Parking Space", "Need more parking spaces for employees.", "Mike Wilson", "Jan 15, 2026", "IN_REVIEW", false),
        )
    }
    
    // Submit Feedback Dialog
    if (showSubmitDialog) {
        var feedbackType by remember { mutableStateOf("SUGGESTION") }
        var subject by remember { mutableStateOf("") }
        var message by remember { mutableStateOf("") }
        var isAnonymous by remember { mutableStateOf(false) }
        
        AlertDialog(
            onDismissRequest = { showSubmitDialog = false },
            title = { Text("Submit Feedback") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    // Feedback Type Selector
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf("SUGGESTION", "CONCERN", "APPRECIATION").forEach { type ->
                            FilterChip(
                                selected = feedbackType == type,
                                onClick = { feedbackType = type },
                                label = { Text(type.lowercase().replaceFirstChar { it.uppercase() }) }
                            )
                        }
                    }
                    
                    OutlinedTextField(
                        value = subject,
                        onValueChange = { subject = it },
                        label = { Text("Subject") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    OutlinedTextField(
                        value = message,
                        onValueChange = { message = it },
                        label = { Text("Your Feedback") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 4
                    )
                    
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = isAnonymous,
                            onCheckedChange = { isAnonymous = it }
                        )
                        Text("Submit anonymously")
                    }
                }
            },
            confirmButton = {
                Button(onClick = { showSubmitDialog = false }) {
                    Text("Submit")
                }
            },
            dismissButton = {
                TextButton(onClick = { showSubmitDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
    
    Scaffold(
        floatingActionButton = {
            FloatingActionButton(onClick = { showSubmitDialog = true }) {
                Icon(Icons.Default.Add, contentDescription = "Submit Feedback")
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            SharedHeader(
                title = "Feedback",
                navigationIcon = Icons.AutoMirrored.Filled.ArrowBack,
                onNavigationClick = onNavigateBack
            )
            // Stats Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FeedbackStatCard(
                    count = feedbackList.size,
                    label = "Total",
                    color = Color(0xFF6366F1),
                    modifier = Modifier.weight(1f)
                )
                FeedbackStatCard(
                    count = feedbackList.count { it.status == "NEW" },
                    label = "New",
                    color = Color(0xFF10B981),
                    modifier = Modifier.weight(1f)
                )
                FeedbackStatCard(
                    count = feedbackList.count { it.status == "IN_REVIEW" },
                    label = "In Review",
                    color = Color(0xFFF59E0B),
                    modifier = Modifier.weight(1f)
                )
            }
            
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
            
            // Feedback List
            LazyColumn(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                val filteredFeedback = when (selectedTab) {
                    1 -> feedbackList.filter { it.type == "SUGGESTION" }
                    2 -> feedbackList.filter { it.type == "CONCERN" }
                    else -> feedbackList
                }
                
                items(filteredFeedback) { feedback ->
                    FeedbackCard(feedback = feedback)
                }
                
                item { Spacer(modifier = Modifier.height(80.dp)) }
            }
        }
    }
}

@Composable
fun FeedbackStatCard(
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
fun FeedbackCard(feedback: Feedback) {
    val typeColor = when (feedback.type) {
        "SUGGESTION" -> Color(0xFF6366F1)
        "CONCERN" -> Color(0xFFEF4444)
        "APPRECIATION" -> Color(0xFF10B981)
        else -> Color(0xFF9CA3AF)
    }
    
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
                Surface(
                    color = typeColor.copy(alpha = 0.1f),
                    shape = MaterialTheme.shapes.small
                ) {
                    Text(
                        text = feedback.type,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = typeColor
                    )
                }
                
                Surface(
                    color = when (feedback.status) {
                        "NEW" -> Color(0xFF10B981).copy(alpha = 0.1f)
                        "IN_REVIEW" -> Color(0xFFF59E0B).copy(alpha = 0.1f)
                        "IMPLEMENTED" -> Color(0xFF6366F1).copy(alpha = 0.1f)
                        else -> Color(0xFF9CA3AF).copy(alpha = 0.1f)
                    },
                    shape = MaterialTheme.shapes.small
                ) {
                    Text(
                        text = feedback.status.replace("_", " "),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = when (feedback.status) {
                            "NEW" -> Color(0xFF10B981)
                            "IN_REVIEW" -> Color(0xFFF59E0B)
                            "IMPLEMENTED" -> Color(0xFF6366F1)
                            else -> Color(0xFF9CA3AF)
                        }
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = feedback.subject,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = feedback.message,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            HorizontalDivider()
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        if (feedback.isAnonymous) Icons.Default.VisibilityOff else Icons.Default.Person,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = feedback.submittedBy,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Text(
                    text = feedback.submittedAt,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
