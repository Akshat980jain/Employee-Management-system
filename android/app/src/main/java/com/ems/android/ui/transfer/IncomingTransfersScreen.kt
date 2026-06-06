package com.ems.android.ui.transfer

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.ems.android.data.models.TransferRequest
import com.ems.android.ui.components.SharedHeader

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IncomingTransfersScreen(
    onNavigateBack: () -> Unit,
    viewModel: TransferViewModel = hiltViewModel()
) {
    val incomingTransfers by viewModel.incomingTransfers.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val actionResult by viewModel.actionResult.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadIncomingTransfers()
    }
    
    LaunchedEffect(actionResult) {
        if (actionResult != null) {
            kotlinx.coroutines.delay(2000)
            viewModel.clearActionResult()
        }
    }
    
    Scaffold { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            SharedHeader(
                title = "Incoming Transfers",
                navigationIcon = Icons.AutoMirrored.Filled.ArrowBack,
                onNavigationClick = onNavigateBack,
                actions = {
                    IconButton(onClick = { viewModel.loadIncomingTransfers() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh",
                            tint = MaterialTheme.colorScheme.onSurface)
                    }
                }
            )
            if (isLoading) {
                LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
            }
            
            if (incomingTransfers.isEmpty() && !isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.SwapHoriz,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            "No incoming transfers",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(incomingTransfers) { transfer ->
                        TransferCard(
                            transfer = transfer,
                            onApprove = { viewModel.approveTransfer(transfer.id) },
                            onReject = { viewModel.rejectTransfer(transfer.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun TransferCard(
    transfer: TransferRequest,
    onApprove: () -> Unit,
    onReject: () -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "${transfer.employee?.firstName ?: ""} ${transfer.employee?.lastName ?: ""}",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = transfer.employee?.email ?: "",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                AssistChip(
                    onClick = { },
                    label = { Text(transfer.status) },
                    colors = AssistChipDefaults.assistChipColors(
                        containerColor = when (transfer.status.uppercase()) {
                            "APPROVED" -> MaterialTheme.colorScheme.primaryContainer
                            "REJECTED" -> MaterialTheme.colorScheme.errorContainer
                            else -> MaterialTheme.colorScheme.tertiaryContainer
                        }
                    )
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // From Organization
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.Business,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "From: ${transfer.fromOrganization?.name ?: "Unknown"}",
                    style = MaterialTheme.typography.bodyMedium
                )
            }
            
            transfer.message?.let { msg ->
                Spacer(modifier = Modifier.height(8.dp))
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                    )
                ) {
                    Text(
                        text = msg,
                        modifier = Modifier.padding(12.dp),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            
            if (transfer.status.uppercase() == "PENDING") {
                Spacer(modifier = Modifier.height(12.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onReject,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = MaterialTheme.colorScheme.error
                        )
                    ) {
                        Icon(Icons.Default.Close, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Reject")
                    }
                    
                    Button(
                        onClick = onApprove,
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Approve")
                    }
                }
            }
        }
    }
}
