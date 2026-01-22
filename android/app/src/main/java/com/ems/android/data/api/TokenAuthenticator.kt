package com.ems.android.data.api

import com.ems.android.data.local.TokenManager
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.Authenticator
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Handles automatic token refresh on 401 Unauthorized responses.
 * Clears tokens and forces re-login when refresh fails.
 */
@Singleton
class TokenAuthenticator @Inject constructor(
    private val tokenManager: TokenManager
) : Authenticator {
    
    override fun authenticate(route: Route?, response: Response): Request? {
        // If we've already tried to authenticate and failed, don't retry
        if (response.request.header("Authorization") != null && responseCount(response) >= 2) {
            // Clear tokens and return null to trigger re-login
            runBlocking { tokenManager.clearAll() }
            return null
        }
        
        val token = runBlocking { tokenManager.getToken().first() }
        
        // If no token, we can't authenticate
        if (token == null) {
            return null
        }
        
        // Retry with token
        return response.request.newBuilder()
            .header("Authorization", "Bearer $token")
            .build()
    }
    
    private fun responseCount(response: Response): Int {
        var count = 1
        var prior = response.priorResponse
        while (prior != null) {
            count++
            prior = prior.priorResponse
        }
        return count
    }
}
