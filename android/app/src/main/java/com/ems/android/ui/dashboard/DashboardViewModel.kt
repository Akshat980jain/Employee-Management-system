package com.ems.android.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ems.android.data.api.ApiService
import com.ems.android.data.local.TokenManager
import com.ems.android.data.models.*
import com.ems.android.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val apiService: ApiService,
    private val tokenManager: TokenManager
) : ViewModel() {
    
    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user.asStateFlow()
    
    private val _attendanceStatus = MutableStateFlow<AttendanceStatusResponse?>(null)
    val attendanceStatus: StateFlow<AttendanceStatusResponse?> = _attendanceStatus.asStateFlow()
    
    private val _leaveBalances = MutableStateFlow<List<LeaveBalance>>(emptyList())
    val leaveBalances: StateFlow<List<LeaveBalance>> = _leaveBalances.asStateFlow()
    
    private val _pendingLeaveRequests = MutableStateFlow<List<LeaveRequest>>(emptyList())
    val pendingLeaveRequests: StateFlow<List<LeaveRequest>> = _pendingLeaveRequests.asStateFlow()
    
    private val _pendingJoinRequests = MutableStateFlow<List<JoinRequest>>(emptyList())
    val pendingJoinRequests: StateFlow<List<JoinRequest>> = _pendingJoinRequests.asStateFlow()
    
    private val _holidays = MutableStateFlow<List<Holiday>>(emptyList())
    val holidays: StateFlow<List<Holiday>> = _holidays.asStateFlow()
    
    private val _todayStats = MutableStateFlow<TodayStats?>(null)
    val todayStats: StateFlow<TodayStats?> = _todayStats.asStateFlow()
    
    private val _departments = MutableStateFlow<List<DepartmentDetails>>(emptyList())
    val departments: StateFlow<List<DepartmentDetails>> = _departments.asStateFlow()
    
    private val _recentActivities = MutableStateFlow<List<ActivityLog>>(emptyList())
    val recentActivities: StateFlow<List<ActivityLog>> = _recentActivities.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _clockInOutResult = MutableStateFlow<Resource<CheckInOutResponse>?>(null)
    val clockInOutResult: StateFlow<Resource<CheckInOutResponse>?> = _clockInOutResult.asStateFlow()
    
    init {
        loadUserData()
    }
    
    private fun loadUserData() {
        viewModelScope.launch {
            tokenManager.getUser().collect { user ->
                _user.value = user
                if (user != null) {
                    refreshDashboardData()
                }
            }
        }
    }
    
    fun refreshDashboardData() {
        viewModelScope.launch {
            _isLoading.value = true
            
            // Load attendance status
            try {
                val attendanceResponse = apiService.getAttendanceStatus()
                if (attendanceResponse.isSuccessful) {
                    _attendanceStatus.value = attendanceResponse.body()
                }
            } catch (_: Exception) {}
            
            // Load leave balances
            try {
                val balancesResponse = apiService.getMyLeaveBalances()
                if (balancesResponse.isSuccessful) {
                    _leaveBalances.value = balancesResponse.body()?.balances ?: emptyList()
                }
            } catch (_: Exception) {}
            
            // Load holidays
            try {
                val holidaysResponse = apiService.getHolidays()
                if (holidaysResponse.isSuccessful) {
                    _holidays.value = holidaysResponse.body()?.holidays ?: emptyList()
                }
            } catch (_: Exception) {}
            
            // Load pending requests for HR/Admin
            if (_user.value?.role in listOf("ADMIN", "HR_MANAGER")) {
                try {
                    val leaveResponse = apiService.getAllLeaveRequests("PENDING")
                    if (leaveResponse.isSuccessful) {
                        _pendingLeaveRequests.value = leaveResponse.body()?.requests ?: emptyList()
                    }
                } catch (_: Exception) {}
                
                try {
                    val joinResponse = apiService.getPendingJoinRequests()
                    if (joinResponse.isSuccessful) {
                        _pendingJoinRequests.value = joinResponse.body()?.requests ?: emptyList()
                    }
                } catch (_: Exception) {}
                
                // Load today's stats
                try {
                    val statsResponse = apiService.getTodayStats()
                    if (statsResponse.isSuccessful) {
                        _todayStats.value = statsResponse.body()?.stats
                    }
                } catch (_: Exception) {}
                
                // Load departments
                try {
                    val deptResponse = apiService.getDepartments()
                    if (deptResponse.isSuccessful) {
                        _departments.value = deptResponse.body()?.departments ?: emptyList()
                    }
                } catch (_: Exception) {}
            }
            
            // Load recent activities for Admin
            if (_user.value?.role == "ADMIN") {
                try {
                    val activitiesResponse = apiService.getRecentActivities()
                    if (activitiesResponse.isSuccessful) {
                        _recentActivities.value = activitiesResponse.body()?.activities ?: emptyList()
                    }
                } catch (_: Exception) {}
            }
            
            _isLoading.value = false
        }
    }
    
    fun clockIn() {
        viewModelScope.launch {
            _clockInOutResult.value = Resource.Loading()
            try {
                val response = apiService.checkIn()
                if (response.isSuccessful && response.body() != null) {
                    _clockInOutResult.value = Resource.Success(response.body()!!)
                    refreshDashboardData()
                } else {
                    _clockInOutResult.value = Resource.Error("Failed to clock in")
                }
            } catch (e: Exception) {
                _clockInOutResult.value = Resource.Error(e.message ?: "Clock in failed")
            }
        }
    }
    
    fun clockOut() {
        viewModelScope.launch {
            _clockInOutResult.value = Resource.Loading()
            try {
                val response = apiService.checkOut()
                if (response.isSuccessful && response.body() != null) {
                    _clockInOutResult.value = Resource.Success(response.body()!!)
                    refreshDashboardData()
                } else {
                    _clockInOutResult.value = Resource.Error("Failed to clock out")
                }
            } catch (e: Exception) {
                _clockInOutResult.value = Resource.Error(e.message ?: "Clock out failed")
            }
        }
    }
    
    fun clearClockResult() {
        _clockInOutResult.value = null
    }
    
    fun approveJoinRequest(requestId: String) {
        viewModelScope.launch {
            try {
                val response = apiService.approveJoinRequest(requestId)
                if (response.isSuccessful) {
                    _pendingJoinRequests.update { list ->
                        list.filter { it.id != requestId }
                    }
                }
            } catch (_: Exception) {}
        }
    }
    
    fun rejectJoinRequest(requestId: String) {
        viewModelScope.launch {
            try {
                val response = apiService.rejectJoinRequest(requestId)
                if (response.isSuccessful) {
                    _pendingJoinRequests.update { list ->
                        list.filter { it.id != requestId }
                    }
                }
            } catch (_: Exception) {}
        }
    }
    
    fun approveLeaveRequest(requestId: String) {
        viewModelScope.launch {
            try {
                val response = apiService.approveRejectLeaveRequest(
                    requestId,
                    ApproveRejectRequest("APPROVED")
                )
                if (response.isSuccessful) {
                    _pendingLeaveRequests.update { list ->
                        list.filter { it.id != requestId }
                    }
                }
            } catch (_: Exception) {}
        }
    }
    
    fun rejectLeaveRequest(requestId: String, comment: String?) {
        viewModelScope.launch {
            try {
                val response = apiService.approveRejectLeaveRequest(
                    requestId,
                    ApproveRejectRequest("REJECTED", comment)
                )
                if (response.isSuccessful) {
                    _pendingLeaveRequests.update { list ->
                        list.filter { it.id != requestId }
                    }
                }
            } catch (_: Exception) {}
        }
    }
    
    suspend fun logout() {
        try {
            apiService.logout()
        } catch (_: Exception) {}
        tokenManager.clearAll()
    }
}
