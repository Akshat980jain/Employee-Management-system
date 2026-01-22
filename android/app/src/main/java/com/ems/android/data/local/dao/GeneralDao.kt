package com.ems.android.data.local.dao

import androidx.room.*
import com.ems.android.data.local.entity.DepartmentEntity
import com.ems.android.data.local.entity.HolidayEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface GeneralDao {
    // Departments
    @Query("SELECT * FROM departments ORDER BY name ASC")
    fun getAllDepartments(): Flow<List<DepartmentEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAllDepartments(departments: List<DepartmentEntity>)
    
    @Query("DELETE FROM departments")
    suspend fun clearAllDepartments()
    
    // Holidays
    @Query("SELECT * FROM holidays ORDER BY date ASC")
    fun getAllHolidays(): Flow<List<HolidayEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAllHolidays(holidays: List<HolidayEntity>)
    
    @Query("DELETE FROM holidays")
    suspend fun clearAllHolidays()
}
