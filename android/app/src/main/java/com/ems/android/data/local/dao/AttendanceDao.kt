package com.ems.android.data.local.dao

import androidx.room.*
import com.ems.android.data.local.entity.AttendanceEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AttendanceDao {
    @Query("SELECT * FROM attendance_records ORDER BY date DESC")
    fun getAllAttendance(): Flow<List<AttendanceEntity>>
    
    @Query("SELECT * FROM attendance_records WHERE date = :date")
    fun getAttendanceByDate(date: String): Flow<AttendanceEntity?>
    
    @Query("SELECT * FROM attendance_records WHERE date BETWEEN :startDate AND :endDate ORDER BY date DESC")
    fun getAttendanceByDateRange(startDate: String, endDate: String): Flow<List<AttendanceEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAttendance(attendance: AttendanceEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAllAttendance(attendances: List<AttendanceEntity>)
    
    @Delete
    suspend fun deleteAttendance(attendance: AttendanceEntity)
    
    @Query("DELETE FROM attendance_records")
    suspend fun clearAllAttendance()
}
