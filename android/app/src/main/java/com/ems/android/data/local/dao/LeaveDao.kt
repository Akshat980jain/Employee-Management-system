package com.ems.android.data.local.dao

import androidx.room.*
import com.ems.android.data.local.entity.LeaveBalanceEntity
import com.ems.android.data.local.entity.LeaveRequestEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface LeaveDao {
    // Leave Requests
    @Query("SELECT * FROM leave_requests ORDER BY createdAt DESC")
    fun getAllLeaveRequests(): Flow<List<LeaveRequestEntity>>
    
    @Query("SELECT * FROM leave_requests WHERE status = :status ORDER BY createdAt DESC")
    fun getLeaveRequestsByStatus(status: String): Flow<List<LeaveRequestEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLeaveRequest(request: LeaveRequestEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAllLeaveRequests(requests: List<LeaveRequestEntity>)
    
    @Delete
    suspend fun deleteLeaveRequest(request: LeaveRequestEntity)
    
    @Query("DELETE FROM leave_requests")
    suspend fun clearAllLeaveRequests()
    
    // Leave Balances
    @Query("SELECT * FROM leave_balances")
    fun getAllLeaveBalances(): Flow<List<LeaveBalanceEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAllLeaveBalances(balances: List<LeaveBalanceEntity>)
    
    @Query("DELETE FROM leave_balances")
    suspend fun clearAllLeaveBalances()
}
