package com.ems.android.ui.department

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ems.android.data.models.*
import com.ems.android.data.repository.EmployeeRepository
import com.ems.android.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DepartmentViewModel @Inject constructor(
    private val repository: EmployeeRepository
) : ViewModel() {
    
    private val _departments = MutableStateFlow<List<DepartmentDetails>>(emptyList())
    val departments: StateFlow<List<DepartmentDetails>> = _departments.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    private val _actionResult = MutableStateFlow<String?>(null)
    val actionResult: StateFlow<String?> = _actionResult.asStateFlow()
    
    init {
        loadDepartments()
    }
    
    fun loadDepartments() {
        viewModelScope.launch {
            repository.getDepartments().collect { result ->
                when (result) {
                    is Resource.Loading -> _isLoading.value = true
                    is Resource.Success -> {
                        _departments.value = result.data ?: emptyList()
                        _isLoading.value = false
                    }
                    is Resource.Error -> {
                        _error.value = result.message
                        _isLoading.value = false
                    }
                }
            }
        }
    }
    
    fun createDepartment(name: String, description: String?) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = repository.createDepartment(name, description)
            when (result) {
                is Resource.Success -> {
                    _actionResult.value = "Department created"
                    loadDepartments()
                }
                is Resource.Error -> _error.value = result.message
                else -> {}
            }
            _isLoading.value = false
        }
    }
    
    fun updateDepartment(deptId: String, name: String, description: String?) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = repository.updateDepartment(deptId, name, description)
            when (result) {
                is Resource.Success -> {
                    _actionResult.value = "Department updated"
                    loadDepartments()
                }
                is Resource.Error -> _error.value = result.message
                else -> {}
            }
            _isLoading.value = false
        }
    }
    
    fun deleteDepartment(deptId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = repository.deleteDepartment(deptId)
            when (result) {
                is Resource.Success -> {
                    _actionResult.value = "Department deleted"
                    loadDepartments()
                }
                is Resource.Error -> _error.value = result.message
                else -> {}
            }
            _isLoading.value = false
        }
    }
    
    fun clearError() {
        _error.value = null
    }
    
    fun clearActionResult() {
        _actionResult.value = null
    }
}
