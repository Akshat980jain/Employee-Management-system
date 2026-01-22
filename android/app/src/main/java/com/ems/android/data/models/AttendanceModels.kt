package com.ems.android.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

// Attendance Models
@JsonClass(generateAdapter = true)
data class AttendanceSession(
    @Json(name = "_id") val id: String,
    @Json(name = "checkIn") val checkIn: String,
    @Json(name = "checkOut") val checkOut: String? = null,
    @Json(name = "duration") val duration: Long? = null,
    @Json(name = "status") val status: String? = null
)

@JsonClass(generateAdapter = true)
data class AttendanceStatusResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "isClockedIn") val isClockedIn: Boolean = false,
    @Json(name = "currentSession") val currentSession: AttendanceSession? = null,
    @Json(name = "todaySessions") val todaySessions: List<AttendanceSession> = emptyList()
)

@JsonClass(generateAdapter = true)
data class CheckInOutResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "message") val message: String? = null,
    @Json(name = "session") val session: AttendanceSession? = null
)

@JsonClass(generateAdapter = true)
data class AttendanceRecord(
    @Json(name = "_id") val id: String,
    @Json(name = "date") val date: String,
    @Json(name = "sessions") val sessions: List<AttendanceSession> = emptyList(),
    @Json(name = "totalDuration") val totalDuration: Long? = null,
    @Json(name = "status") val status: String? = null
)

@JsonClass(generateAdapter = true)
data class AttendanceHistoryResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "records") val records: List<AttendanceRecord> = emptyList()
)

// Attendance Correction
@JsonClass(generateAdapter = true)
data class AttendanceCorrectionRequest(
    @Json(name = "date") val date: String,
    @Json(name = "type") val type: String,
    @Json(name = "proposedCheckIn") val proposedCheckIn: String? = null,
    @Json(name = "proposedCheckOut") val proposedCheckOut: String? = null,
    @Json(name = "reason") val reason: String
)

@JsonClass(generateAdapter = true)
data class AttendanceCorrection(
    @Json(name = "_id") val id: String,
    @Json(name = "date") val date: String,
    @Json(name = "type") val type: String,
    @Json(name = "status") val status: String,
    @Json(name = "reason") val reason: String,
    @Json(name = "createdAt") val createdAt: String
)

@JsonClass(generateAdapter = true)
data class AttendanceCorrectionResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "corrections") val corrections: List<AttendanceCorrection> = emptyList()
)
