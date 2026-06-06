package com.ems.android.ui.chatbot

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class ChatMessage(
    val id: String,
    val content: String,
    val isUser: Boolean,
    val timestamp: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HRChatbotScreen(
    onNavigateBack: () -> Unit
) {
    var messageText by remember { mutableStateOf("") }
    var isTyping by remember { mutableStateOf(false) }
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    
    val messages = remember {
        mutableStateListOf(
            ChatMessage("1", "Hello! I'm your HR Assistant. How can I help you today?", false, "10:00 AM"),
        )
    }
    
    val suggestions = listOf(
        "How many leave days do I have?",
        "What's the attendance policy?",
        "How to apply for reimbursement?",
        "Show my payslip"
    )
    
    fun sendMessage(text: String) {
        if (text.isBlank()) return
        
        messages.add(ChatMessage(
            id = System.currentTimeMillis().toString(),
            content = text,
            isUser = true,
            timestamp = "Now"
        ))
        messageText = ""
        
        scope.launch {
            listState.animateScrollToItem(messages.size - 1)
            isTyping = true
            delay(1500) // Simulate AI thinking
            
            val response = when {
                text.contains("leave", ignoreCase = true) -> 
                    "Based on your records, you have:\n• Annual Leave: 12 days remaining\n• Sick Leave: 5 days remaining\n• Casual Leave: 3 days remaining\n\nWould you like to apply for leave?"
                text.contains("attendance", ignoreCase = true) ->
                    "Here's a summary of your attendance this month:\n• Present: 18 days\n• Late: 2 days\n• On Leave: 1 day\n\nYour attendance rate is 95%. Keep up the good work!"
                text.contains("payslip", ignoreCase = true) || text.contains("salary", ignoreCase = true) ->
                    "Your latest payslip for January 2026:\n• Basic: ₹50,000\n• Allowances: ₹15,000\n• Deductions: ₹5,000\n• Net Salary: ₹60,000\n\nWould you like me to email the full payslip?"
                text.contains("reimbursement", ignoreCase = true) ->
                    "To apply for reimbursement:\n1. Go to 'Expenses' section\n2. Click 'New Claim'\n3. Upload receipts\n4. Submit for approval\n\nThe typical processing time is 3-5 business days."
                text.contains("holiday", ignoreCase = true) ->
                    "Upcoming holidays:\n• Jan 26 - Republic Day\n• Mar 21 - Holi\n• Apr 14 - Ambedkar Jayanti\n\nWould you like the full holiday calendar?"
                else ->
                    "I understand you're asking about \"$text\". Let me help you with that.\n\nFor specific HR queries, you can also:\n• Check the Employee Handbook\n• Contact HR at hr@company.com\n• Visit the Help Center\n\nIs there anything else I can help with?"
            }
            
            isTyping = false
            messages.add(ChatMessage(
                id = System.currentTimeMillis().toString(),
                content = response,
                isUser = false,
                timestamp = "Now"
            ))
            listState.animateScrollToItem(messages.size - 1)
        }
    }
    
    Scaffold { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Custom SharedHeader-style row preserving bot avatar + status
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(horizontal = 8.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onNavigateBack,
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        modifier = Modifier.size(22.dp),
                        tint = MaterialTheme.colorScheme.onSurface
                    )
                }
                Spacer(modifier = Modifier.width(4.dp))
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF6366F1)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.SmartToy,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "HR Assistant",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = if (isTyping) "Typing..." else "Online",
                        style = MaterialTheme.typography.bodySmall,
                        color = if (isTyping) Color(0xFFF59E0B) else Color(0xFF10B981)
                    )
                }
                IconButton(onClick = {
                    messages.clear()
                    messages.add(ChatMessage("1", "Hello! I'm your HR Assistant. How can I help you today?", false, "Now"))
                }) {
                    Icon(
                        Icons.Default.Refresh,
                        contentDescription = "New Chat",
                        tint = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
            // Messages
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(vertical = 16.dp)
            ) {
                items(messages) { message ->
                    ChatBubble(message = message)
                }
                
                if (isTyping) {
                    item {
                        Row {
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF6366F1)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    Icons.Default.SmartToy,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Surface(
                                color = MaterialTheme.colorScheme.surfaceVariant,
                                shape = RoundedCornerShape(16.dp, 16.dp, 16.dp, 4.dp)
                            ) {
                                Text(
                                    text = "Typing...",
                                    modifier = Modifier.padding(12.dp),
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
                
                // Quick Suggestions
                if (messages.size == 1) {
                    item {
                        Text(
                            text = "Quick Questions",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(top = 16.dp)
                        )
                    }
                    item {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            suggestions.forEach { suggestion ->
                                SuggestionChip(
                                    onClick = { sendMessage(suggestion) },
                                    label = { Text(suggestion) },
                                    icon = {
                                        Icon(
                                            Icons.Default.QuestionAnswer,
                                            contentDescription = null,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                )
                            }
                        }
                    }
                }
            }
            
            // Input Area
            Surface(
                color = MaterialTheme.colorScheme.surface,
                tonalElevation = 3.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = messageText,
                        onValueChange = { messageText = it },
                        placeholder = { Text("Type your message...") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(24.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = MaterialTheme.colorScheme.primary,
                            unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
                        ),
                        maxLines = 3
                    )
                    
                    Spacer(modifier = Modifier.width(8.dp))
                    
                    FloatingActionButton(
                        onClick = { sendMessage(messageText) },
                        containerColor = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(48.dp)
                    ) {
                        Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Send")
                    }
                }
            }
        }
    }
}

@Composable
fun ChatBubble(message: ChatMessage) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (message.isUser) Arrangement.End else Arrangement.Start
    ) {
        if (!message.isUser) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF6366F1)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.Default.SmartToy,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(18.dp)
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
        }
        
        Surface(
            color = if (message.isUser) MaterialTheme.colorScheme.primary 
                   else MaterialTheme.colorScheme.surfaceVariant,
            shape = if (message.isUser) 
                RoundedCornerShape(16.dp, 16.dp, 4.dp, 16.dp)
            else 
                RoundedCornerShape(16.dp, 16.dp, 16.dp, 4.dp),
            modifier = Modifier.widthIn(max = 300.dp)
        ) {
            Text(
                text = message.content,
                modifier = Modifier.padding(12.dp),
                style = MaterialTheme.typography.bodyMedium,
                color = if (message.isUser) MaterialTheme.colorScheme.onPrimary 
                       else MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        
        if (message.isUser) {
            Spacer(modifier = Modifier.width(8.dp))
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.Default.Person,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}
