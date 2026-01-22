package com.ems.android.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val firstName: String,
    val lastName: String,
    val email: String,
    val role: String,
    val phone: String? = null,
    val avatar: String? = null,
    val departmentId: String? = null,
    val departmentName: String? = null,
    val organizationId: String? = null,
    val organizationName: String? = null,
    val status: String = "ACTIVE",
    val lastSynced: Long = System.currentTimeMillis()
)

@Entity(tableName = "attendance_records")
data class AttendanceEntity(
    @PrimaryKey val id: String,
    val date: String,
    val checkIn: String? = null,
    val checkOut: String? = null,
    val status: String,
    val workHours: Double = 0.0,
    val lastSynced: Long = System.currentTimeMillis()
)

@Entity(tableName = "leave_requests")
data class LeaveRequestEntity(
    @PrimaryKey val id: String,
    val leaveTypeId: String,
    val leaveTypeName: String,
    val startDate: String,
    val endDate: String,
    val reason: String? = null,
    val status: String,
    val createdAt: String? = null,
    val lastSynced: Long = System.currentTimeMillis()
)

@Entity(tableName = "leave_balances")
data class LeaveBalanceEntity(
    @PrimaryKey val leaveTypeId: String,
    val leaveTypeName: String,
    val totalDays: Int,
    val usedDays: Int,
    val remainingDays: Int,
    val lastSynced: Long = System.currentTimeMillis()
)

@Entity(tableName = "departments")
data class DepartmentEntity(
    @PrimaryKey val id: String,
    val name: String,
    val description: String? = null,
    val employeeCount: Int = 0,
    val lastSynced: Long = System.currentTimeMillis()
)

@Entity(tableName = "holidays")
data class HolidayEntity(
    @PrimaryKey val id: String,
    val name: String,
    val date: String,
    val description: String? = null,
    val lastSynced: Long = System.currentTimeMillis()
)

@Entity(tableName = "pending_actions")
data class PendingActionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val actionType: String, // CLOCK_IN, CLOCK_OUT, LEAVE_REQUEST, etc.
    val payload: String, // JSON payload
    val createdAt: Long = System.currentTimeMillis(),
    val retryCount: Int = 0
)
