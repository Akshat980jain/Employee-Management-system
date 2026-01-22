package com.ems.android.ui.transfer

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ems.android.data.api.ApiService
import com.ems.android.data.models.*
import com.ems.android.data.repository.EmployeeRepository
import com.ems.android.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class TransferViewModel @Inject constructor(
    private val apiService: ApiService,
    private val repository: EmployeeRepository
) : ViewModel() {
    
    private val _incomingTransfers = MutableStateFlow<List<TransferRequest>>(emptyList())
    val incomingTransfers: StateFlow<List<TransferRequest>> = _incomingTransfers.asStateFlow()
    
    private val _myTransfers = MutableStateFlow<List<TransferRequest>>(emptyList())
    val myTransfers: StateFlow<List<TransferRequest>> = _myTransfers.asStateFlow()
    
    private val _organizations = MutableStateFlow<List<OrganizationSearchResult>>(emptyList())
    val organizations: StateFlow<List<OrganizationSearchResult>> = _organizations.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _actionResult = MutableStateFlow<String?>(null)
    val actionResult: StateFlow<String?> = _actionResult.asStateFlow()
    
    init {
        loadIncomingTransfers()
    }
    
    fun loadIncomingTransfers() {
        viewModelScope.launch {
            repository.getIncomingTransfers().collect { result ->
                when (result) {
                    is Resource.Loading -> _isLoading.value = true
                    is Resource.Success -> {
                        _incomingTransfers.value = result.data ?: emptyList()
                        _isLoading.value = false
                    }
                    is Resource.Error -> _isLoading.value = false
                }
            }
        }
    }
    
    fun loadMyTransfers() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = apiService.getMyTransferRequests()
                if (response.isSuccessful && response.body() != null) {
                    _myTransfers.value = response.body()!!.requests
                }
            } catch (_: Exception) {}
            _isLoading.value = false
        }
    }
    
    fun searchOrganizations(query: String) {
        if (query.length < 2) return
        viewModelScope.launch {
            try {
                val response = apiService.searchOrganizations(query)
                if (response.isSuccessful && response.body() != null) {
                    _organizations.value = response.body()!!.organizations
                }
            } catch (_: Exception) {}
        }
    }
    
    fun createTransferRequest(toOrgId: String, message: String?) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = apiService.createTransferRequest(
                    CreateTransferRequest(toOrgId, message)
                )
                if (response.isSuccessful) {
                    _actionResult.value = "Transfer request submitted"
                    loadMyTransfers()
                } else {
                    _actionResult.value = "Failed to submit request"
                }
            } catch (e: Exception) {
                _actionResult.value = e.message
            }
            _isLoading.value = false
        }
    }
    
    fun approveTransfer(requestId: String) {
        viewModelScope.launch {
            val result = repository.approveTransfer(requestId)
            when (result) {
                is Resource.Success -> {
                    _actionResult.value = "Transfer approved"
                    _incomingTransfers.update { list ->
                        list.filter { it.id != requestId }
                    }
                }
                is Resource.Error -> _actionResult.value = result.message
                else -> {}
            }
        }
    }
    
    fun rejectTransfer(requestId: String) {
        viewModelScope.launch {
            val result = repository.rejectTransfer(requestId)
            when (result) {
                is Resource.Success -> {
                    _actionResult.value = "Transfer rejected"
                    _incomingTransfers.update { list ->
                        list.filter { it.id != requestId }
                    }
                }
                is Resource.Error -> _actionResult.value = result.message
                else -> {}
            }
        }
    }
    
    fun clearActionResult() {
        _actionResult.value = null
    }
}
