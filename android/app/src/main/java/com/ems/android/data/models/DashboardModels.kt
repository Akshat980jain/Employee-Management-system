package com.ems.android.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

// Join Request Models
@JsonClass(generateAdapter = true)
data class JoinRequest(
    @Json(name = "_id") val id: String,
    @Json(name = "user") val user: User? = null,
    @Json(name = "organization") val organization: Organization? = null,
    @Json(name = "message") val message: String? = null,
    @Json(name = "status") val status: String, // PENDING, APPROVED, REJECTED
    @Json(name = "createdAt") val createdAt: String? = null
)

@JsonClass(generateAdapter = true)
data class JoinRequestsResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "requests") val requests: List<JoinRequest> = emptyList()
)

@JsonClass(generateAdapter = true)
data class JoinRequestActionResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "message") val message: String? = null
)

// Dashboard Stats Models
@JsonClass(generateAdapter = true)
data class DashboardStats(
    @Json(name = "totalEmployees") val totalEmployees: Int = 0,
    @Json(name = "totalDepartments") val totalDepartments: Int = 0,
    @Json(name = "pendingLeaveRequests") val pendingLeaveRequests: Int = 0,
    @Json(name = "pendingJoinRequests") val pendingJoinRequests: Int = 0,
    @Json(name = "todayPresent") val todayPresent: Int = 0,
    @Json(name = "todayAbsent") val todayAbsent: Int = 0,
    @Json(name = "todayOnLeave") val todayOnLeave: Int = 0
)

@JsonClass(generateAdapter = true)
data class DashboardStatsResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "stats") val stats: DashboardStats? = null
)

// Department Models
@JsonClass(generateAdapter = true)
data class DepartmentDetails(
    @Json(name = "_id") val id: String,
    @Json(name = "name") val name: String,
    @Json(name = "description") val description: String? = null,
    @Json(name = "employeeCount") val employeeCount: Int = 0
)

@JsonClass(generateAdapter = true)
data class DepartmentsResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "departments") val departments: List<DepartmentDetails> = emptyList()
)

// Generic API Response
@JsonClass(generateAdapter = true)
data class ApiResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "message") val message: String? = null
)

// Holiday Model
@JsonClass(generateAdapter = true)
data class Holiday(
    @Json(name = "_id") val id: String? = null,
    @Json(name = "name") val name: String,
    @Json(name = "date") val date: String,
    @Json(name = "description") val description: String? = null
)

@JsonClass(generateAdapter = true)
data class HolidaysResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "holidays") val holidays: List<Holiday> = emptyList()
)

// Today's Attendance Stats
@JsonClass(generateAdapter = true)
data class TodayStats(
    @Json(name = "present") val present: Int = 0,
    @Json(name = "absent") val absent: Int = 0,
    @Json(name = "onLeave") val onLeave: Int = 0,
    @Json(name = "late") val late: Int = 0,
    @Json(name = "total") val total: Int = 0
)

@JsonClass(generateAdapter = true)
data class TodayStatsResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "stats") val stats: TodayStats? = null
)

// Activity Log
@JsonClass(generateAdapter = true)
data class ActivityLog(
    @Json(name = "_id") val id: String,
    @Json(name = "action") val action: String,
    @Json(name = "user") val user: User? = null,
    @Json(name = "description") val description: String? = null,
    @Json(name = "createdAt") val createdAt: String
)

@JsonClass(generateAdapter = true)
data class ActivityLogResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "activities") val activities: List<ActivityLog> = emptyList()
)
