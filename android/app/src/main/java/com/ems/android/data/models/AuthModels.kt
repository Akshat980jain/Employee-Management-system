package com.ems.android.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

// Auth Request/Response models
@JsonClass(generateAdapter = true)
data class LoginRequest(
    @Json(name = "email") val email: String,
    @Json(name = "password") val password: String
)

@JsonClass(generateAdapter = true)
data class RegisterRequest(
    @Json(name = "email") val email: String,
    @Json(name = "password") val password: String,
    @Json(name = "firstName") val firstName: String,
    @Json(name = "lastName") val lastName: String,
    @Json(name = "role") val role: String, // ADMIN, HR_MANAGER, EMPLOYEE
    @Json(name = "organizationChoice") val organizationChoice: String, // CREATE_NEW, JOIN_EXISTING
    @Json(name = "organizationId") val organizationId: String? = null,
    @Json(name = "organizationName") val organizationName: String? = null,
    @Json(name = "industry") val industry: String? = null,
    @Json(name = "size") val size: String? = null,
    @Json(name = "message") val message: String? = null
)

@JsonClass(generateAdapter = true)
data class AuthResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "message") val message: String? = null,
    @Json(name = "data") val data: AuthResponseData? = null,
    // Keep these for backward compatibility with direct responses
    @Json(name = "token") val token: String? = null,
    @Json(name = "user") val user: User? = null,
    @Json(name = "pendingApproval") val pendingApproval: Boolean = false
) {
    // Helper methods to get token and user from either location
    fun getAccessToken(): String? = data?.accessToken ?: token
    fun getUserData(): User? = data?.user ?: user
    fun isPendingVerification(): Boolean = data?.pendingVerification ?: pendingApproval
    fun getOrganizationData(): AuthOrganization? = data?.organization
}

@JsonClass(generateAdapter = true)
data class AuthResponseData(
    @Json(name = "accessToken") val accessToken: String? = null,
    @Json(name = "refreshToken") val refreshToken: String? = null,
    @Json(name = "user") val user: User? = null,
    @Json(name = "organization") val organization: AuthOrganization? = null,
    @Json(name = "pendingVerification") val pendingVerification: Boolean = false
)

@JsonClass(generateAdapter = true)
data class AuthOrganization(
    @Json(name = "id") val id: String,
    @Json(name = "name") val name: String,
    @Json(name = "slug") val slug: String? = null
)

@JsonClass(generateAdapter = true)
data class User(
    // Backend returns "id" in login response, "_id" in other responses
    @Json(name = "id") val id: String? = null,
    @Json(name = "_id") val _id: String? = null,
    @Json(name = "email") val email: String,
    @Json(name = "firstName") val firstName: String,
    @Json(name = "lastName") val lastName: String,
    @Json(name = "avatar") val avatar: String? = null,
    @Json(name = "role") val role: String? = null,
    @Json(name = "status") val status: String? = null,
    @Json(name = "organizationId") val organizationId: String? = null,
    @Json(name = "organization") val organization: Organization? = null,
    @Json(name = "isVerified") val isVerified: Boolean? = null
) {
    // Helper to get the ID regardless of which field is populated
    fun getUserId(): String = id ?: _id ?: ""
}

@JsonClass(generateAdapter = true)
data class Organization(
    @Json(name = "_id") val id: String,
    @Json(name = "name") val name: String,
    @Json(name = "industry") val industry: String? = null,
    @Json(name = "size") val size: String? = null
)

@JsonClass(generateAdapter = true)
data class OrganizationSearchResult(
    @Json(name = "_id") val id: String,
    @Json(name = "name") val name: String,
    @Json(name = "industry") val industry: String? = null
)

@JsonClass(generateAdapter = true)
data class OrganizationSearchResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "organizations") val organizations: List<OrganizationSearchResult>
)

// API Error Response
@JsonClass(generateAdapter = true)
data class ApiError(
    @Json(name = "success") val success: Boolean = false,
    @Json(name = "message") val message: String? = null,
    @Json(name = "error") val error: String? = null
)

@JsonClass(generateAdapter = true)
data class ForgotPasswordRequest(
    @Json(name = "email") val email: String
)

@JsonClass(generateAdapter = true)
data class ResetPasswordRequest(
    @Json(name = "email") val email: String,
    @Json(name = "token") val token: String,
    @Json(name = "password") val password: String
)
