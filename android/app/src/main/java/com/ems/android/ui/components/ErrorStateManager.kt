package com.ems.android.ui.components

import androidx.compose.runtime.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Global error state manager for displaying errors throughout the app
 */
@Singleton
class ErrorStateManager @Inject constructor() {
    
    private val _currentError = MutableStateFlow<AppError?>(null)
    val currentError: StateFlow<AppError?> = _currentError.asStateFlow()
    
    private val _retryAction = MutableStateFlow<(() -> Unit)?>(null)
    val retryAction: StateFlow<(() -> Unit)?> = _retryAction.asStateFlow()
    
    /**
     * Show an error dialog
     */
    fun showError(error: AppError, onRetry: (() -> Unit)? = null) {
        _currentError.value = error
        _retryAction.value = onRetry
    }
    
    /**
     * Show error from API response
     */
    fun showApiError(
        statusCode: Int?,
        message: String?,
        endpoint: String? = null,
        rawResponse: String? = null,
        onRetry: (() -> Unit)? = null
    ) {
        val error = createApiError(statusCode, message, endpoint, rawResponse)
        showError(error, onRetry)
    }
    
    /**
     * Show error from exception
     */
    fun showExceptionError(
        exception: Throwable,
        endpoint: String? = null,
        onRetry: (() -> Unit)? = null
    ) {
        val error = createExceptionError(exception, endpoint)
        showError(error, onRetry)
    }
    
    /**
     * Clear the current error
     */
    fun clearError() {
        _currentError.value = null
        _retryAction.value = null
    }
}

/**
 * Composable that provides global error handling
 */
@Composable
fun GlobalErrorHandler(
    errorStateManager: ErrorStateManager,
    content: @Composable () -> Unit
) {
    val currentError by errorStateManager.currentError.collectAsState()
    val retryAction by errorStateManager.retryAction.collectAsState()
    
    content()
    
    currentError?.let { error ->
        ErrorDialog(
            error = error,
            onDismiss = { errorStateManager.clearError() },
            onRetry = retryAction
        )
    }
}
