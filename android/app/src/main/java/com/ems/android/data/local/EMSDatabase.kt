package com.ems.android.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.ems.android.data.local.dao.*
import com.ems.android.data.local.entity.*

@Database(
    entities = [
        UserEntity::class,
        AttendanceEntity::class,
        LeaveRequestEntity::class,
        LeaveBalanceEntity::class,
        DepartmentEntity::class,
        HolidayEntity::class,
        PendingActionEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class EMSDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun attendanceDao(): AttendanceDao
    abstract fun leaveDao(): LeaveDao
    abstract fun generalDao(): GeneralDao
    abstract fun pendingActionDao(): PendingActionDao
}
