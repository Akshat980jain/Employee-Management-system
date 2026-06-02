package com.ems.android

import android.app.Application
import android.content.Intent
import android.util.Log
import com.ems.android.ui.crash.CrashActivity
import dagger.hilt.android.HiltAndroidApp
import kotlin.system.exitProcess

@HiltAndroidApp
class EMSApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            Log.e("EMSApplication", "Uncaught exception in thread ${thread.name}", throwable)
            
            val errorDetails = StringBuilder().apply {
                append("Thread: ${thread.name}\n")
                append("Exception: ${throwable.javaClass.name}\n")
                append("Message: ${throwable.message}\n\n")
                append("Stack Trace:\n")
                append(Log.getStackTraceString(throwable))
            }.toString()
            
            val intent = Intent(this, CrashActivity::class.java).apply {
                putExtra("error_details", errorDetails)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
            }
            
            startActivity(intent)
            
            android.os.Process.killProcess(android.os.Process.myPid())
            exitProcess(10)
        }
    }
}
