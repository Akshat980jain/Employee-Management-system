package com.ems.android.data.socket

import android.util.Log
import com.ems.android.data.local.TokenManager
import io.socket.client.IO
import io.socket.client.Socket
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import org.json.JSONObject
import javax.inject.Inject
import javax.inject.Singleton

sealed class SocketEvent {
    data class JoinRequestNew(val requestId: String, val userName: String) : SocketEvent()
    data class JoinRequestApproved(val requestId: String) : SocketEvent()
    data class JoinRequestRejected(val requestId: String) : SocketEvent()
    data class AttendanceUpdate(val employeeId: String, val type: String) : SocketEvent()
    data class LeaveRequestUpdate(val requestId: String, val status: String) : SocketEvent()
    data object Connected : SocketEvent()
    data object Disconnected : SocketEvent()
}

@Singleton
class SocketManager @Inject constructor(
    private val tokenManager: TokenManager
) {
    private var socket: Socket? = null
    private val scope = CoroutineScope(Dispatchers.IO)
    
    private val _events = MutableSharedFlow<SocketEvent>()
    val events: SharedFlow<SocketEvent> = _events
    
    private val _isConnected = MutableSharedFlow<Boolean>(replay = 1)
    val isConnected: SharedFlow<Boolean> = _isConnected
    
    fun connect(baseUrl: String) {
        scope.launch {
            try {
                val token = tokenManager.getToken().first()
                if (token.isNullOrEmpty()) {
                    Log.w(TAG, "No token available for socket connection")
                    return@launch
                }
                
                val options = IO.Options().apply {
                    auth = mapOf("token" to token)
                    reconnection = true
                    reconnectionAttempts = 5
                    reconnectionDelay = 1000
                }
                
                socket = IO.socket(baseUrl, options)
                
                socket?.apply {
                    on(Socket.EVENT_CONNECT) {
                        Log.d(TAG, "Socket connected")
                        scope.launch {
                            _isConnected.emit(true)
                            _events.emit(SocketEvent.Connected)
                        }
                    }
                    
                    on(Socket.EVENT_DISCONNECT) {
                        Log.d(TAG, "Socket disconnected")
                        scope.launch {
                            _isConnected.emit(false)
                            _events.emit(SocketEvent.Disconnected)
                        }
                    }
                    
                    on("join-request:new") { args ->
                        parseEvent(args) { json ->
                            val requestId = json.optString("requestId", "")
                            val userName = json.optString("userName", "")
                            scope.launch {
                                _events.emit(SocketEvent.JoinRequestNew(requestId, userName))
                            }
                        }
                    }
                    
                    on("join-request:approved") { args ->
                        parseEvent(args) { json ->
                            val requestId = json.optString("requestId", "")
                            scope.launch {
                                _events.emit(SocketEvent.JoinRequestApproved(requestId))
                            }
                        }
                    }
                    
                    on("join-request:rejected") { args ->
                        parseEvent(args) { json ->
                            val requestId = json.optString("requestId", "")
                            scope.launch {
                                _events.emit(SocketEvent.JoinRequestRejected(requestId))
                            }
                        }
                    }
                    
                    on("attendance:update") { args ->
                        parseEvent(args) { json ->
                            val employeeId = json.optString("employeeId", "")
                            val type = json.optString("type", "")
                            scope.launch {
                                _events.emit(SocketEvent.AttendanceUpdate(employeeId, type))
                            }
                        }
                    }
                    
                    on("leave-request:update") { args ->
                        parseEvent(args) { json ->
                            val requestId = json.optString("requestId", "")
                            val status = json.optString("status", "")
                            scope.launch {
                                _events.emit(SocketEvent.LeaveRequestUpdate(requestId, status))
                            }
                        }
                    }
                    
                    connect()
                }
            } catch (e: Exception) {
                Log.e(TAG, "Socket connection error: ${e.message}")
            }
        }
    }
    
    fun disconnect() {
        socket?.disconnect()
        socket = null
    }
    
    private fun parseEvent(args: Array<Any>, action: (JSONObject) -> Unit) {
        try {
            if (args.isNotEmpty()) {
                val json = when (val arg = args[0]) {
                    is JSONObject -> arg
                    is String -> JSONObject(arg)
                    else -> null
                }
                json?.let { action(it) }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing socket event: ${e.message}")
        }
    }
    
    companion object {
        private const val TAG = "SocketManager"
    }
}
