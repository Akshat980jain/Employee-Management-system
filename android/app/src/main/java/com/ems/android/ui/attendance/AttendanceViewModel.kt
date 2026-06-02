package com.ems.android.ui.attendance

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ems.android.data.api.ApiService
import com.ems.android.data.models.*
import com.ems.android.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AttendanceViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {
    
    private val _attendanceStatus = MutableStateFlow<AttendanceStatusResponse?>(null)
    val attendanceStatus: StateFlow<AttendanceStatusResponse?> = _attendanceStatus.asStateFlow()
    
    private val _attendanceHistory = MutableStateFlow<List<AttendanceRecord>>(emptyList())
    val attendanceHistory: StateFlow<List<AttendanceRecord>> = _attendanceHistory.asStateFlow()
    
    private val _corrections = MutableStateFlow<List<AttendanceCorrection>>(emptyList())
    val corrections: StateFlow<List<AttendanceCorrection>> = _corrections.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _clockResult = MutableStateFlow<Resource<CheckInOutResponse>?>(null)
    val clockResult: StateFlow<Resource<CheckInOutResponse>?> = _clockResult.asStateFlow()
    
    init {
        loadAttendanceData()
    }
    
    fun loadAttendanceData() {
        viewModelScope.launch {
            _isLoading.value = true
            
            val jobs = listOf(
                launch {
                    try {
                        val statusResponse = apiService.getAttendanceStatus()
                        if (statusResponse.isSuccessful && statusResponse.body() != null) {
                            _attendanceStatus.value = statusResponse.body()
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
                        val historyResponse = apiService.getMyAttendance()
                        if (historyResponse.isSuccessful) {
                            _attendanceHistory.value = historyResponse.body()?.records ?: emptyList()
                        }
                    } catch (_: Exception) {}
                },
                launch {
                    try {
                        val correctionsResponse = apiService.getMyCorrectionRequests()
                        if (correctionsResponse.isSuccessful) {
                            _corrections.value = correctionsResponse.body()?.corrections ?: emptyList()
                        }
                    } catch (_: Exception) {}
                }
            )
            
            jobs.forEach { it.join() }
            _isLoading.value = false
        }
    }
    
    fun clockIn() {
        viewModelScope.launch {
            _clockResult.value = Resource.Loading()
            try {
                val response = apiService.checkIn()
                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    _clockResult.value = Resource.Success(body)
                    // Update locally for instant UI update
                    _attendanceStatus.value = AttendanceStatusResponse(
                        success = true,
                        isClockedIn = true,
                        currentSession = body.session,
                        todaySessions = _attendanceStatus.value?.todaySessions?.toMutableList()?.apply {
                            body.session?.let { add(it) }
                        } ?: emptyList()
                    )
                    loadAttendanceData()
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
                    _clockResult.value = Resource.Error(errorMessage)
                }
            } catch (e: Exception) {
                _clockResult.value = Resource.Error(e.message ?: "Clock in failed")
            }
        }
    }
    
    fun clockOut() {
        viewModelScope.launch {
            _clockResult.value = Resource.Loading()
            try {
                val response = apiService.checkOut()
                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    _clockResult.value = Resource.Success(body)
                    // Update locally for instant UI update
                    _attendanceStatus.value = AttendanceStatusResponse(
                        success = true,
                        isClockedIn = false,
                        currentSession = null,
                        todaySessions = _attendanceStatus.value?.todaySessions?.map { session ->
                            if (body.session != null && ((session.id != null && session.id == body.session.id) || session.checkIn == body.session.checkIn)) body.session else session
                        } ?: emptyList()
                    )
                    loadAttendanceData()
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
                    _clockResult.value = Resource.Error(errorMessage)
                }
            } catch (e: Exception) {
                _clockResult.value = Resource.Error(e.message ?: "Clock out failed")
            }
        }
    }
    
    fun clearClockResult() {
        _clockResult.value = null
    }
    
    fun requestCorrection(
        date: String,
        type: String,
        proposedCheckIn: String?,
        proposedCheckOut: String?,
        reason: String
    ) {
        viewModelScope.launch {
            try {
                val response = apiService.requestCorrection(
                    AttendanceCorrectionRequest(
                        date = date,
                        type = type,
                        proposedCheckIn = proposedCheckIn,
                        proposedCheckOut = proposedCheckOut,
                        reason = reason
                    )
                )
                if (response.isSuccessful) {
                    loadAttendanceData()
                }
            } catch (_: Exception) {}
        }
    }
}
