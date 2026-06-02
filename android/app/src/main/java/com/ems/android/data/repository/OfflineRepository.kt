package com.ems.android.data.repository

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import com.ems.android.data.api.ApiService
import com.ems.android.data.local.EMSDatabase
import com.ems.android.data.local.entity.*
import com.ems.android.data.models.*
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OfflineRepository @Inject constructor(
    @ApplicationContext private val context: Context,
    private val database: EMSDatabase,
    private val apiService: ApiService
) {
    private val userDao = database.userDao()
    private val attendanceDao = database.attendanceDao()
    private val leaveDao = database.leaveDao()
    private val generalDao = database.generalDao()
    private val pendingActionDao = database.pendingActionDao()
    
    // Check network availability
    fun isNetworkAvailable(): Boolean {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }
    
    // ==================== USER ====================
    
    fun getCachedUser(): Flow<UserEntity?> {
        return userDao.getCurrentUser()
    }
    
    suspend fun cacheUser(user: User) {
        userDao.insertUser(user.toEntity())
    }
    
    suspend fun clearUserCache() {
        userDao.clearAllUsers()
    }
    
    // ==================== ATTENDANCE ====================
    
    fun getCachedAttendance(): Flow<List<AttendanceEntity>> {
        return attendanceDao.getAllAttendance()
    }
    
    fun getCachedAttendanceByDate(date: String): Flow<AttendanceEntity?> {
        return attendanceDao.getAttendanceByDate(date)
    }
    
    suspend fun cacheAttendanceHistory(records: List<AttendanceRecord>) {
        val entities = records.map { it.toEntity() }
        attendanceDao.insertAllAttendance(entities)
    }
    
    suspend fun clearAttendanceCache() {
        attendanceDao.clearAllAttendance()
    }
    
    // ==================== LEAVE ====================
    
    fun getCachedLeaveRequests(): Flow<List<LeaveRequestEntity>> {
        return leaveDao.getAllLeaveRequests()
    }
    
    fun getCachedLeaveBalances(): Flow<List<LeaveBalanceEntity>> {
        return leaveDao.getAllLeaveBalances()
    }
    
    suspend fun cacheLeaveRequests(requests: List<LeaveRequest>) {
        val entities = requests.map { it.toEntity() }
        leaveDao.insertAllLeaveRequests(entities)
    }
    
    suspend fun cacheLeaveBalances(balances: List<LeaveBalance>) {
        val entities = balances.map { it.toEntity() }
        leaveDao.insertAllLeaveBalances(entities)
    }
    
    suspend fun clearLeaveCache() {
        leaveDao.clearAllLeaveRequests()
        leaveDao.clearAllLeaveBalances()
    }
    
    // ==================== DEPARTMENTS ====================
    
    fun getCachedDepartments(): Flow<List<DepartmentEntity>> {
        return generalDao.getAllDepartments()
    }
    
    suspend fun cacheDepartments(departments: List<DepartmentDetails>) {
        val entities = departments.map { it.toEntity() }
        generalDao.insertAllDepartments(entities)
    }
    
    // ==================== HOLIDAYS ====================
    
    fun getCachedHolidays(): Flow<List<HolidayEntity>> {
        return generalDao.getAllHolidays()
    }
    
    suspend fun cacheHolidays(holidays: List<Holiday>) {
        val entities = holidays.map { it.toEntity() }
        generalDao.insertAllHolidays(entities)
    }
    
    // ==================== PENDING ACTIONS ====================
    
    fun getPendingActions(): Flow<List<PendingActionEntity>> {
        return pendingActionDao.getAllPendingActions()
    }
    
    fun getPendingActionsCount(): Flow<Int> {
        return pendingActionDao.getPendingActionsCount()
    }
    
    suspend fun queueAction(actionType: String, payload: String) {
        pendingActionDao.insertPendingAction(
            PendingActionEntity(actionType = actionType, payload = payload)
        )
    }
    
    suspend fun removePendingAction(actionId: Long) {
        pendingActionDao.deletePendingActionById(actionId)
    }
    
    suspend fun clearPendingActions() {
        pendingActionDao.clearAllPendingActions()
    }
    
    // ==================== SYNC ====================
    
    suspend fun syncAllData() {
        if (!isNetworkAvailable()) return
        
        // Sync pending actions first
        syncPendingActions()
        
        // Then refresh cache from server
        refreshCache()
    }
    
    private suspend fun syncPendingActions() {
        val actions = pendingActionDao.getAllPendingActions().first()
        for (action in actions) {
            try {
                val success = when (action.actionType) {
                    "CLOCK_IN" -> {
                        val response = apiService.checkIn()
                        response.isSuccessful
                    }
                    "CLOCK_OUT" -> {
                        val response = apiService.checkOut()
                        response.isSuccessful
                    }
                    else -> false
                }
                
                if (success) {
                    pendingActionDao.deletePendingActionById(action.id)
                } else {
                    pendingActionDao.incrementRetryCount(action.id)
                }
            } catch (_: Exception) {
                pendingActionDao.incrementRetryCount(action.id)
            }
        }
    }
    
    private suspend fun refreshCache() {
        // Refresh attendance
        try {
            val attendanceResponse = apiService.getMyAttendance()
            if (attendanceResponse.isSuccessful) {
                attendanceResponse.body()?.records?.let { records ->
                    cacheAttendanceHistory(records)
                }
            }
        } catch (_: Exception) {}
        
        // Refresh departments
        try {
            val deptResponse = apiService.getDepartments()
            if (deptResponse.isSuccessful) {
                deptResponse.body()?.departments?.let { depts ->
                    cacheDepartments(depts)
                }
            }
        } catch (_: Exception) {}
        
        // Refresh holidays
        try {
            val holidayResponse = apiService.getHolidays()
            if (holidayResponse.isSuccessful) {
                holidayResponse.body()?.holidays?.let { holidays ->
                    cacheHolidays(holidays)
                }
            }
        } catch (_: Exception) {}
    }
    
    // ==================== ENTITY MAPPERS ====================
    
    private fun User.toEntity() = UserEntity(
        id = getUserId(),
        firstName = firstName,
        lastName = lastName,
        email = email,
        role = role ?: "Employee",
        phone = null,
        avatar = avatar,
        departmentId = null,
        departmentName = null,
        organizationId = organization?.id,
        organizationName = organization?.name,
        status = status ?: "ACTIVE"
    )
    
    private fun AttendanceRecord.toEntity() = AttendanceEntity(
        id = id,
        date = date,
        checkIn = sessions.firstOrNull()?.checkIn,
        checkOut = sessions.lastOrNull()?.checkOut,
        status = status ?: "UNKNOWN",
        workHours = (totalDuration ?: 0L) / 3600.0
    )
    
    private fun LeaveRequest.toEntity() = LeaveRequestEntity(
        id = id,
        leaveTypeId = leaveType?.id ?: leaveTypeId ?: "",
        leaveTypeName = leaveType?.name ?: "",
        startDate = startDate,
        endDate = endDate,
        reason = reason,
        status = status,
        createdAt = createdAt
    )
    
    private fun LeaveBalance.toEntity() = LeaveBalanceEntity(
        leaveTypeId = leaveType.id,
        leaveTypeName = leaveType.name,
        totalDays = total,
        usedDays = used,
        remainingDays = available
    )
    
    private fun DepartmentDetails.toEntity() = DepartmentEntity(
        id = id,
        name = name,
        description = description,
        employeeCount = employeeCount
    )
    
    private fun Holiday.toEntity() = HolidayEntity(
        id = id ?: name.hashCode().toString(),
        name = name,
        date = date,
        description = description
    )
}
