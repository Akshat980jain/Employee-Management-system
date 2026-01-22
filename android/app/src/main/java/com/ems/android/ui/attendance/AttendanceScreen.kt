package com.ems.android.ui.attendance

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.ems.android.data.models.AttendanceCorrection
import com.ems.android.data.models.AttendanceRecord
import com.ems.android.ui.components.ClockInOutCard
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AttendanceScreen(
    viewModel: AttendanceViewModel = hiltViewModel()
) {
    val attendanceStatus by viewModel.attendanceStatus.collectAsState()
    val attendanceHistory by viewModel.attendanceHistory.collectAsState()
    val corrections by viewModel.corrections.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    var selectedTab by remember { mutableIntStateOf(0) }
    var showCorrectionDialog by remember { mutableStateOf(false) }
    
    LaunchedEffect(Unit) {
        viewModel.loadAttendanceData()
    }
    
    // Correction Request Dialog
    if (showCorrectionDialog) {
        CorrectionRequestDialog(
            onDismiss = { showCorrectionDialog = false },
            onSubmit = { date, type, checkIn, checkOut, reason ->
                viewModel.requestCorrection(date, type, checkIn, checkOut, reason)
                showCorrectionDialog = false
            }
        )
    }
    
    Scaffold(
        floatingActionButton = {
            if (selectedTab == 2) {
                FloatingActionButton(
                    onClick = { showCorrectionDialog = true }
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Request Correction")
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            TopAppBar(
                title = { Text("Attendance") },
                actions = {
                    IconButton(onClick = { viewModel.loadAttendanceData() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )
            
            if (isLoading) {
                LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
            }
            
            // Tabs
            TabRow(selectedTabIndex = selectedTab) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("Today") }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("Calendar") }
                )
                Tab(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    text = { Text("Corrections") }
                )
            }
            
            when (selectedTab) {
                0 -> TodayTab(
                    attendanceStatus = attendanceStatus,
                    onClockIn = { viewModel.clockIn() },
                    onClockOut = { viewModel.clockOut() }
                )
                1 -> CalendarTab(attendanceHistory = attendanceHistory)
                2 -> CorrectionsTab(corrections = corrections)
            }
        }
    }
}

@Composable
fun TodayTab(
    attendanceStatus: com.ems.android.data.models.AttendanceStatusResponse?,
    onClockIn: () -> Unit,
    onClockOut: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Clock In/Out Card
        ClockInOutCard(
            isClockedIn = attendanceStatus?.isClockedIn == true,
            currentSession = attendanceStatus?.currentSession,
            onClockIn = onClockIn,
            onClockOut = onClockOut
        )
        
        // Today's Sessions
        attendanceStatus?.todaySessions?.let { sessions ->
            if (sessions.isNotEmpty()) {
                Text(
                    text = "Today's Sessions",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    )
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        sessions.forEachIndexed { index, session ->
                            SessionRow(
                                checkIn = session.checkIn,
                                checkOut = session.checkOut,
                                isActive = session.checkOut == null
                            )
                            if (index < sessions.size - 1) {
                                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                            }
                        }
                    }
                }
            }
        }
        
        // Summary Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Text(
                    text = "Summary",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Total Sessions",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        text = "${attendanceStatus?.todaySessions?.size ?: 0}",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}

@Composable
fun CalendarTab(
    attendanceHistory: List<AttendanceRecord>
) {
    var currentMonth by remember { mutableStateOf(YearMonth.now()) }
    
    val recordsByDate = remember(attendanceHistory) {
        attendanceHistory.associateBy { it.date.take(10) }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Month Navigation
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { currentMonth = currentMonth.minusMonths(1) }) {
                Icon(Icons.Default.ChevronLeft, contentDescription = "Previous Month")
            }
            Text(
                text = currentMonth.format(DateTimeFormatter.ofPattern("MMMM yyyy")),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            IconButton(onClick = { currentMonth = currentMonth.plusMonths(1) }) {
                Icon(Icons.Default.ChevronRight, contentDescription = "Next Month")
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Day Headers
        Row(modifier = Modifier.fillMaxWidth()) {
            listOf("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat").forEach { day ->
                Text(
                    text = day,
                    modifier = Modifier.weight(1f),
                    textAlign = TextAlign.Center,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        // Calendar Grid
        val firstDayOfMonth = currentMonth.atDay(1)
        val daysInMonth = currentMonth.lengthOfMonth()
        val startDayOfWeek = firstDayOfMonth.dayOfWeek.value % 7 // Sunday = 0
        
        val days = buildList {
            repeat(startDayOfWeek) { add(null) }
            for (day in 1..daysInMonth) {
                add(currentMonth.atDay(day))
            }
            while (size % 7 != 0) { add(null) }
        }
        
        LazyVerticalGrid(
            columns = GridCells.Fixed(7),
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(4.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            items(days) { date ->
                CalendarDayCell(
                    date = date,
                    record = date?.let { recordsByDate[it.format(DateTimeFormatter.ISO_LOCAL_DATE)] },
                    isToday = date == LocalDate.now()
                )
            }
        }
        
        // Legend
        Spacer(modifier = Modifier.height(16.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            LegendItem(color = MaterialTheme.colorScheme.primary, label = "Present")
            LegendItem(color = MaterialTheme.colorScheme.tertiary, label = "Late")
            LegendItem(color = MaterialTheme.colorScheme.error, label = "Absent")
        }
    }
}

@Composable
fun CalendarDayCell(
    date: LocalDate?,
    record: AttendanceRecord?,
    isToday: Boolean
) {
    val backgroundColor = when {
        date == null -> MaterialTheme.colorScheme.surface
        record?.status?.uppercase() == "PRESENT" -> MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
        record?.status?.uppercase() == "LATE" -> MaterialTheme.colorScheme.tertiary.copy(alpha = 0.2f)
        record?.status?.uppercase() == "ABSENT" -> MaterialTheme.colorScheme.error.copy(alpha = 0.2f)
        else -> MaterialTheme.colorScheme.surface
    }
    
    Box(
        modifier = Modifier
            .aspectRatio(1f)
            .clip(MaterialTheme.shapes.small)
            .background(backgroundColor)
            .then(
                if (isToday) Modifier.border(
                    2.dp,
                    MaterialTheme.colorScheme.primary,
                    MaterialTheme.shapes.small
                ) else Modifier
            ),
        contentAlignment = Alignment.Center
    ) {
        if (date != null) {
            Text(
                text = date.dayOfMonth.toString(),
                style = MaterialTheme.typography.bodyMedium,
                color = if (isToday) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
            )
        }
    }
}

@Composable
fun LegendItem(color: androidx.compose.ui.graphics.Color, label: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(12.dp)
                .background(color.copy(alpha = 0.3f), MaterialTheme.shapes.small)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
fun CorrectionsTab(corrections: List<AttendanceCorrection>) {
    if (corrections.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    Icons.Default.EditNote,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "No correction requests",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Tap + to request a correction",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                )
            }
        }
    } else {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            corrections.forEach { correction ->
                CorrectionCard(correction = correction)
            }
        }
    }
}

@Composable
fun CorrectionCard(correction: AttendanceCorrection) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
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
                Text(
                    text = correction.date.take(10),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Medium
                )
                AssistChip(
                    onClick = { },
                    label = { Text(correction.status) },
                    colors = AssistChipDefaults.assistChipColors(
                        containerColor = when (correction.status.uppercase()) {
                            "APPROVED" -> MaterialTheme.colorScheme.primaryContainer
                            "REJECTED" -> MaterialTheme.colorScheme.errorContainer
                            else -> MaterialTheme.colorScheme.surfaceVariant
                        }
                    )
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Type: ${correction.type}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = "Reason: ${correction.reason}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
            )
        }
    }
}

@Composable
fun SessionRow(
    checkIn: String,
    checkOut: String?,
    isActive: Boolean
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.Login,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = formatTime(checkIn),
                    style = MaterialTheme.typography.bodyMedium
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.Logout,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = if (isActive) MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.error
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = checkOut?.let { formatTime(it) } ?: "Active",
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (isActive) MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.onSurface
                )
            }
        }
        
        if (isActive) {
            AssistChip(
                onClick = { },
                label = { Text("Active") },
                colors = AssistChipDefaults.assistChipColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CorrectionRequestDialog(
    onDismiss: () -> Unit,
    onSubmit: (date: String, type: String, checkIn: String?, checkOut: String?, reason: String) -> Unit
) {
    var date by remember { mutableStateOf("") }
    var type by remember { mutableStateOf("MISSING_CHECKOUT") }
    var checkIn by remember { mutableStateOf("") }
    var checkOut by remember { mutableStateOf("") }
    var reason by remember { mutableStateOf("") }
    var typeExpanded by remember { mutableStateOf(false) }
    
    val types = listOf(
        "MISSING_CHECKOUT" to "Missing Check-out",
        "MISSING_CHECKIN" to "Missing Check-in",
        "WRONG_TIME" to "Wrong Time",
        "OTHER" to "Other"
    )
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Request Correction") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                OutlinedTextField(
                    value = date,
                    onValueChange = { date = it },
                    label = { Text("Date (YYYY-MM-DD)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                
                ExposedDropdownMenuBox(
                    expanded = typeExpanded,
                    onExpandedChange = { typeExpanded = it }
                ) {
                    OutlinedTextField(
                        value = types.find { it.first == type }?.second ?: "",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Correction Type") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = typeExpanded) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor()
                    )
                    ExposedDropdownMenu(
                        expanded = typeExpanded,
                        onDismissRequest = { typeExpanded = false }
                    ) {
                        types.forEach { (value, label) ->
                            DropdownMenuItem(
                                text = { Text(label) },
                                onClick = {
                                    type = value
                                    typeExpanded = false
                                }
                            )
                        }
                    }
                }
                
                OutlinedTextField(
                    value = checkIn,
                    onValueChange = { checkIn = it },
                    label = { Text("Proposed Check-in (HH:MM)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                
                OutlinedTextField(
                    value = checkOut,
                    onValueChange = { checkOut = it },
                    label = { Text("Proposed Check-out (HH:MM)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                
                OutlinedTextField(
                    value = reason,
                    onValueChange = { reason = it },
                    label = { Text("Reason") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onSubmit(
                        date,
                        type,
                        checkIn.ifBlank { null },
                        checkOut.ifBlank { null },
                        reason
                    )
                },
                enabled = date.isNotBlank() && reason.isNotBlank()
            ) {
                Text("Submit")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

private fun formatTime(isoString: String): String {
    return try {
        val timePart = isoString.substringAfter("T").substringBefore(".")
        val parts = timePart.split(":")
        if (parts.size >= 2) {
            val hour = parts[0].toInt()
            val minute = parts[1]
            val period = if (hour >= 12) "PM" else "AM"
            val displayHour = if (hour > 12) hour - 12 else if (hour == 0) 12 else hour
            "$displayHour:$minute $period"
        } else {
            isoString
        }
    } catch (e: Exception) {
        isoString
    }
}
