package com.ems.android.ui.reviews

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

data class PerformanceReview(
    val id: String,
    val employeeName: String,
    val employeeId: String,
    val reviewPeriod: String,
    val overallRating: Float,
    val status: String,
    val reviewer: String,
    val submittedDate: String?
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReviewsScreen(
    onNavigateBack: () -> Unit
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    var showStartReviewDialog by remember { mutableStateOf(false) }
    val tabs = listOf("Pending", "Completed", "All Reviews")
    
    val reviews = remember {
        listOf(
            PerformanceReview("1", "John Doe", "EMP002", "Q4 2025", 4.2f, "PENDING", "Akshat Jain", null),
            PerformanceReview("2", "Jane Smith", "EMP003", "Q4 2025", 4.5f, "COMPLETED", "Akshat Jain", "Jan 15, 2026"),
            PerformanceReview("3", "Mike Wilson", "EMP004", "Q4 2025", 3.8f, "PENDING", "Jane Smith", null),
            PerformanceReview("4", "Sarah Brown", "EMP005", "Q4 2025", 4.0f, "COMPLETED", "Jane Smith", "Jan 10, 2026"),
            PerformanceReview("5", "Tom Johnson", "EMP006", "Q4 2025", 0f, "NOT_STARTED", "Akshat Jain", null),
        )
    }
    
    // Start Review Dialog
    if (showStartReviewDialog) {
        AlertDialog(
            onDismissRequest = { showStartReviewDialog = false },
            title = { Text("Start Performance Review Cycle") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("This will initiate a new review cycle for all employees.")
                    OutlinedTextField(
                        value = "Q1 2026",
                        onValueChange = { },
                        label = { Text("Review Period") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(onClick = { showStartReviewDialog = false }) {
                    Text("Start Cycle")
                }
            },
            dismissButton = {
                TextButton(onClick = { showStartReviewDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
    
    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { showStartReviewDialog = true },
                icon = { Icon(Icons.Default.RateReview, contentDescription = null) },
                text = { Text("New Cycle") }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            SharedHeader(
                title = "Performance Reviews",
                navigationIcon = Icons.AutoMirrored.Filled.ArrowBack,
                onNavigationClick = onNavigateBack,
                actions = {
                    IconButton(onClick = { showStartReviewDialog = true }) {
                        Icon(Icons.Default.PlayCircle, contentDescription = "Start Review Cycle",
                            tint = MaterialTheme.colorScheme.onSurface)
                    }
                }
            )
            // Summary Stats
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ReviewStatCard(
                    title = "Avg Rating",
                    value = "4.1",
                    icon = Icons.Default.Star,
                    color = Color(0xFFF59E0B),
                    modifier = Modifier.weight(1f)
                )
                ReviewStatCard(
                    title = "Completed",
                    value = "${reviews.count { it.status == "COMPLETED" }}/${reviews.size}",
                    icon = Icons.Default.CheckCircle,
                    color = Color(0xFF10B981),
                    modifier = Modifier.weight(1f)
                )
                ReviewStatCard(
                    title = "Pending",
                    value = reviews.count { it.status == "PENDING" }.toString(),
                    icon = Icons.Default.Pending,
                    color = Color(0xFF6366F1),
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
            
            // Reviews List
            LazyColumn(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                val filteredReviews = when (selectedTab) {
                    0 -> reviews.filter { it.status == "PENDING" || it.status == "NOT_STARTED" }
                    1 -> reviews.filter { it.status == "COMPLETED" }
                    else -> reviews
                }
                
                items(filteredReviews) { review ->
                    ReviewCard(review = review)
                }
                
                item { Spacer(modifier = Modifier.height(80.dp)) }
            }
        }
    }
}

@Composable
fun ReviewStatCard(
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
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = color
            )
            Text(
                text = title,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun ReviewCard(review: PerformanceReview) {
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
                        text = review.employeeName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "${review.employeeId} • ${review.reviewPeriod}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                Surface(
                    color = when (review.status) {
                        "COMPLETED" -> Color(0xFF10B981).copy(alpha = 0.1f)
                        "PENDING" -> Color(0xFFF59E0B).copy(alpha = 0.1f)
                        else -> Color(0xFF9CA3AF).copy(alpha = 0.1f)
                    },
                    shape = MaterialTheme.shapes.small
                ) {
                    Text(
                        text = review.status.replace("_", " "),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = when (review.status) {
                            "COMPLETED" -> Color(0xFF10B981)
                            "PENDING" -> Color(0xFFF59E0B)
                            else -> Color(0xFF9CA3AF)
                        }
                    )
                }
            }
            
            if (review.overallRating > 0) {
                Spacer(modifier = Modifier.height(12.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    repeat(5) { index ->
                        Icon(
                            imageVector = if (index < review.overallRating.toInt()) Icons.Default.Star else Icons.Default.StarBorder,
                            contentDescription = null,
                            tint = Color(0xFFF59E0B),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "${review.overallRating}/5.0",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold
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
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Person,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Reviewer: ${review.reviewer}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                if (review.submittedDate != null) {
                    Text(
                        text = review.submittedDate,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            
            if (review.status == "PENDING" || review.status == "NOT_STARTED") {
                Spacer(modifier = Modifier.height(12.dp))
                Button(
                    onClick = { },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Edit, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(if (review.status == "NOT_STARTED") "Start Review" else "Continue Review")
                }
            }
        }
    }
}
