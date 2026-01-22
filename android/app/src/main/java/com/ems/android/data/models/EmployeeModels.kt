package com.ems.android.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

// Employee Detail Model
@JsonClass(generateAdapter = true)
data class EmployeeDetail(
    @Json(name = "_id") val id: String,
    @Json(name = "firstName") val firstName: String,
    @Json(name = "lastName") val lastName: String,
    @Json(name = "email") val email: String,
    @Json(name = "role") val role: String,
    @Json(name = "phone") val phone: String? = null,
    @Json(name = "avatar") val avatar: String? = null,
    @Json(name = "department") val department: DepartmentDetails? = null,
    @Json(name = "employeeId") val employeeId: String? = null,
    @Json(name = "joinDate") val joinDate: String? = null,
    @Json(name = "status") val status: String = "ACTIVE",
    @Json(name = "organization") val organization: Organization? = null,
    @Json(name = "createdAt") val createdAt: String? = null,
    @Json(name = "updatedAt") val updatedAt: String? = null
)

@JsonClass(generateAdapter = true)
data class EmployeeDetailResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "employee") val employee: EmployeeDetail? = null
)

@JsonClass(generateAdapter = true)
data class EmployeeListResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "employees") val employees: List<EmployeeDetail> = emptyList(),
    @Json(name = "total") val total: Int = 0
)

// Create/Update Employee Request
@JsonClass(generateAdapter = true)
data class CreateEmployeeRequest(
    @Json(name = "firstName") val firstName: String,
    @Json(name = "lastName") val lastName: String,
    @Json(name = "email") val email: String,
    @Json(name = "password") val password: String? = null,
    @Json(name = "role") val role: String,
    @Json(name = "phone") val phone: String? = null,
    @Json(name = "department") val departmentId: String? = null
)

@JsonClass(generateAdapter = true)
data class UpdateEmployeeRequest(
    @Json(name = "firstName") val firstName: String? = null,
    @Json(name = "lastName") val lastName: String? = null,
    @Json(name = "phone") val phone: String? = null,
    @Json(name = "department") val departmentId: String? = null,
    @Json(name = "status") val status: String? = null
)

// Transfer Request Models
@JsonClass(generateAdapter = true)
data class TransferRequest(
    @Json(name = "_id") val id: String,
    @Json(name = "employee") val employee: EmployeeDetail? = null,
    @Json(name = "fromOrganization") val fromOrganization: Organization? = null,
    @Json(name = "toOrganization") val toOrganization: Organization? = null,
    @Json(name = "status") val status: String,
    @Json(name = "message") val message: String? = null,
    @Json(name = "documentUrl") val documentUrl: String? = null,
    @Json(name = "createdAt") val createdAt: String? = null
)

@JsonClass(generateAdapter = true)
data class TransferRequestsResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "requests") val requests: List<TransferRequest> = emptyList()
)

@JsonClass(generateAdapter = true)
data class CreateTransferRequest(
    @Json(name = "toOrganizationId") val toOrganizationId: String,
    @Json(name = "message") val message: String? = null,
    @Json(name = "documentUrl") val documentUrl: String? = null
)

// Staff Monitoring Models
@JsonClass(generateAdapter = true)
data class StaffAttendance(
    @Json(name = "employee") val employee: EmployeeDetail,
    @Json(name = "presentDays") val presentDays: Int = 0,
    @Json(name = "absentDays") val absentDays: Int = 0,
    @Json(name = "lateDays") val lateDays: Int = 0,
    @Json(name = "leaveDays") val leaveDays: Int = 0,
    @Json(name = "totalWorkHours") val totalWorkHours: Double = 0.0,
    @Json(name = "avgCheckInTime") val avgCheckInTime: String? = null,
    @Json(name = "status") val status: String? = null // Today's status
)

@JsonClass(generateAdapter = true)
data class StaffMonitoringResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "data") val data: List<StaffAttendance> = emptyList()
)

// Department CRUD
@JsonClass(generateAdapter = true)
data class CreateDepartmentRequest(
    @Json(name = "name") val name: String,
    @Json(name = "description") val description: String? = null
)

@JsonClass(generateAdapter = true)
data class DepartmentResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "department") val department: DepartmentDetails? = null
)
