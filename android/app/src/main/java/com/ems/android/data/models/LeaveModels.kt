package com.ems.android.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

// Leave Models
@JsonClass(generateAdapter = true)
data class LeaveType(
    @Json(name = "_id") val id: String,
    @Json(name = "name") val name: String,
    @Json(name = "color") val color: String? = null,
    @Json(name = "description") val description: String? = null,
    @Json(name = "maxDays") val maxDays: Int? = null
)

@JsonClass(generateAdapter = true)
data class LeaveTypesResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "leaveTypes") val leaveTypes: List<LeaveType> = emptyList()
)

@JsonClass(generateAdapter = true)
data class LeaveBalance(
    @Json(name = "leaveType") val leaveType: LeaveType,
    @Json(name = "total") val total: Int = 0,
    @Json(name = "used") val used: Int = 0,
    @Json(name = "available") val available: Int = 0
)

@JsonClass(generateAdapter = true)
data class LeaveBalancesResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "balances") val balances: List<LeaveBalance> = emptyList()
)

@JsonClass(generateAdapter = true)
data class LeaveRequest(
    @Json(name = "_id") val id: String,
    @Json(name = "leaveType") val leaveType: LeaveType? = null,
    @Json(name = "leaveTypeId") val leaveTypeId: String? = null,
    @Json(name = "startDate") val startDate: String,
    @Json(name = "endDate") val endDate: String,
    @Json(name = "reason") val reason: String? = null,
    @Json(name = "status") val status: String, // PENDING, APPROVED, REJECTED
    @Json(name = "employee") val employee: Employee? = null,
    @Json(name = "reviewedBy") val reviewedBy: User? = null,
    @Json(name = "reviewComment") val reviewComment: String? = null,
    @Json(name = "createdAt") val createdAt: String? = null
)

@JsonClass(generateAdapter = true)
data class Employee(
    @Json(name = "_id") val id: String,
    @Json(name = "firstName") val firstName: String,
    @Json(name = "lastName") val lastName: String,
    @Json(name = "email") val email: String? = null,
    @Json(name = "avatar") val avatar: String? = null,
    @Json(name = "department") val department: Department? = null
)

@JsonClass(generateAdapter = true)
data class Department(
    @Json(name = "_id") val id: String,
    @Json(name = "name") val name: String
)

@JsonClass(generateAdapter = true)
data class CreateLeaveRequest(
    @Json(name = "leaveTypeId") val leaveTypeId: String,
    @Json(name = "startDate") val startDate: String,
    @Json(name = "endDate") val endDate: String,
    @Json(name = "reason") val reason: String? = null
)

@JsonClass(generateAdapter = true)
data class LeaveRequestResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "message") val message: String? = null,
    @Json(name = "leaveRequest") val leaveRequest: LeaveRequest? = null
)

@JsonClass(generateAdapter = true)
data class LeaveRequestsResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "requests") val requests: List<LeaveRequest> = emptyList()
)

@JsonClass(generateAdapter = true)
data class ApproveRejectRequest(
    @Json(name = "status") val status: String, // APPROVED or REJECTED
    @Json(name = "comment") val comment: String? = null
)
