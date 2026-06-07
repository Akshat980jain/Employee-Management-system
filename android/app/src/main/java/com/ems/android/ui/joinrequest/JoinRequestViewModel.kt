package com.ems.android.ui.joinrequest

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ems.android.data.api.ApiService
import com.ems.android.data.models.JoinRequest
import com.ems.android.data.models.RejectJoinRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class JoinRequestViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {
    
    private val _pendingRequests = MutableStateFlow<List<JoinRequest>>(emptyList())
    val pendingRequests: StateFlow<List<JoinRequest>> = _pendingRequests.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _actionResult = MutableStateFlow<String?>(null)
    val actionResult: StateFlow<String?> = _actionResult.asStateFlow()
    
    init {
        loadPendingRequests()
    }
    
    fun loadPendingRequests() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = apiService.getPendingJoinRequests()
                if (response.isSuccessful && response.body() != null) {
                    _pendingRequests.value = response.body()!!.requests
                }
            } catch (_: Exception) {}
            _isLoading.value = false
        }
    }
    
    fun approveRequest(requestId: String) {
        viewModelScope.launch {
            try {
                val response = apiService.approveJoinRequest(requestId)
                if (response.isSuccessful) {
                    _actionResult.value = "Request approved"
                    _pendingRequests.update { list ->
                        list.filter { it.id != requestId }
                    }
                }
            } catch (_: Exception) {
                _actionResult.value = "Failed to approve"
            }
        }
    }
    
    fun rejectRequest(requestId: String, reason: String? = null) {
        viewModelScope.launch {
            try {
                val response = apiService.rejectJoinRequest(requestId, RejectJoinRequest(reason))
                if (response.isSuccessful) {
                    _actionResult.value = "Request rejected"
                    _pendingRequests.update { list ->
                        list.filter { it.id != requestId }
                    }
                }
            } catch (_: Exception) {
                _actionResult.value = "Failed to reject"
            }
        }
    }
    
    fun clearActionResult() {
        _actionResult.value = null
    }
}
