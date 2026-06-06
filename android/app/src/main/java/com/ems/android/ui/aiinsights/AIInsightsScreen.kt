package com.ems.android.ui.aiinsights

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.ems.android.ui.components.SharedHeader

data class InsightCard(
    val title: String,
    val description: String,
    val value: String,
    val trend: String,
    val isPositive: Boolean,
    val icon: ImageVector
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AIInsightsScreen(
    onNavigateBack: () -> Unit
) {
    var selectedTimeRange by remember { mutableStateOf("Last 30 Days") }
    
    val insights = remember {
        listOf(
            InsightCard(
                "Employee Productivity",
                "Average task completion rate increased",
                "87%",
                "+12%",
                true,
                Icons.AutoMirrored.Filled.TrendingUp
            ),
            InsightCard(
                "Attendance Rate",
                "Overall attendance has improved",
                "94%",
                "+5%",
                true,
                Icons.Default.CheckCircle
            ),
            InsightCard(
                "Turnover Risk",
                "2 employees showing signs of disengagement",
                "2",
                "Medium",
                false,
                Icons.Default.Warning
            ),
            InsightCard(
                "Leave Forecast",
                "Expected leave requests next month",
                "8",
                "Normal",
                true,
                Icons.AutoMirrored.Filled.EventNote
            ),
        )
    }
    
    val recommendations = remember {
        listOf(
            "Schedule 1-on-1 meetings with employees showing low engagement",
            "Consider team building activities to improve collaboration",
            "Review workload distribution in Development team",
            "Recognize top performers from last quarter",
        )
    }
    
    Scaffold { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            SharedHeader(
                title = "AI Insights",
                navigationIcon = Icons.AutoMirrored.Filled.ArrowBack,
                onNavigationClick = onNavigateBack,
                actions = {
                    IconButton(onClick = { }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh",
                            tint = MaterialTheme.colorScheme.onSurface)
                    }
                }
            )
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
            // Header with Time Range Selector
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Analytics Dashboard",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "AI-powered insights for your organization",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("Last 7 Days", "Last 30 Days", "Last Quarter").forEach { range ->
                        FilterChip(
                            selected = selectedTimeRange == range,
                            onClick = { selectedTimeRange = range },
                            label = { Text(range) }
                        )
                    }
                }
            }
            
            // AI Status Card
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
                            Icons.Default.AutoAwesome,
                            contentDescription = null,
                            tint = Color(0xFF6366F1),
                            modifier = Modifier.size(40.dp)
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                        Column {
                            Text(
                                text = "AI Analysis Complete",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = "Last updated: Just now",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
            
            // Key Metrics
            item {
                Text(
                    text = "Key Metrics",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }
            
            // Insight Cards Grid
            item {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    insights.chunked(2).forEach { rowInsights ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            rowInsights.forEach { insight ->
                                InsightMetricCard(
                                    insight = insight,
                                    modifier = Modifier.weight(1f)
                                )
                            }
                            if (rowInsights.size == 1) {
                                Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }
            }
            
            // Predictive Analytics
            item {
                Text(
                    text = "Predictive Analytics",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        PredictionRow("Hiring needs next quarter", "3-5 new hires", Icons.Default.PersonAdd)
                        HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))
                        PredictionRow("Peak leave period", "March 2026", Icons.Default.DateRange)
                        HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))
                        PredictionRow("Training requirement", "15 employees", Icons.Default.School)
                    }
                }
            }
            
            // Recommendations
            item {
                Text(
                    text = "AI Recommendations",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        recommendations.forEachIndexed { index, recommendation ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.Top
                            ) {
                                Icon(
                                    Icons.Default.Lightbulb,
                                    contentDescription = null,
                                    tint = Color(0xFFF59E0B),
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = recommendation,
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            }
                            if (index < recommendations.size - 1) {
                                Spacer(modifier = Modifier.height(12.dp))
                            }
                        }
                    }
                }
            }
            
            item { Spacer(modifier = Modifier.height(16.dp)) }
        }  // end LazyColumn
        }  // end Column
    }  // end Scaffold
}

@Composable
fun InsightMetricCard(
    insight: InsightCard,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    insight.icon,
                    contentDescription = null,
                    tint = if (insight.isPositive) Color(0xFF10B981) else Color(0xFFF59E0B),
                    modifier = Modifier.size(24.dp)
                )
                Surface(
                    color = if (insight.isPositive) Color(0xFF10B981).copy(alpha = 0.1f) 
                           else Color(0xFFF59E0B).copy(alpha = 0.1f),
                    shape = MaterialTheme.shapes.small
                ) {
                    Text(
                        text = insight.trend,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = if (insight.isPositive) Color(0xFF10B981) else Color(0xFFF59E0B)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = insight.value,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            
            Text(
                text = insight.title,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium
            )
            
            Text(
                text = insight.description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun PredictionRow(
    label: String,
    value: String,
    icon: ImageVector
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                icon,
                contentDescription = null,
                tint = Color(0xFF6366F1),
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.bodyMedium
            )
        }
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.primary
        )
    }
}
