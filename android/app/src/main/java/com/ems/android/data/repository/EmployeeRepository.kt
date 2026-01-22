package com.ems.android.data.repository

import com.ems.android.data.api.ApiService
import com.ems.android.data.models.*
import com.ems.android.utils.Resource
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class EmployeeRepository @Inject constructor(
    private val apiService: ApiService
) {
    
    fun getEmployees(
        search: String? = null,
        department: String? = null,
        status: String? = null
    ): Flow<Resource<List<EmployeeDetail>>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.getEmployees(search, department, status)
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.employees))
            } else {
                emit(Resource.Error("Failed to load employees"))
            }
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Network error"))
        }
    }
    
    fun getEmployeeById(employeeId: String): Flow<Resource<EmployeeDetail>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.getEmployeeById(employeeId)
            if (response.isSuccessful && response.body()?.employee != null) {
                emit(Resource.Success(response.body()!!.employee!!))
            } else {
                emit(Resource.Error("Employee not found"))
            }
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Network error"))
        }
    }
    
    suspend fun createEmployee(request: CreateEmployeeRequest): Resource<EmployeeDetail> {
        return try {
            val response = apiService.createEmployee(request)
            if (response.isSuccessful && response.body()?.employee != null) {
                Resource.Success(response.body()!!.employee!!)
            } else {
                Resource.Error("Failed to create employee")
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    suspend fun updateEmployee(employeeId: String, request: UpdateEmployeeRequest): Resource<EmployeeDetail> {
        return try {
            val response = apiService.updateEmployee(employeeId, request)
            if (response.isSuccessful && response.body()?.employee != null) {
                Resource.Success(response.body()!!.employee!!)
            } else {
                Resource.Error("Failed to update employee")
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    suspend fun deactivateEmployee(employeeId: String): Resource<Boolean> {
        return try {
            val response = apiService.deactivateEmployee(employeeId)
            if (response.isSuccessful) {
                Resource.Success(true)
            } else {
                Resource.Error("Failed to deactivate employee")
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    // Department operations
    fun getDepartments(): Flow<Resource<List<DepartmentDetails>>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.getDepartments()
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.departments))
            } else {
                emit(Resource.Error("Failed to load departments"))
            }
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Network error"))
        }
    }
    
    suspend fun createDepartment(name: String, description: String?): Resource<DepartmentDetails> {
        return try {
            val response = apiService.createDepartment(CreateDepartmentRequest(name, description))
            if (response.isSuccessful && response.body()?.department != null) {
                Resource.Success(response.body()!!.department!!)
            } else {
                Resource.Error("Failed to create department")
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    suspend fun updateDepartment(deptId: String, name: String, description: String?): Resource<DepartmentDetails> {
        return try {
            val response = apiService.updateDepartment(deptId, CreateDepartmentRequest(name, description))
            if (response.isSuccessful && response.body()?.department != null) {
                Resource.Success(response.body()!!.department!!)
            } else {
                Resource.Error("Failed to update department")
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    suspend fun deleteDepartment(deptId: String): Resource<Boolean> {
        return try {
            val response = apiService.deleteDepartment(deptId)
            if (response.isSuccessful) {
                Resource.Success(true)
            } else {
                Resource.Error("Failed to delete department")
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    // Transfer operations
    fun getIncomingTransfers(): Flow<Resource<List<TransferRequest>>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.getIncomingTransfers()
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.requests))
            } else {
                emit(Resource.Error("Failed to load transfers"))
            }
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Network error"))
        }
    }
    
    suspend fun approveTransfer(requestId: String): Resource<Boolean> {
        return try {
            val response = apiService.approveTransferRequest(requestId)
            if (response.isSuccessful) {
                Resource.Success(true)
            } else {
                Resource.Error("Failed to approve transfer")
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    suspend fun rejectTransfer(requestId: String): Resource<Boolean> {
        return try {
            val response = apiService.rejectTransferRequest(requestId)
            if (response.isSuccessful) {
                Resource.Success(true)
            } else {
                Resource.Error("Failed to reject transfer")
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    // Staff Monitoring
    fun getStaffMonitoring(
        department: String? = null,
        role: String? = null
    ): Flow<Resource<List<StaffAttendance>>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.getStaffMonitoring(department, role)
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.data))
            } else {
                emit(Resource.Error("Failed to load staff data"))
            }
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Network error"))
        }
    }
}
