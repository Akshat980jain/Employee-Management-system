package com.ems.android.ui.leave

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ems.android.data.api.ApiService
import com.ems.android.data.local.TokenManager
import com.ems.android.data.models.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LeaveViewModel @Inject constructor(
    private val apiService: ApiService,
    private val tokenManager: TokenManager
) : ViewModel() {
    
    private val _leaveTypes = MutableStateFlow<List<LeaveType>>(emptyList())
    val leaveTypes: StateFlow<List<LeaveType>> = _leaveTypes.asStateFlow()
    
    private val _leaveBalances = MutableStateFlow<List<LeaveBalance>>(emptyList())
    val leaveBalances: StateFlow<List<LeaveBalance>> = _leaveBalances.asStateFlow()
    
    private val _myRequests = MutableStateFlow<List<LeaveRequest>>(emptyList())
    val myRequests: StateFlow<List<LeaveRequest>> = _myRequests.asStateFlow()
    
    private val _pendingRequests = MutableStateFlow<List<LeaveRequest>>(emptyList())
    val pendingRequests: StateFlow<List<LeaveRequest>> = _pendingRequests.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user.asStateFlow()
    
    private val _requestResult = MutableStateFlow<String?>(null)
    val requestResult: StateFlow<String?> = _requestResult.asStateFlow()
    
    init {
        loadUserRole()
        loadLeaveData()
    }
    
    private fun loadUserRole() {
        viewModelScope.launch {
            tokenManager.getUser().collect { user ->
                _user.value = user
            }
        }
    }
    
    fun loadLeaveData() {
        viewModelScope.launch {
            _isLoading.value = true
            
            // Load leave types
            try {
                val typesResponse = apiService.getLeaveTypes()
                if (typesResponse.isSuccessful) {
                    _leaveTypes.value = typesResponse.body()?.leaveTypes ?: emptyList()
                }
            } catch (_: Exception) {}
            
            // Load balances
            try {
                val balancesResponse = apiService.getMyLeaveBalances()
                if (balancesResponse.isSuccessful) {
                    _leaveBalances.value = balancesResponse.body()?.balances ?: emptyList()
                }
            } catch (_: Exception) {}
            
            // Load my requests
            try {
                val requestsResponse = apiService.getMyLeaveRequests()
                if (requestsResponse.isSuccessful) {
                    _myRequests.value = requestsResponse.body()?.requests ?: emptyList()
                }
            } catch (_: Exception) {}
            
            // Load pending requests for HR/Admin
            if (_user.value?.role in listOf("ADMIN", "HR_MANAGER")) {
                try {
                    val pendingResponse = apiService.getAllLeaveRequests("PENDING")
                    if (pendingResponse.isSuccessful) {
                        _pendingRequests.value = pendingResponse.body()?.requests ?: emptyList()
                    }
                } catch (_: Exception) {}
            }
            
            _isLoading.value = false
        }
    }
    
    fun createLeaveRequest(
        leaveTypeId: String,
        startDate: String,
        endDate: String,
        reason: String?
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = apiService.createLeaveRequest(
                    CreateLeaveRequest(
                        leaveTypeId = leaveTypeId,
                        startDate = startDate,
                        endDate = endDate,
                        reason = reason
                    )
                )
                if (response.isSuccessful) {
                    _requestResult.value = "Leave request submitted successfully"
                    loadLeaveData()
                } else {
                    _requestResult.value = "Failed to submit request"
                }
            } catch (e: Exception) {
                _requestResult.value = e.message ?: "Error submitting request"
            }
            _isLoading.value = false
        }
    }
    
    fun cancelLeaveRequest(requestId: String) {
        viewModelScope.launch {
            try {
                val response = apiService.cancelLeaveRequest(requestId)
                if (response.isSuccessful) {
                    loadLeaveData()
                }
            } catch (_: Exception) {}
        }
    }
    
    fun approveRequest(requestId: String) {
        viewModelScope.launch {
            try {
                val response = apiService.approveRejectLeaveRequest(
                    requestId,
                    ApproveRejectRequest("APPROVED")
                )
                if (response.isSuccessful) {
                    _pendingRequests.update { list ->
                        list.filter { it.id != requestId }
                    }
                }
            } catch (_: Exception) {}
        }
    }
    
    fun rejectRequest(requestId: String, comment: String?) {
        viewModelScope.launch {
            try {
                val response = apiService.approveRejectLeaveRequest(
                    requestId,
                    ApproveRejectRequest("REJECTED", comment)
                )
                if (response.isSuccessful) {
                    _pendingRequests.update { list ->
                        list.filter { it.id != requestId }
                    }
                }
            } catch (_: Exception) {}
        }
    }
    
    fun clearRequestResult() {
        _requestResult.value = null
    }
}
