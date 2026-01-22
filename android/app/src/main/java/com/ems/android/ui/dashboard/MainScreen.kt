package com.ems.android.ui.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.ems.android.ui.attendance.AttendanceScreen
import com.ems.android.ui.department.DepartmentScreen
import com.ems.android.ui.employee.AddEditEmployeeScreen
import com.ems.android.ui.employee.EmployeeDetailScreen
import com.ems.android.ui.employee.EmployeeListScreen
import com.ems.android.ui.joinrequest.JoinRequestScreen
import com.ems.android.ui.leave.LeaveScreen
import com.ems.android.ui.monitoring.StaffMonitoringScreen
import com.ems.android.ui.settings.SettingsScreen
import com.ems.android.ui.transfer.IncomingTransfersScreen
import kotlinx.coroutines.launch

data class BottomNavItem(
    val route: String,
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
)

data class DrawerItem(
    val route: String,
    val title: String,
    val icon: ImageVector
)

val bottomNavItems = listOf(
    BottomNavItem(
        route = "dashboard",
        title = "Dashboard",
        selectedIcon = Icons.Filled.Home,
        unselectedIcon = Icons.Outlined.Home
    ),
    BottomNavItem(
        route = "attendance",
        title = "Attendance",
        selectedIcon = Icons.Filled.AccessTime,
        unselectedIcon = Icons.Outlined.AccessTime
    ),
    BottomNavItem(
        route = "leave",
        title = "Leave",
        selectedIcon = Icons.Filled.EventNote,
        unselectedIcon = Icons.Outlined.EventNote
    ),
    BottomNavItem(
        route = "more",
        title = "More",
        selectedIcon = Icons.Filled.Menu,
        unselectedIcon = Icons.Outlined.Menu
    )
)

val drawerItems = listOf(
    DrawerItem("employees", "Employees", Icons.Default.People),
    DrawerItem("departments", "Departments", Icons.Default.AccountTree),
    DrawerItem("join_requests", "Join Requests", Icons.Default.PersonAdd),
    DrawerItem("staff_monitoring", "Staff Monitoring", Icons.Default.Insights),
    DrawerItem("transfers", "Transfers", Icons.Default.SwapHoriz),
    DrawerItem("settings", "Settings", Icons.Default.Settings)
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    onLogout: () -> Unit,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination
    val user by viewModel.user.collectAsState()
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    
    val isHROrAdmin = user?.role in listOf("ADMIN", "HR_MANAGER")
    
    // Modal Navigation Drawer for HR/Admin
    ModalNavigationDrawer(
        drawerState = drawerState,
        gesturesEnabled = isHROrAdmin,
        drawerContent = {
            if (isHROrAdmin) {
                ModalDrawerSheet {
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Drawer Header
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Icon(
                            Icons.Default.Person,
                            contentDescription = null,
                            modifier = Modifier.size(48.dp),
                            tint = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "${user?.firstName} ${user?.lastName}",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = when (user?.role) {
                                "ADMIN" -> "Administrator"
                                "HR_MANAGER" -> "HR Manager"
                                else -> "Employee"
                            },
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                    
                    // Drawer Items
                    drawerItems.forEach { item ->
                        NavigationDrawerItem(
                            icon = { Icon(item.icon, contentDescription = null) },
                            label = { Text(item.title) },
                            selected = currentDestination?.route == item.route,
                            onClick = {
                                scope.launch { drawerState.close() }
                                navController.navigate(item.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            modifier = Modifier.padding(horizontal = 12.dp)
                        )
                    }
                    
                    Spacer(modifier = Modifier.weight(1f))
                    
                    HorizontalDivider()
                    
                    // Profile & Logout
                    NavigationDrawerItem(
                        icon = { Icon(Icons.Default.Person, contentDescription = null) },
                        label = { Text("Profile") },
                        selected = currentDestination?.route == "profile",
                        onClick = {
                            scope.launch { drawerState.close() }
                            navController.navigate("profile") {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        modifier = Modifier.padding(horizontal = 12.dp)
                    )
                    
                    NavigationDrawerItem(
                        icon = { Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = null) },
                        label = { Text("Sign Out") },
                        selected = false,
                        onClick = {
                            scope.launch {
                                drawerState.close()
                                viewModel.logout()
                                onLogout()
                            }
                        },
                        modifier = Modifier.padding(horizontal = 12.dp),
                        colors = NavigationDrawerItemDefaults.colors(
                            unselectedIconColor = MaterialTheme.colorScheme.error,
                            unselectedTextColor = MaterialTheme.colorScheme.error
                        )
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
    ) {
        Scaffold(
            bottomBar = {
                NavigationBar {
                    bottomNavItems.forEach { item ->
                        val selected = when (item.route) {
                            "more" -> drawerItems.any { currentDestination?.route == it.route } || 
                                     currentDestination?.route == "profile" ||
                                     currentDestination?.route?.startsWith("employee") == true
                            else -> currentDestination?.hierarchy?.any { it.route == item.route } == true
                        }
                        
                        NavigationBarItem(
                            icon = {
                                Icon(
                                    if (selected) item.selectedIcon else item.unselectedIcon,
                                    contentDescription = item.title
                                )
                            },
                            label = { Text(item.title) },
                            selected = selected,
                            onClick = {
                                if (item.route == "more" && isHROrAdmin) {
                                    scope.launch { drawerState.open() }
                                } else if (item.route == "more") {
                                    navController.navigate("profile") {
                                        popUpTo(navController.graph.findStartDestination().id) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                } else {
                                    navController.navigate(item.route) {
                                        popUpTo(navController.graph.findStartDestination().id) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            }
                        )
                    }
                }
            }
        ) { paddingValues ->
            NavHost(
                navController = navController,
                startDestination = "dashboard",
                modifier = Modifier.padding(paddingValues)
            ) {
                composable("dashboard") {
                    when (user?.role) {
                        "ADMIN" -> AdminDashboard(onLogout = onLogout)
                        "HR_MANAGER" -> HRDashboard(onLogout = onLogout)
                        else -> EmployeeDashboard(onLogout = onLogout)
                    }
                }
                
                composable("attendance") {
                    AttendanceScreen()
                }
                
                composable("leave") {
                    LeaveScreen()
                }
                
                composable("profile") {
                    ProfileScreen(onLogout = onLogout)
                }
                
                // Admin/HR Screens
                composable("employees") {
                    EmployeeListScreen(
                        onNavigateBack = { navController.popBackStack() },
                        onEmployeeClick = { id -> navController.navigate("employee_detail/$id") },
                        onAddEmployee = { navController.navigate("employee_add") }
                    )
                }
                
                composable(
                    route = "employee_detail/{employeeId}",
                    arguments = listOf(navArgument("employeeId") { type = NavType.StringType })
                ) { backStackEntry ->
                    val employeeId = backStackEntry.arguments?.getString("employeeId") ?: ""
                    EmployeeDetailScreen(
                        employeeId = employeeId,
                        onNavigateBack = { navController.popBackStack() },
                        onEdit = { id -> navController.navigate("employee_edit/$id") }
                    )
                }
                
                composable("employee_add") {
                    AddEditEmployeeScreen(
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
                
                composable(
                    route = "employee_edit/{employeeId}",
                    arguments = listOf(navArgument("employeeId") { type = NavType.StringType })
                ) { backStackEntry ->
                    val employeeId = backStackEntry.arguments?.getString("employeeId") ?: ""
                    AddEditEmployeeScreen(
                        employeeId = employeeId,
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
                
                composable("departments") {
                    DepartmentScreen(
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
                
                composable("join_requests") {
                    JoinRequestScreen(
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
                
                composable("staff_monitoring") {
                    StaffMonitoringScreen(
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
                
                composable("transfers") {
                    IncomingTransfersScreen(
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
                
                composable("settings") {
                    SettingsScreen(
                        onNavigateBack = { navController.popBackStack() },
                        onLogout = onLogout
                    )
                }
            }
        }
    }
}
