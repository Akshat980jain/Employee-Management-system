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
            
            // Load current status
            try {
                val statusResponse = apiService.getAttendanceStatus()
                if (statusResponse.isSuccessful) {
                    _attendanceStatus.value = statusResponse.body()
                }
            } catch (_: Exception) {}
            
            // Load monthly history
            try {
                val historyResponse = apiService.getMyAttendance()
                if (historyResponse.isSuccessful) {
                    _attendanceHistory.value = historyResponse.body()?.records ?: emptyList()
                }
            } catch (_: Exception) {}
            
            // Load correction requests
            try {
                val correctionsResponse = apiService.getMyCorrectionRequests()
                if (correctionsResponse.isSuccessful) {
                    _corrections.value = correctionsResponse.body()?.corrections ?: emptyList()
                }
            } catch (_: Exception) {}
            
            _isLoading.value = false
        }
    }
    
    fun clockIn() {
        viewModelScope.launch {
            _clockResult.value = Resource.Loading()
            try {
                val response = apiService.checkIn()
                if (response.isSuccessful && response.body() != null) {
                    _clockResult.value = Resource.Success(response.body()!!)
                    loadAttendanceData()
                } else {
                    _clockResult.value = Resource.Error("Failed to clock in")
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
                    _clockResult.value = Resource.Success(response.body()!!)
                    loadAttendanceData()
                } else {
                    _clockResult.value = Resource.Error("Failed to clock out")
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
