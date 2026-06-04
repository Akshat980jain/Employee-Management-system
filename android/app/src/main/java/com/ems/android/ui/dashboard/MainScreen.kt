package com.ems.android.ui.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material.icons.automirrored.outlined.*
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.activity.compose.BackHandler
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
import com.ems.android.ui.payroll.PayrollScreen
import com.ems.android.ui.goals.GoalsScreen
import com.ems.android.ui.reviews.ReviewsScreen
import com.ems.android.ui.feedback.FeedbackScreen
import com.ems.android.ui.aiinsights.AIInsightsScreen
import com.ems.android.ui.chatbot.HRChatbotScreen
import com.ems.android.ui.roles.RolesManagementScreen
import com.ems.android.ui.notifications.NotificationsScreen
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
        selectedIcon = Icons.AutoMirrored.Filled.EventNote,
        unselectedIcon = Icons.AutoMirrored.Outlined.EventNote
    ),
    BottomNavItem(
        route = "settings",
        title = "Settings",
        selectedIcon = Icons.Filled.Settings,
        unselectedIcon = Icons.Outlined.Settings
    )
)

val drawerItems = listOf(
    DrawerItem("employees", "Employees", Icons.Default.People),
    DrawerItem("departments", "Departments", Icons.Default.AccountTree),
    DrawerItem("staff_monitoring", "Staff Monitoring", Icons.Default.Insights),
    DrawerItem("join_requests", "Join Requests", Icons.Default.PersonAdd),
    DrawerItem("payroll", "Payroll", Icons.Default.Payments),
    DrawerItem("goals", "Goals", Icons.Default.TrackChanges),
    DrawerItem("reviews", "Reviews", Icons.Default.RateReview),
    DrawerItem("feedback", "Feedback", Icons.Default.Feedback),
    DrawerItem("ai_insights", "AI Insights", Icons.Default.AutoAwesome),
    DrawerItem("hr_chatbot", "HR Chatbot", Icons.Default.SmartToy),
    DrawerItem("roles", "Manage Roles", Icons.Default.AdminPanelSettings),
    DrawerItem("transfers", "Transfers", Icons.Default.SwapHoriz),
    DrawerItem("settings", "Settings", Icons.Default.Settings)
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    onLogout: () -> Unit,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val user by viewModel.user.collectAsState()
    
    if (user == null) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
        return
    }

    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    
    val isHROrAdmin = user?.role in listOf("Admin", "HR Manager", "ADMIN", "HR_MANAGER")
    
    // Close drawer when device back button is pressed
    BackHandler(enabled = drawerState.isOpen) {
        scope.launch {
            drawerState.close()
        }
    }
    
    // Modal Navigation Drawer for HR/Admin
    // Disabled gestures statically to prevent Compose touch interception bug, and use custom scrim click-outside interceptor
    ModalNavigationDrawer(
        drawerState = drawerState,
        gesturesEnabled = false,
        drawerContent = {
            // Only show drawer content for HR/Admin
            if (isHROrAdmin) {
                ModalDrawerSheet {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .statusBarsPadding()
                            .navigationBarsPadding()
                    ) {
                        Spacer(modifier = Modifier.height(12.dp))

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
                                    "Admin", "ADMIN" -> "Administrator"
                                    "HR Manager", "HR_MANAGER" -> "HR Manager"
                                    else -> "Employee"
                                },
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

                        // Drawer Items
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .verticalScroll(rememberScrollState())
                        ) {
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
                        }

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

                        Spacer(modifier = Modifier.height(8.dp))
                    }
                }
            }
        }
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            Scaffold(
            bottomBar = {
                NavigationBar(
                    modifier = Modifier.height(60.dp),
                    windowInsets = WindowInsets(0, 0, 0, 0)
                ) {
                    bottomNavItems.forEach { item ->
                        val selected = currentDestination?.hierarchy?.any { it.route == item.route } == true
                        
                        NavigationBarItem(
                            icon = {
                                Icon(
                                    if (selected) item.selectedIcon else item.unselectedIcon,
                                    contentDescription = item.title,
                                    modifier = Modifier.size(20.dp)
                                )
                            },
                            label = { 
                                Text(
                                    item.title, 
                                    fontSize = 11.sp,
                                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
                                ) 
                            },
                            selected = selected,
                            alwaysShowLabel = true,
                            onClick = {
                                navController.navigate(item.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
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
                        "Admin", "ADMIN" -> AdminDashboard(
                            onLogout = onLogout,
                            onNavigateToEmployees = { navController.navigate("employees") },
                            onNavigateToStaffMonitoring = { navController.navigate("staff_monitoring") },
                            onNavigateToDepartments = { navController.navigate("departments") },
                            onNavigateToRoles = { navController.navigate("roles") },
                            onNavigateToNotifications = { navController.navigate("notifications") },
                            onNavigateToProfile = { navController.navigate("profile") },
                            onOpenDrawer = { scope.launch { drawerState.open() } }
                        )
                        "HR Manager", "HR_MANAGER" -> HRDashboard(onLogout = onLogout)
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
                
                // Full feature screens
                composable("payroll") {
                    PayrollScreen(
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
                
                composable("goals") {
                    GoalsScreen(
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
                
                composable("reviews") {
                    ReviewsScreen(
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
                
                composable("feedback") {
                    FeedbackScreen(
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
                
                composable("ai_insights") {
                    AIInsightsScreen(
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
                
                composable("hr_chatbot") {
                    HRChatbotScreen(
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
                
                composable("roles") {
                    RolesManagementScreen(
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
                
                composable("notifications") {
                    NotificationsScreen(
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
            }
            }
            
            // Custom click-outside dismiss overlay when drawer is open
            if (drawerState.isOpen) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(androidx.compose.ui.graphics.Color.Transparent)
                        .clickable(
                            interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                            indication = null
                        ) {
                            scope.launch {
                                drawerState.close()
                            }
                        }
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlaceholderScreen(
    title: String,
    description: String,
    icon: ImageVector,
    onNavigateBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.5f)
                )
                Text(
                    text = title,
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Surface(
                    color = MaterialTheme.colorScheme.primaryContainer,
                    shape = MaterialTheme.shapes.medium
                ) {
                    Text(
                        text = "Coming Soon",
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
            }
        }
    }
}
