package com.ems.android.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ems.android.data.models.RegisterRequest
import com.ems.android.data.models.User
import com.ems.android.data.repository.AuthRepository
import com.ems.android.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LoginUiState(
    val email: String = "",
    val password: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
    val isLoggedIn: Boolean = false,
    val pendingApproval: Boolean = false,
    val user: User? = null
)

data class RegisterUiState(
    val email: String = "",
    val password: String = "",
    val confirmPassword: String = "",
    val firstName: String = "",
    val lastName: String = "",
    val role: String = "EMPLOYEE",
    val organizationChoice: String = "JOIN_EXISTING",
    val organizationId: String? = null,
    val organizationName: String = "",
    val industry: String = "",
    val size: String = "",
    val message: String = "",
    val searchQuery: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
    val isRegistered: Boolean = false,
    val pendingApproval: Boolean = false
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _loginState = MutableStateFlow(LoginUiState())
    val loginState: StateFlow<LoginUiState> = _loginState.asStateFlow()
    
    private val _registerState = MutableStateFlow(RegisterUiState())
    val registerState: StateFlow<RegisterUiState> = _registerState.asStateFlow()
    
    private val _organizations = MutableStateFlow<List<com.ems.android.data.models.OrganizationSearchResult>>(emptyList())
    val organizations: StateFlow<List<com.ems.android.data.models.OrganizationSearchResult>> = _organizations.asStateFlow()
    
    init {
        checkLoginStatus()
    }
    
    private fun checkLoginStatus() {
        viewModelScope.launch {
            authRepository.isLoggedIn().collect { isLoggedIn ->
                if (isLoggedIn) {
                    authRepository.getStoredUser().collect { user ->
                        _loginState.update { it.copy(isLoggedIn = true, user = user) }
                    }
                }
            }
        }
    }
    
    // Login functions
    fun updateLoginEmail(email: String) {
        _loginState.update { it.copy(email = email, error = null) }
    }
    
    fun updateLoginPassword(password: String) {
        _loginState.update { it.copy(password = password, error = null) }
    }
    
    fun login() {
        val state = _loginState.value
        if (state.email.isBlank() || state.password.isBlank()) {
            _loginState.update { it.copy(error = "Please fill all fields") }
            return
        }
        
        viewModelScope.launch {
            authRepository.login(state.email, state.password).collect { result ->
                when (result) {
                    is Resource.Loading -> {
                        _loginState.update { it.copy(isLoading = true, error = null) }
                    }
                    is Resource.Success -> {
                        val response = result.data
                        val accessToken = response?.getAccessToken()
                        val userData = response?.getUserData()
                        _loginState.update { 
                            it.copy(
                                isLoading = false,
                                isLoggedIn = response?.success == true && accessToken != null,
                                pendingApproval = response?.isPendingVerification() == true,
                                user = userData,
                                error = if (response?.success != true) response?.message else null
                            )
                        }
                    }
                    is Resource.Error -> {
                        _loginState.update { it.copy(isLoading = false, error = result.message) }
                    }
                }
            }
        }
    }
    
    // Register functions
    fun updateRegisterField(
        email: String? = null,
        password: String? = null,
        confirmPassword: String? = null,
        firstName: String? = null,
        lastName: String? = null,
        role: String? = null,
        organizationChoice: String? = null,
        organizationId: String? = null,
        organizationName: String? = null,
        industry: String? = null,
        size: String? = null,
        message: String? = null
    ) {
        _registerState.update { current ->
            current.copy(
                email = email ?: current.email,
                password = password ?: current.password,
                confirmPassword = confirmPassword ?: current.confirmPassword,
                firstName = firstName ?: current.firstName,
                lastName = lastName ?: current.lastName,
                role = role ?: current.role,
                organizationChoice = organizationChoice ?: current.organizationChoice,
                organizationId = organizationId ?: current.organizationId,
                organizationName = organizationName ?: current.organizationName,
                industry = industry ?: current.industry,
                size = size ?: current.size,
                message = message ?: current.message,
                error = null
            )
        }
    }
    
    fun searchOrganizations(query: String) {
        _registerState.update { it.copy(searchQuery = query) }
        if (query.length < 2) {
            _organizations.value = emptyList()
            return
        }
        
        viewModelScope.launch {
            authRepository.searchOrganizations(query).collect { result ->
                when (result) {
                    is Resource.Success -> {
                        _organizations.value = result.data ?: emptyList()
                    }
                    else -> {}
                }
            }
        }
    }
    
    fun register() {
        val state = _registerState.value
        
        // Validation
        if (state.firstName.isBlank() || state.lastName.isBlank() || 
            state.email.isBlank() || state.password.isBlank()) {
            _registerState.update { it.copy(error = "Please fill all required fields") }
            return
        }
        
        if (state.password != state.confirmPassword) {
            _registerState.update { it.copy(error = "Passwords do not match") }
            return
        }
        
        if (state.role == "ADMIN" && state.organizationChoice == "CREATE_NEW" && state.organizationName.isBlank()) {
            _registerState.update { it.copy(error = "Please enter organization name") }
            return
        }
        
        if (state.organizationChoice == "JOIN_EXISTING" && state.organizationId == null) {
            _registerState.update { it.copy(error = "Please select an organization") }
            return
        }
        
        val request = RegisterRequest(
            email = state.email,
            password = state.password,
            firstName = state.firstName,
            lastName = state.lastName,
            role = state.role,
            organizationChoice = state.organizationChoice,
            organizationId = state.organizationId,
            organizationName = if (state.organizationChoice == "CREATE_NEW") state.organizationName else null,
            industry = if (state.organizationChoice == "CREATE_NEW") state.industry.ifBlank { null } else null,
            size = if (state.organizationChoice == "CREATE_NEW") state.size.ifBlank { null } else null,
            message = state.message.ifBlank { null }
        )
        
        viewModelScope.launch {
            authRepository.register(request).collect { result ->
                when (result) {
                    is Resource.Loading -> {
                        _registerState.update { it.copy(isLoading = true, error = null) }
                    }
                    is Resource.Success -> {
                        val response = result.data
                        _registerState.update { 
                            it.copy(
                                isLoading = false,
                                isRegistered = response?.success == true,
                                pendingApproval = response?.isPendingVerification() == true,
                                error = if (response?.success != true) response?.message else null
                            )
                        }
                    }
                    is Resource.Error -> {
                        _registerState.update { it.copy(isLoading = false, error = result.message) }
                    }
                }
            }
        }
    }
    
    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _loginState.value = LoginUiState()
            _registerState.value = RegisterUiState()
        }
    }
    
    fun clearError() {
        _loginState.update { it.copy(error = null) }
        _registerState.update { it.copy(error = null) }
    }
}
