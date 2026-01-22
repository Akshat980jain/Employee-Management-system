package com.ems.android.di

import android.content.Context
import androidx.room.Room
import androidx.work.WorkManager
import com.ems.android.data.local.EMSDatabase
import com.ems.android.data.local.dao.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    
    @Provides
    @Singleton
    fun provideDatabase(
        @ApplicationContext context: Context
    ): EMSDatabase {
        return Room.databaseBuilder(
            context,
            EMSDatabase::class.java,
            "ems_database"
        )
            .fallbackToDestructiveMigration()
            .build()
    }
    
    @Provides
    fun provideUserDao(database: EMSDatabase): UserDao {
        return database.userDao()
    }
    
    @Provides
    fun provideAttendanceDao(database: EMSDatabase): AttendanceDao {
        return database.attendanceDao()
    }
    
    @Provides
    fun provideLeaveDao(database: EMSDatabase): LeaveDao {
        return database.leaveDao()
    }
    
    @Provides
    fun provideGeneralDao(database: EMSDatabase): GeneralDao {
        return database.generalDao()
    }
    
    @Provides
    fun providePendingActionDao(database: EMSDatabase): PendingActionDao {
        return database.pendingActionDao()
    }
    
    @Provides
    @Singleton
    fun provideWorkManager(
        @ApplicationContext context: Context
    ): WorkManager {
        return WorkManager.getInstance(context)
    }
}
