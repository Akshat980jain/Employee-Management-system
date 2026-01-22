package com.ems.android.data.repository

import android.util.Log
import com.ems.android.data.api.ApiService
import com.ems.android.data.local.TokenManager
import com.ems.android.data.models.*
import com.ems.android.utils.Resource
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val apiService: ApiService,
    private val tokenManager: TokenManager
) {
    
    companion object {
        private const val TAG = "AuthRepository"
    }
    
    fun login(email: String, password: String): Flow<Resource<AuthResponse>> = flow {
        emit(Resource.Loading())
        Log.d(TAG, "Attempting login for: $email")
        
        try {
            val response = apiService.login(LoginRequest(email, password))
            Log.d(TAG, "Login response code: ${response.code()}")
            
            if (response.isSuccessful && response.body() != null) {
                val authResponse = response.body()!!
                Log.d(TAG, "Login success: ${authResponse.success}, has token: ${authResponse.token != null}")
                
                if (authResponse.success && authResponse.token != null && authResponse.user != null) {
                    tokenManager.saveToken(authResponse.token)
                    tokenManager.saveUser(authResponse.user)
                    Log.d(TAG, "Token and user saved")
                }
                emit(Resource.Success(authResponse))
            } else {
                val errorBody = response.errorBody()?.string()
                Log.e(TAG, "Login failed: ${response.code()} - $errorBody")
                
                // Try to parse error message from JSON
                val errorMessage = try {
                    errorBody?.let { 
                        if (it.contains("message")) {
                            // Extract message from JSON like {"success":false,"message":"..."}
                            val regex = """"message"\s*:\s*"([^"]+)"""".toRegex()
                            regex.find(it)?.groupValues?.get(1) ?: it
                        } else it
                    } ?: "Login failed (${response.code()})"
                } catch (e: Exception) {
                    errorBody ?: "Login failed (${response.code()})"
                }
                
                emit(Resource.Error(errorMessage))
            }
        } catch (e: SocketTimeoutException) {
            Log.e(TAG, "Login timeout", e)
            emit(Resource.Error("Connection timeout. The server may be starting up, please try again."))
        } catch (e: UnknownHostException) {
            Log.e(TAG, "No internet", e)
            emit(Resource.Error("No internet connection. Please check your network."))
        } catch (e: Exception) {
            Log.e(TAG, "Login error", e)
            emit(Resource.Error(e.message ?: "Network error: ${e.javaClass.simpleName}"))
        }
    }
    
    fun register(request: RegisterRequest): Flow<Resource<AuthResponse>> = flow {
        emit(Resource.Loading())
        Log.d(TAG, "Attempting registration for: ${request.email}")
        
        try {
            val response = apiService.register(request)
            Log.d(TAG, "Register response code: ${response.code()}")
            
            if (response.isSuccessful && response.body() != null) {
                val authResponse = response.body()!!
                if (authResponse.success && authResponse.token != null && authResponse.user != null) {
                    tokenManager.saveToken(authResponse.token)
                    tokenManager.saveUser(authResponse.user)
                }
                emit(Resource.Success(authResponse))
            } else {
                val errorBody = response.errorBody()?.string()
                Log.e(TAG, "Register failed: ${response.code()} - $errorBody")
                
                val errorMessage = try {
                    errorBody?.let { 
                        if (it.contains("message")) {
                            val regex = """"message"\s*:\s*"([^"]+)"""".toRegex()
                            regex.find(it)?.groupValues?.get(1) ?: it
                        } else it
                    } ?: "Registration failed (${response.code()})"
                } catch (e: Exception) {
                    errorBody ?: "Registration failed (${response.code()})"
                }
                
                emit(Resource.Error(errorMessage))
            }
        } catch (e: SocketTimeoutException) {
            Log.e(TAG, "Register timeout", e)
            emit(Resource.Error("Connection timeout. Please try again."))
        } catch (e: UnknownHostException) {
            Log.e(TAG, "No internet", e)
            emit(Resource.Error("No internet connection. Please check your network."))
        } catch (e: Exception) {
            Log.e(TAG, "Register error", e)
            emit(Resource.Error(e.message ?: "Network error: ${e.javaClass.simpleName}"))
        }
    }
    
    fun getCurrentUser(): Flow<Resource<AuthResponse>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.getCurrentUser()
            if (response.isSuccessful && response.body() != null) {
                val authResponse = response.body()!!
                if (authResponse.success && authResponse.user != null) {
                    tokenManager.saveUser(authResponse.user)
                }
                emit(Resource.Success(authResponse))
            } else {
                emit(Resource.Error("Failed to get user"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Get current user error", e)
            emit(Resource.Error(e.message ?: "Network error"))
        }
    }
    
    suspend fun logout() {
        try {
            apiService.logout()
        } catch (_: Exception) {
            // Ignore logout API errors
        }
        tokenManager.clearAll()
    }
    
    fun getStoredUser(): Flow<User?> = tokenManager.getUser()
    
    fun isLoggedIn(): Flow<Boolean> = tokenManager.isLoggedIn()
    
    fun searchOrganizations(query: String): Flow<Resource<List<OrganizationSearchResult>>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.searchOrganizations(query)
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.organizations))
            } else {
                emit(Resource.Error("Search failed"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Search error", e)
            emit(Resource.Error(e.message ?: "Network error"))
        }
    }
}
