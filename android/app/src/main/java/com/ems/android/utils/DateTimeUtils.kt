package com.ems.android.utils

import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

object DateTimeUtils {
    fun formatToLocalTime(isoString: String): String {
        return try {
            val instant = Instant.parse(isoString)
            val localDateTime = instant.atZone(ZoneId.systemDefault()).toLocalDateTime()
            val formatter = DateTimeFormatter.ofPattern("h:mm a", Locale.getDefault())
            localDateTime.format(formatter)
        } catch (e: Exception) {
            formatTimeFallback(isoString)
        }
    }

    fun formatToLocalDateTime(isoString: String): String {
        return try {
            val instant = Instant.parse(isoString)
            val localDateTime = instant.atZone(ZoneId.systemDefault()).toLocalDateTime()
            val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd h:mm a", Locale.getDefault())
            localDateTime.format(formatter)
        } catch (e: Exception) {
            isoString.take(16).replace("T", " ")
        }
    }

    private fun formatTimeFallback(isoString: String): String {
        return try {
            val timePart = isoString.substringAfter("T").substringBefore(".")
            val parts = timePart.split(":")
            if (parts.size >= 2) {
                val hour = parts[0].toInt()
                val minute = parts[1]
                val period = if (hour >= 12) "PM" else "AM"
                val displayHour = if (hour > 12) hour - 12 else if (hour == 0) 12 else hour
                "$displayHour:$minute $period"
            } else {
                isoString
            }
        } catch (e: Exception) {
            isoString
        }
    }
}
