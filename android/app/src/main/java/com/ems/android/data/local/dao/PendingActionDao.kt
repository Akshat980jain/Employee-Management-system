package com.ems.android.data.local.dao

import androidx.room.*
import com.ems.android.data.local.entity.PendingActionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface PendingActionDao {
    @Query("SELECT * FROM pending_actions ORDER BY createdAt ASC")
    fun getAllPendingActions(): Flow<List<PendingActionEntity>>
    
    @Query("SELECT * FROM pending_actions WHERE actionType = :type ORDER BY createdAt ASC")
    fun getPendingActionsByType(type: String): Flow<List<PendingActionEntity>>
    
    @Query("SELECT COUNT(*) FROM pending_actions")
    fun getPendingActionsCount(): Flow<Int>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPendingAction(action: PendingActionEntity): Long
    
    @Delete
    suspend fun deletePendingAction(action: PendingActionEntity)
    
    @Query("DELETE FROM pending_actions WHERE id = :actionId")
    suspend fun deletePendingActionById(actionId: Long)
    
    @Query("UPDATE pending_actions SET retryCount = retryCount + 1 WHERE id = :actionId")
    suspend fun incrementRetryCount(actionId: Long)
    
    @Query("DELETE FROM pending_actions")
    suspend fun clearAllPendingActions()
}
