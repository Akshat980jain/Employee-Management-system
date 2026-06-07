package com.ems.android.data.api

import com.ems.android.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    
    // ==================== AUTH ====================
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
    
    @POST("api/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>
    
    @POST("api/auth/google-login")
    suspend fun googleLogin(@Body request: GoogleLoginRequest): Response<AuthResponse>
    
    @POST("api/auth/google-register")
    suspend fun googleRegister(@Body request: GoogleRegisterRequest): Response<AuthResponse>
    
    @POST("api/auth/logout")
    suspend fun logout(): Response<ApiResponse>
    
    @GET("api/auth/me")
    suspend fun getCurrentUser(): Response<AuthResponse>
    
    @POST("api/auth/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<AuthResponse>
    
    @POST("api/auth/reset-password")
    suspend fun resetPassword(@Body request: ResetPasswordRequest): Response<ApiResponse>
    
    // ==================== ORGANIZATIONS ====================
    @GET("api/organizations/search")
    suspend fun searchOrganizations(
        @Query("query") query: String
    ): Response<OrganizationSearchResponse>
    
    @GET("api/organizations/departments")
    suspend fun getDepartments(): Response<DepartmentsResponse>
    
    // ==================== ATTENDANCE ====================
    @GET("api/attendance/status")
    suspend fun getAttendanceStatus(): Response<AttendanceStatusResponse>
    
    @POST("api/attendance/check-in")
    suspend fun checkIn(): Response<CheckInOutResponse>
    
    @POST("api/attendance/check-out")
    suspend fun checkOut(): Response<CheckInOutResponse>
    
    @GET("api/attendance/my")
    suspend fun getMyAttendance(
        @Query("month") month: Int? = null,
        @Query("year") year: Int? = null
    ): Response<AttendanceHistoryResponse>
    
    @POST("api/attendance/corrections")
    suspend fun requestCorrection(
        @Body request: AttendanceCorrectionRequest
    ): Response<ApiResponse>
    
    @GET("api/attendance/corrections/my")
    suspend fun getMyCorrectionRequests(): Response<AttendanceCorrectionResponse>
    
    // ==================== LEAVE ====================
    @GET("api/leave/types")
    suspend fun getLeaveTypes(): Response<LeaveTypesResponse>
    
    @GET("api/leave/my/balances")
    suspend fun getMyLeaveBalances(): Response<LeaveBalancesResponse>
    
    @GET("api/leave/my/requests")
    suspend fun getMyLeaveRequests(): Response<LeaveRequestsResponse>
    
    @POST("api/leave/requests")
    suspend fun createLeaveRequest(
        @Body request: CreateLeaveRequest
    ): Response<LeaveRequestResponse>
    
    @DELETE("api/leave/requests/{id}")
    suspend fun cancelLeaveRequest(
        @Path("id") requestId: String
    ): Response<ApiResponse>
    
    // HR/Admin endpoints
    @GET("api/leave/requests")
    suspend fun getAllLeaveRequests(
        @Query("status") status: String? = null
    ): Response<LeaveRequestsResponse>
    
    @PUT("api/leave/requests/{id}/approve")
    suspend fun approveRejectLeaveRequest(
        @Path("id") requestId: String,
        @Body request: ApproveRejectRequest
    ): Response<LeaveRequestResponse>
    
    // ==================== JOIN REQUESTS ====================
    @GET("api/join-requests")
    suspend fun getPendingJoinRequests(
        @Query("status") status: String = "PENDING"
    ): Response<JoinRequestsResponse>
    
    @GET("api/join-requests/my")
    suspend fun getMyJoinRequests(): Response<JoinRequestsResponse>
    
    @POST("api/join-requests/{id}/approve")
    suspend fun approveJoinRequest(
        @Path("id") requestId: String
    ): Response<JoinRequestActionResponse>
    
    @POST("api/join-requests/{id}/reject")
    suspend fun rejectJoinRequest(
        @Path("id") requestId: String,
        @Body body: RejectJoinRequest = RejectJoinRequest()
    ): Response<JoinRequestActionResponse>
    
    // ==================== EMPLOYEES ====================
    @GET("api/employees")
    suspend fun getEmployees(
        @Query("search") search: String? = null,
        @Query("department") department: String? = null,
        @Query("status") status: String? = null
    ): Response<EmployeeListResponse>
    
    @GET("api/employees/{id}")
    suspend fun getEmployeeById(
        @Path("id") employeeId: String
    ): Response<EmployeeDetailResponse>
    
    @POST("api/employees")
    suspend fun createEmployee(
        @Body request: CreateEmployeeRequest
    ): Response<EmployeeDetailResponse>
    
    @PUT("api/employees/{id}")
    suspend fun updateEmployee(
        @Path("id") employeeId: String,
        @Body request: UpdateEmployeeRequest
    ): Response<EmployeeDetailResponse>
    
    @PUT("api/employees/{id}/deactivate")
    suspend fun deactivateEmployee(
        @Path("id") employeeId: String
    ): Response<ApiResponse>
    
    // ==================== DEPARTMENTS CRUD ====================
    @POST("api/organizations/departments")
    suspend fun createDepartment(
        @Body request: CreateDepartmentRequest
    ): Response<DepartmentResponse>
    
    @PUT("api/organizations/departments/{id}")
    suspend fun updateDepartment(
        @Path("id") departmentId: String,
        @Body request: CreateDepartmentRequest
    ): Response<DepartmentResponse>
    
    @DELETE("api/organizations/departments/{id}")
    suspend fun deleteDepartment(
        @Path("id") departmentId: String
    ): Response<ApiResponse>
    
    // ==================== TRANSFER REQUESTS ====================
    @GET("api/transfer-requests/my")
    suspend fun getMyTransferRequests(): Response<TransferRequestsResponse>
    
    @GET("api/transfer-requests/incoming")
    suspend fun getIncomingTransfers(): Response<TransferRequestsResponse>
    
    @GET("api/transfer-requests/outgoing")
    suspend fun getOutgoingTransfers(): Response<TransferRequestsResponse>
    
    @POST("api/transfer-requests")
    suspend fun createTransferRequest(
        @Body request: CreateTransferRequest
    ): Response<ApiResponse>
    
    @PUT("api/transfer-requests/{id}/approve")
    suspend fun approveTransferRequest(
        @Path("id") requestId: String
    ): Response<ApiResponse>
    
    @PUT("api/transfer-requests/{id}/reject")
    suspend fun rejectTransferRequest(
        @Path("id") requestId: String
    ): Response<ApiResponse>
    
    // ==================== STAFF MONITORING ====================
    @GET("api/attendance/staff-monitoring")
    suspend fun getStaffMonitoring(
        @Query("department") department: String? = null,
        @Query("role") role: String? = null
    ): Response<StaffMonitoringResponse>
    
    // ==================== PROFILE ====================
    @PUT("api/auth/profile")
    suspend fun updateProfile(
        @Body request: UpdateEmployeeRequest
    ): Response<AuthResponse>
    
    @Multipart
    @POST("api/auth/avatar")
    suspend fun uploadAvatar(
        @Part avatar: okhttp3.MultipartBody.Part
    ): Response<AuthResponse>
    
    // ==================== DASHBOARD STATS ====================
    @GET("api/attendance/today-stats")
    suspend fun getTodayStats(): Response<TodayStatsResponse>
    
    @GET("api/holidays")
    suspend fun getHolidays(): Response<HolidaysResponse>
    
    @GET("api/activities")
    suspend fun getRecentActivities(
        @Query("limit") limit: Int = 10
    ): Response<ActivityLogResponse>
}
