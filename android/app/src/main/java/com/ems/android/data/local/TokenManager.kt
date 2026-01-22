package com.ems.android.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.ems.android.data.models.User
import com.squareup.moshi.Moshi
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "ems_preferences")

@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val moshi: Moshi
) {
    companion object {
        private val TOKEN_KEY = stringPreferencesKey("auth_token")
        private val USER_KEY = stringPreferencesKey("user_data")
    }
    
    fun getToken(): Flow<String?> {
        return context.dataStore.data.map { preferences ->
            preferences[TOKEN_KEY]
        }
    }
    
    suspend fun saveToken(token: String) {
        context.dataStore.edit { preferences ->
            preferences[TOKEN_KEY] = token
        }
    }
    
    suspend fun clearToken() {
        context.dataStore.edit { preferences ->
            preferences.remove(TOKEN_KEY)
        }
    }
    
    fun getUser(): Flow<User?> {
        return context.dataStore.data.map { preferences ->
            preferences[USER_KEY]?.let { json ->
                try {
                    moshi.adapter(User::class.java).fromJson(json)
                } catch (e: Exception) {
                    null
                }
            }
        }
    }
    
    suspend fun saveUser(user: User) {
        val json = moshi.adapter(User::class.java).toJson(user)
        context.dataStore.edit { preferences ->
            preferences[USER_KEY] = json
        }
    }
    
    suspend fun clearUser() {
        context.dataStore.edit { preferences ->
            preferences.remove(USER_KEY)
        }
    }
    
    suspend fun clearAll() {
        context.dataStore.edit { preferences ->
            preferences.clear()
        }
    }
    
    fun isLoggedIn(): Flow<Boolean> {
        return getToken().map { it != null }
    }
}
