package com.ems.android.data.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.ems.android.MainActivity
import com.ems.android.R
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class EMSFirebaseMessagingService : FirebaseMessagingService() {
    
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "FCM Token: $token")
        // TODO: Send token to backend for push notifications
    }
    
    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        Log.d(TAG, "FCM Message received: ${message.data}")
        
        // Handle data payload
        message.data.isNotEmpty().let {
            val title = message.data["title"] ?: "EMS Notification"
            val body = message.data["body"] ?: ""
            val type = message.data["type"] ?: "general"
            
            showNotification(title, body, type)
        }
        
        // Handle notification payload (when app is in foreground)
        message.notification?.let {
            showNotification(
                it.title ?: "EMS Notification",
                it.body ?: "",
                "general"
            )
        }
    }
    
    private fun showNotification(title: String, body: String, type: String) {
        val channelId = when (type) {
            "leave" -> CHANNEL_LEAVE
            "attendance" -> CHANNEL_ATTENDANCE
            "join_request" -> CHANNEL_JOIN_REQUEST
            else -> CHANNEL_GENERAL
        }
        
        createNotificationChannel(channelId)
        
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("notification_type", type)
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        val notification = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()
        
        val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }
    
    private fun createNotificationChannel(channelId: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                when (channelId) {
                    CHANNEL_LEAVE -> "Leave Notifications"
                    CHANNEL_ATTENDANCE -> "Attendance Notifications"
                    CHANNEL_JOIN_REQUEST -> "Join Request Notifications"
                    else -> "General Notifications"
                },
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "EMS notifications for $channelId"
            }
            
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    companion object {
        private const val TAG = "FCMService"
        private const val CHANNEL_GENERAL = "ems_general"
        private const val CHANNEL_LEAVE = "ems_leave"
        private const val CHANNEL_ATTENDANCE = "ems_attendance"
        private const val CHANNEL_JOIN_REQUEST = "ems_join_request"
    }
}
