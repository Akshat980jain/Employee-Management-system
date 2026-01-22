package com.ems.android.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties

/**
 * Error types for better categorization
 */
enum class ErrorType {
    NETWORK,
    AUTH,
    VALIDATION,
    SERVER,
    UNKNOWN
}

/**
 * Error data class for detailed error information
 */
data class AppError(
    val type: ErrorType = ErrorType.UNKNOWN,
    val title: String = "Error",
    val message: String,
    val details: String? = null,
    val statusCode: Int? = null,
    val endpoint: String? = null,
    val timestamp: Long = System.currentTimeMillis()
) {
    fun toDebugString(): String {
        return buildString {
            appendLine("=== Error Report ===")
            appendLine("Type: $type")
            appendLine("Title: $title")
            appendLine("Message: $message")
            statusCode?.let { appendLine("Status Code: $it") }
            endpoint?.let { appendLine("Endpoint: $it") }
            appendLine("Timestamp: $timestamp")
            details?.let {
                appendLine("\n--- Details ---")
                appendLine(it)
            }
        }
    }
}

/**
 * A detailed error dialog for development that shows full error information
 */
@Composable
fun ErrorDialog(
    error: AppError,
    onDismiss: () -> Unit,
    onRetry: (() -> Unit)? = null
) {
    val clipboardManager = LocalClipboardManager.current
    var showDetails by remember { mutableStateOf(false) }
    
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .padding(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.95f)
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
            ) {
                // Header with icon
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(
                        imageVector = when (error.type) {
                            ErrorType.NETWORK -> Icons.Default.WifiOff
                            ErrorType.AUTH -> Icons.Default.Lock
                            ErrorType.VALIDATION -> Icons.Default.Warning
                            ErrorType.SERVER -> Icons.Default.Cloud
                            ErrorType.UNKNOWN -> Icons.Default.Error
                        },
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.error,
                        modifier = Modifier.size(32.dp)
                    )
                    
                    Column {
                        Text(
                            text = error.title,
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                        error.statusCode?.let { code ->
                            Text(
                                text = "Status: $code",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.error
                            )
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Main error message
                Text(
                    text = error.message,
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onErrorContainer
                )
                
                // Endpoint info
                error.endpoint?.let { endpoint ->
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            Icons.Default.Link,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp),
                            tint = MaterialTheme.colorScheme.onErrorContainer.copy(alpha = 0.7f)
                        )
                        Text(
                            text = endpoint,
                            style = MaterialTheme.typography.labelSmall,
                            fontFamily = FontFamily.Monospace,
                            color = MaterialTheme.colorScheme.onErrorContainer.copy(alpha = 0.7f)
                        )
                    }
                }
                
                // Error details (expandable)
                if (!error.details.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    TextButton(
                        onClick = { showDetails = !showDetails },
                        colors = ButtonDefaults.textButtonColors(
                            contentColor = MaterialTheme.colorScheme.error
                        )
                    ) {
                        Icon(
                            if (showDetails) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(if (showDetails) "Hide Details" else "Show Details")
                    }
                    
                    if (showDetails) {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.5f)
                            )
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .heightIn(max = 200.dp)
                                    .verticalScroll(rememberScrollState())
                                    .padding(12.dp)
                            ) {
                                Text(
                                    text = error.details,
                                    style = MaterialTheme.typography.bodySmall,
                                    fontFamily = FontFamily.Monospace,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(20.dp))
                
                // Action buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Copy button
                    OutlinedButton(
                        onClick = {
                            clipboardManager.setText(AnnotatedString(error.toDebugString()))
                        },
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = MaterialTheme.colorScheme.error
                        )
                    ) {
                        Icon(
                            Icons.Default.ContentCopy,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Copy")
                    }
                    
                    Spacer(modifier = Modifier.weight(1f))
                    
                    // Retry button
                    if (onRetry != null) {
                        OutlinedButton(
                            onClick = {
                                onDismiss()
                                onRetry()
                            },
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = MaterialTheme.colorScheme.primary
                            )
                        ) {
                            Icon(
                                Icons.Default.Refresh,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Retry")
                        }
                    }
                    
                    // Dismiss button
                    Button(
                        onClick = onDismiss,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.error
                        )
                    ) {
                        Text("Dismiss")
                    }
                }
            }
        }
    }
}

/**
 * Simple snackbar-style error banner for less critical errors
 */
@Composable
fun ErrorBanner(
    message: String,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.errorContainer
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                Icons.Default.Error,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.error,
                modifier = Modifier.size(20.dp)
            )
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onErrorContainer,
                modifier = Modifier.weight(1f)
            )
            IconButton(onClick = onDismiss) {
                Icon(
                    Icons.Default.Close,
                    contentDescription = "Dismiss",
                    tint = MaterialTheme.colorScheme.onErrorContainer
                )
            }
        }
    }
}

/**
 * Helper function to create AppError from API response
 */
fun createApiError(
    statusCode: Int?,
    message: String?,
    endpoint: String? = null,
    rawResponse: String? = null
): AppError {
    val type = when (statusCode) {
        null -> ErrorType.NETWORK
        401, 403 -> ErrorType.AUTH
        400, 422 -> ErrorType.VALIDATION
        in 500..599 -> ErrorType.SERVER
        else -> ErrorType.UNKNOWN
    }
    
    val title = when (type) {
        ErrorType.NETWORK -> "Network Error"
        ErrorType.AUTH -> "Authentication Error"
        ErrorType.VALIDATION -> "Validation Error"
        ErrorType.SERVER -> "Server Error"
        ErrorType.UNKNOWN -> "Error"
    }
    
    return AppError(
        type = type,
        title = title,
        message = message ?: "An unexpected error occurred",
        details = rawResponse,
        statusCode = statusCode,
        endpoint = endpoint
    )
}

/**
 * Helper function to create AppError from exception
 */
fun createExceptionError(
    exception: Throwable,
    endpoint: String? = null
): AppError {
    val type = when (exception) {
        is java.net.UnknownHostException,
        is java.net.SocketTimeoutException,
        is java.io.IOException -> ErrorType.NETWORK
        else -> ErrorType.UNKNOWN
    }
    
    return AppError(
        type = type,
        title = if (type == ErrorType.NETWORK) "Network Error" else "Error",
        message = exception.localizedMessage ?: exception.message ?: "An unexpected error occurred",
        details = exception.stackTraceToString(),
        endpoint = endpoint
    )
}
