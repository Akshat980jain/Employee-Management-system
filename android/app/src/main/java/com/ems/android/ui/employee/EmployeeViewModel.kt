package com.ems.android.ui.employee

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
class EmployeeViewModel @Inject constructor(
    private val repository: EmployeeRepository,
    private val apiService: ApiService
) : ViewModel() {
    
    private val _employees = MutableStateFlow<List<EmployeeDetail>>(emptyList())
    val employees: StateFlow<List<EmployeeDetail>> = _employees.asStateFlow()
    
    private val _selectedEmployee = MutableStateFlow<EmployeeDetail?>(null)
    val selectedEmployee: StateFlow<EmployeeDetail?> = _selectedEmployee.asStateFlow()
    
    private val _departments = MutableStateFlow<List<DepartmentDetails>>(emptyList())
    val departments: StateFlow<List<DepartmentDetails>> = _departments.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    private val _actionResult = MutableStateFlow<String?>(null)
    val actionResult: StateFlow<String?> = _actionResult.asStateFlow()
    
    // Filters
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()
    
    private val _selectedDepartment = MutableStateFlow<String?>(null)
    val selectedDepartment: StateFlow<String?> = _selectedDepartment.asStateFlow()
    
    private val _selectedStatus = MutableStateFlow<String?>(null)
    val selectedStatus: StateFlow<String?> = _selectedStatus.asStateFlow()
    
    init {
        loadDepartments()
        loadEmployees()
    }
    
    fun loadEmployees() {
        viewModelScope.launch {
            repository.getEmployees(
                search = _searchQuery.value.takeIf { it.isNotBlank() },
                department = _selectedDepartment.value,
                status = _selectedStatus.value
            ).collect { result ->
                when (result) {
                    is Resource.Loading -> _isLoading.value = true
                    is Resource.Success -> {
                        _employees.value = result.data ?: emptyList()
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
    
    fun loadDepartments() {
        viewModelScope.launch {
            repository.getDepartments().collect { result ->
                if (result is Resource.Success) {
                    _departments.value = result.data ?: emptyList()
                }
            }
        }
    }
    
    fun loadEmployeeDetail(employeeId: String) {
        viewModelScope.launch {
            repository.getEmployeeById(employeeId).collect { result ->
                when (result) {
                    is Resource.Loading -> _isLoading.value = true
                    is Resource.Success -> {
                        _selectedEmployee.value = result.data
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
    
    fun setSearchQuery(query: String) {
        _searchQuery.value = query
        loadEmployees()
    }
    
    fun setDepartmentFilter(departmentId: String?) {
        _selectedDepartment.value = departmentId
        loadEmployees()
    }
    
    fun setStatusFilter(status: String?) {
        _selectedStatus.value = status
        loadEmployees()
    }
    
    fun createEmployee(
        firstName: String,
        lastName: String,
        email: String,
        password: String,
        role: String,
        phone: String?,
        departmentId: String?
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = repository.createEmployee(
                CreateEmployeeRequest(
                    firstName = firstName,
                    lastName = lastName,
                    email = email,
                    password = password,
                    role = role,
                    phone = phone,
                    departmentId = departmentId
                )
            )
            when (result) {
                is Resource.Success -> {
                    _actionResult.value = "Employee created successfully"
                    loadEmployees()
                }
                is Resource.Error -> _error.value = result.message
                else -> {}
            }
            _isLoading.value = false
        }
    }
    
    fun updateEmployee(
        employeeId: String,
        firstName: String?,
        lastName: String?,
        phone: String?,
        departmentId: String?
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = repository.updateEmployee(
                employeeId,
                UpdateEmployeeRequest(
                    firstName = firstName,
                    lastName = lastName,
                    phone = phone,
                    departmentId = departmentId
                )
            )
            when (result) {
                is Resource.Success -> {
                    _actionResult.value = "Employee updated successfully"
                    _selectedEmployee.value = result.data
                    loadEmployees()
                }
                is Resource.Error -> _error.value = result.message
                else -> {}
            }
            _isLoading.value = false
        }
    }
    
    fun deactivateEmployee(employeeId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = repository.deactivateEmployee(employeeId)
            when (result) {
                is Resource.Success -> {
                    _actionResult.value = "Employee deactivated"
                    loadEmployees()
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
    
    fun clearSelectedEmployee() {
        _selectedEmployee.value = null
    }
}
