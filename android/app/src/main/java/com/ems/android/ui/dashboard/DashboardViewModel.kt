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
    
    // NEW: Employee list for dashboard
    private val _employees = MutableStateFlow<List<EmployeeDetail>>(emptyList())
    val employees: StateFlow<List<EmployeeDetail>> = _employees.asStateFlow()
    
    private val _totalEmployees = MutableStateFlow(0)
    val totalEmployees: StateFlow<Int> = _totalEmployees.asStateFlow()
    
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
            
            val userRole = _user.value?.role
            val jobs = listOf(
                launch {
                    try {
                        val attendanceResponse = apiService.getAttendanceStatus()
                        if (attendanceResponse.isSuccessful && attendanceResponse.body() != null) {
                            _attendanceStatus.value = attendanceResponse.body()
                        } else {
                            // Fallback to getMyAttendance
                            val historyResponse = apiService.getMyAttendance()
                            if (historyResponse.isSuccessful && historyResponse.body() != null) {
                                val records = historyResponse.body()!!.records
                                val today = java.time.LocalDate.now()
                                val todayRecord = records.find { record ->
                                    try {
                                        val dateInstant = java.time.Instant.parse(record.date)
                                        val recordLocalDate = dateInstant.atZone(java.time.ZoneId.systemDefault()).toLocalDate()
                                        recordLocalDate == today
                                    } catch (e: Exception) {
                                        record.date.startsWith(today.toString())
                                    }
                                }
                                val sessions = todayRecord?.sessions ?: emptyList()
                                val currentSession = sessions.find { it.checkOut == null }
                                val isClockedIn = currentSession != null
                                
                                _attendanceStatus.value = AttendanceStatusResponse(
                                    success = true,
                                    isClockedIn = isClockedIn,
                                    currentSession = currentSession,
                                    todaySessions = sessions
                                )
                            }
                        }
                    } catch (e: Exception) {
                        try {
                            val historyResponse = apiService.getMyAttendance()
                            if (historyResponse.isSuccessful && historyResponse.body() != null) {
                                val records = historyResponse.body()!!.records
                                val today = java.time.LocalDate.now()
                                val todayRecord = records.find { record ->
                                    try {
                                        val dateInstant = java.time.Instant.parse(record.date)
                                        val recordLocalDate = dateInstant.atZone(java.time.ZoneId.systemDefault()).toLocalDate()
                                        recordLocalDate == today
                                    } catch (e: Exception) {
                                        record.date.startsWith(today.toString())
                                    }
                                }
                                val sessions = todayRecord?.sessions ?: emptyList()
                                val currentSession = sessions.find { it.checkOut == null }
                                val isClockedIn = currentSession != null
                                
                                _attendanceStatus.value = AttendanceStatusResponse(
                                    success = true,
                                    isClockedIn = isClockedIn,
                                    currentSession = currentSession,
                                    todaySessions = sessions
                                )
                            }
                        } catch (_: Exception) {}
                    }
                },
                launch {
                    try {
                        val balancesResponse = apiService.getMyLeaveBalances()
                        if (balancesResponse.isSuccessful) {
                            _leaveBalances.value = balancesResponse.body()?.balances ?: emptyList()
                        }
                    } catch (_: Exception) {}
                },
                launch {
                    try {
                        val holidaysResponse = apiService.getHolidays()
                        if (holidaysResponse.isSuccessful) {
                            _holidays.value = holidaysResponse.body()?.holidays ?: emptyList()
                        }
                    } catch (_: Exception) {}
                },
                launch {
                    if (userRole in listOf("Admin", "HR Manager", "ADMIN", "HR_MANAGER")) {
                        try {
                            val leaveResponse = apiService.getAllLeaveRequests("PENDING")
                            if (leaveResponse.isSuccessful) {
                                _pendingLeaveRequests.value = leaveResponse.body()?.requests ?: emptyList()
                            }
                        } catch (_: Exception) {}
                    }
                },
                launch {
                    if (userRole in listOf("Admin", "HR Manager", "ADMIN", "HR_MANAGER")) {
                        try {
                            val joinResponse = apiService.getPendingJoinRequests()
                            if (joinResponse.isSuccessful) {
                                _pendingJoinRequests.value = joinResponse.body()?.requests ?: emptyList()
                            }
                        } catch (_: Exception) {}
                    }
                },
                launch {
                    if (userRole in listOf("Admin", "HR Manager", "ADMIN", "HR_MANAGER")) {
                        try {
                            val statsResponse = apiService.getTodayStats()
                            if (statsResponse.isSuccessful) {
                                _todayStats.value = statsResponse.body()?.stats
                            }
                        } catch (_: Exception) {}
                    }
                },
                launch {
                    if (userRole in listOf("Admin", "HR Manager", "ADMIN", "HR_MANAGER")) {
                        try {
                            val deptResponse = apiService.getDepartments()
                            if (deptResponse.isSuccessful) {
                                _departments.value = deptResponse.body()?.departments ?: emptyList()
                            }
                        } catch (_: Exception) {}
                    }
                },
                launch {
                    if (userRole in listOf("Admin", "HR Manager", "ADMIN", "HR_MANAGER")) {
                        try {
                            val employeesResponse = apiService.getEmployees()
                            if (employeesResponse.isSuccessful) {
                                val employeeList = employeesResponse.body()?.employees ?: emptyList()
                                _employees.value = employeeList
                                _totalEmployees.value = employeesResponse.body()?.total ?: employeeList.size
                            }
                        } catch (_: Exception) {}
                    }
                },
                launch {
                    if (userRole in listOf("Admin", "ADMIN")) {
                        try {
                            val activitiesResponse = apiService.getRecentActivities()
                            if (activitiesResponse.isSuccessful) {
                                _recentActivities.value = activitiesResponse.body()?.activities ?: emptyList()
                            }
                        } catch (_: Exception) {}
                    }
                }
            )
            
            jobs.forEach { it.join() }
            _isLoading.value = false
        }
    }
    
    fun clockIn() {
        viewModelScope.launch {
            _clockInOutResult.value = Resource.Loading()
            try {
                val response = apiService.checkIn()
                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    _clockInOutResult.value = Resource.Success(body)
                    // Update locally for instant UI update
                    _attendanceStatus.value = AttendanceStatusResponse(
                        success = true,
                        isClockedIn = true,
                        currentSession = body.session,
                        todaySessions = _attendanceStatus.value?.todaySessions?.toMutableList()?.apply {
                            body.session?.let { add(it) }
                        } ?: emptyList()
                    )
                    refreshDashboardData()
                } else {
                    val errorBody = response.errorBody()?.string()
                    val errorMessage = try {
                        errorBody?.let {
                            if (it.contains("message")) {
                                val regex = """"message"\s*:\s*"([^"]+)"""".toRegex()
                                regex.find(it)?.groupValues?.get(1) ?: it
                            } else it
                        } ?: "Failed to clock in"
                    } catch (e: Exception) {
                        errorBody ?: "Failed to clock in"
                    }
                    _clockInOutResult.value = Resource.Error(errorMessage)
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
                    val body = response.body()!!
                    _clockInOutResult.value = Resource.Success(body)
                    // Update locally for instant UI update
                    _attendanceStatus.value = AttendanceStatusResponse(
                        success = true,
                        isClockedIn = false,
                        currentSession = null,
                        todaySessions = _attendanceStatus.value?.todaySessions?.map { session ->
                            if (session.id == body.session?.id) body.session else session
                        } ?: emptyList()
                    )
                    refreshDashboardData()
                } else {
                    val errorBody = response.errorBody()?.string()
                    val errorMessage = try {
                        errorBody?.let {
                            if (it.contains("message")) {
                                val regex = """"message"\s*:\s*"([^"]+)"""".toRegex()
                                regex.find(it)?.groupValues?.get(1) ?: it
                            } else it
                        } ?: "Failed to clock out"
                    } catch (e: Exception) {
                        errorBody ?: "Failed to clock out"
                    }
                    _clockInOutResult.value = Resource.Error(errorMessage)
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
