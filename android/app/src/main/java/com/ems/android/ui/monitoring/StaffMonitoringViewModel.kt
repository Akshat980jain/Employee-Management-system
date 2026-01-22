package com.ems.android.ui.monitoring

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
class StaffMonitoringViewModel @Inject constructor(
    private val repository: EmployeeRepository
) : ViewModel() {
    
    private val _staffData = MutableStateFlow<List<StaffAttendance>>(emptyList())
    val staffData: StateFlow<List<StaffAttendance>> = _staffData.asStateFlow()
    
    private val _departments = MutableStateFlow<List<DepartmentDetails>>(emptyList())
    val departments: StateFlow<List<DepartmentDetails>> = _departments.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _selectedDepartment = MutableStateFlow<String?>(null)
    val selectedDepartment: StateFlow<String?> = _selectedDepartment.asStateFlow()
    
    private val _selectedRole = MutableStateFlow<String?>(null)
    val selectedRole: StateFlow<String?> = _selectedRole.asStateFlow()
    
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()
    
    init {
        loadDepartments()
        loadStaffData()
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
    
    fun loadStaffData() {
        viewModelScope.launch {
            repository.getStaffMonitoring(
                department = _selectedDepartment.value,
                role = _selectedRole.value
            ).collect { result ->
                when (result) {
                    is Resource.Loading -> _isLoading.value = true
                    is Resource.Success -> {
                        _staffData.value = result.data ?: emptyList()
                        _isLoading.value = false
                    }
                    is Resource.Error -> _isLoading.value = false
                }
            }
        }
    }
    
    fun setDepartmentFilter(deptId: String?) {
        _selectedDepartment.value = deptId
        loadStaffData()
    }
    
    fun setRoleFilter(role: String?) {
        _selectedRole.value = role
        loadStaffData()
    }
    
    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }
    
    val filteredStaffData: StateFlow<List<StaffAttendance>> = combine(
        _staffData,
        _searchQuery
    ) { staff, query ->
        if (query.isBlank()) {
            staff
        } else {
            staff.filter { 
                "${it.employee.firstName} ${it.employee.lastName}"
                    .contains(query, ignoreCase = true)
            }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}
