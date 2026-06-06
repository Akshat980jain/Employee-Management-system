package com.ems.android.ui.auth

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.ui.res.painterResource
import com.ems.android.R
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.path
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.ems.android.ui.components.AppError
import com.ems.android.ui.components.ErrorDialog
import com.ems.android.ui.components.ErrorType
import com.ems.android.ui.components.LocalThemeController
import com.ems.android.ui.theme.GradientEnd
import com.ems.android.ui.theme.GradientStart
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.CustomCredential
import androidx.credentials.exceptions.GetCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import kotlinx.coroutines.launch
import android.util.Log
import com.ems.android.ui.theme.Primary
import com.ems.android.data.models.*

// Reusable Google G icon vector matching the web version
val GoogleIconVector = ImageVector.Builder(
    name = "GoogleIcon",
    defaultWidth = 18.dp,
    defaultHeight = 18.dp,
    viewportWidth = 18f,
    viewportHeight = 18f
).apply {
    path(fill = SolidColor(Color(0xFF4285F4))) {
        moveTo(16.51f, 8f)
        horizontalLineTo(8.98f)
        verticalLineTo(11.0f)
        horizontalLineTo(13.28f)
        curveTo(13.1f, 12.0f, 12.54f, 12.48f, 11.68f, 13.04f)
        verticalLineTo(15.05f)
        horizontalLineTo(14.28f)
        curveTo(15.78f, 13.67f, 16.66f, 11.62f, 16.66f, 9.18f)
        curveTo(16.66f, 8.61f, 16.61f, 8.52f, 16.51f, 8.0f)
        close()
    }
    path(fill = SolidColor(Color(0xFF34A853))) {
        moveTo(8.98f, 17f)
        curveTo(11.14f, 17f, 12.95f, 16.28f, 14.28f, 15.06f)
        lineTo(11.68f, 13.06f)
        curveTo(10.96f, 13.54f, 10.06f, 13.82f, 8.98f, 13.82f)
        curveTo(6.89f, 13.82f, 5.12f, 12.41f, 4.49f, 10.52f)
        horizontalLineTo(1.83f)
        verticalLineTo(12.59f)
        curveTo(3.18f, 15.27f, 5.96f, 17f, 8.98f, 17f)
        close()
    }
    path(fill = SolidColor(Color(0xFFFBBC05))) {
        moveTo(4.49f, 10.52f)
        curveTo(4.33f, 10.04f, 4.24f, 9.53f, 4.24f, 9.0f)
        curveTo(4.24f, 8.47f, 4.33f, 7.96f, 4.49f, 7.48f)
        verticalLineTo(5.41f)
        horizontalLineTo(1.83f)
        curveTo(1.29f, 6.49f, 0.98f, 7.71f, 0.98f, 9.0f)
        curveTo(0.98f, 10.29f, 1.29f, 11.51f, 1.83f, 12.59f)
        lineTo(4.49f, 10.52f)
        close()
    }
    path(fill = SolidColor(Color(0xFFEA4335))) {
        moveTo(8.98f, 3.58f)
        curveTo(10.3f, 3.58f, 11.48f, 4.03f, 12.42f, 4.93f)
        lineTo(15.0f, 2.34f)
        curveTo(13.43f, 0.89f, 11.43f, 0f, 8.98f, 0f)
        curveTo(5.96f, 0f, 3.18f, 1.73f, 1.83f, 4.41f)
        lineTo(4.49f, 6.48f)
        curveTo(5.12f, 4.59f, 6.89f, 3.58f, 8.98f, 3.58f)
        close()
    }
}.build()

@Composable
fun StaffSphereLogo(modifier: Modifier = Modifier, size: Dp = 32.dp) {
    Image(
        painter = painterResource(id = R.drawable.logo),
        contentDescription = "StaffSphere Logo",
        modifier = modifier
            .size(size)
            .clip(RoundedCornerShape(8.dp))
    )
}

@Composable
fun FeatureItemCompose(
    icon: ImageVector,
    title: String,
    desc: String,
    isDark: Boolean
) {
    val iconWrapperBg = if (isDark) Color(0xFF1E293B) else Color.White
    val iconWrapperBorder = if (isDark) Color(0xFF334155) else Color(0xFFE2E8F0)
    val iconTint = if (isDark) Color(0xFF818CF8) else Color(0xFF2E31E6)
    val textColorPrimary = if (isDark) Color.White else Color(0xFF0F172A)
    val textColorSecondary = if (isDark) Color(0xFF94A3B8) else Color(0xFF64748B)

    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Box(
            modifier = Modifier
                .size(38.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(iconWrapperBg)
                .border(1.dp, iconWrapperBorder, RoundedCornerShape(8.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = iconTint,
                modifier = Modifier.size(18.dp)
            )
        }
        Column {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium.copy(
                    fontWeight = FontWeight.SemiBold,
                    color = textColorPrimary,
                    fontSize = 14.sp
                )
            )
            Text(
                text = desc,
                style = MaterialTheme.typography.bodySmall.copy(
                    color = textColorSecondary,
                    fontSize = 12.sp
                )
            )
        }
    }
}

enum class ResetStep { EMAIL, RESET }

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onNavigateToRegister: () -> Unit,
    onLoginSuccess: () -> Unit,
    onPendingApproval: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val state by viewModel.loginState.collectAsState()
    val focusManager = LocalFocusManager.current
    var passwordVisible by remember { mutableStateOf(false) }
    var rememberMe by remember { mutableStateOf(false) }
    var showErrorDialog by remember { mutableStateOf(false) }
    
    var showForgotPasswordDialog by remember { mutableStateOf(false) }
    var dialogStep by remember { mutableStateOf(ResetStep.EMAIL) }
    var dialogEmail by remember { mutableStateOf("") }
    var dialogResetToken by remember { mutableStateOf("") }
    var dialogNewPassword by remember { mutableStateOf("") }
    var dialogConfirmPassword by remember { mutableStateOf("") }
    var newPasswordVisible by remember { mutableStateOf(false) }
    var confirmPasswordVisible by remember { mutableStateOf(false) }
    var dialogError by remember { mutableStateOf<String?>(null) }
    
    val forgotState by viewModel.forgotPasswordState.collectAsState()
    val resetState by viewModel.resetPasswordState.collectAsState()
    val context = androidx.compose.ui.platform.LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val credentialManager = remember { CredentialManager.create(context) }
    
    LaunchedEffect(forgotState) {
        forgotState?.let { resource ->
            when (resource) {
                is com.ems.android.utils.Resource.Success -> {
                    val devToken = resource.data?.getAccessToken() ?: resource.data?.token
                    if (devToken != null) {
                        dialogResetToken = devToken
                        android.widget.Toast.makeText(context, "Dev Mode: Code autofilled: $devToken", android.widget.Toast.LENGTH_LONG).show()
                    } else {
                        android.widget.Toast.makeText(context, "Verification code sent!", android.widget.Toast.LENGTH_SHORT).show()
                    }
                    dialogStep = ResetStep.RESET
                    viewModel.clearForgotPasswordState()
                }
                is com.ems.android.utils.Resource.Error -> {
                    dialogError = resource.message ?: "Failed to send reset code"
                }
                else -> {}
            }
        }
    }
    
    LaunchedEffect(resetState) {
        resetState?.let { resource ->
            when (resource) {
                is com.ems.android.utils.Resource.Success -> {
                    android.widget.Toast.makeText(context, "Password reset successfully!", android.widget.Toast.LENGTH_SHORT).show()
                    showForgotPasswordDialog = false
                    dialogStep = ResetStep.EMAIL
                    dialogEmail = ""
                    dialogResetToken = ""
                    dialogNewPassword = ""
                    dialogConfirmPassword = ""
                    newPasswordVisible = false
                    confirmPasswordVisible = false
                    viewModel.clearResetPasswordState()
                }
                is com.ems.android.utils.Resource.Error -> {
                    dialogError = resource.message ?: "Failed to reset password"
                }
                else -> {}
            }
        }
    }
    
    // Dynamic theme state detection
    val themeController = LocalThemeController.current
    val isDark = themeController.isDark
    
    val pageBg = if (isDark) Color(0xFF0F172A) else Color(0xFFF8FAFC)
    val cardBg = if (isDark) Color(0xFF1E293B) else Color.White
    val topSectionBg = if (isDark) Color(0xFF151F32) else Color(0xFFF8FAFC)
    val dividerColor = if (isDark) Color(0xFF334155) else Color(0xFFE2E8F0)
    val textColorPrimary = if (isDark) Color.White else Color(0xFF0F172A)
    val textColorSecondary = if (isDark) Color(0xFF94A3B8) else Color(0xFF64748B)
    val inputLabelColor = if (isDark) Color(0xFFCBD5E1) else Color(0xFF334155)
    
    val inputBg = if (isDark) Color(0xFF0F172A) else Color.White
    val inputBorder = if (isDark) Color(0xFF334155) else Color(0xFFE2E8F0)
    val inputFocusedBorder = if (isDark) Color(0xFF818CF8) else Color(0xFF2E31E6)
    val inputText = if (isDark) Color.White else Color(0xFF0F172A)
    val inputPlaceholder = if (isDark) Color(0xFF64748B) else Color(0xFF94A3B8)
    
    val checkboxBorder = if (isDark) Color(0xFF818CF8) else Color(0xFF2E31E6)
    val checkboxUnselectedBorder = if (isDark) Color(0xFF475569) else Color(0xFFCBD5E1)
    val checkboxDot = if (isDark) Color(0xFF818CF8) else Color(0xFF2E31E6)
    
    val buttonBg = if (isDark) Color(0xFF4F46E5) else Color(0xFF2E31E6)
    val linkText = if (isDark) Color(0xFF818CF8) else Color(0xFF2E31E6)
    
    // Show error dialog when error occurs
    LaunchedEffect(state.error) {
        if (state.error != null) {
            showErrorDialog = true
        }
    }
    
    LaunchedEffect(state.isLoggedIn, state.pendingApproval) {
        when {
            state.pendingApproval -> onPendingApproval()
            state.isLoggedIn -> onLoginSuccess()
        }
    }
    
    // Error Dialog
    if (showErrorDialog && state.error != null) {
        ErrorDialog(
            error = AppError(
                type = when {
                    state.error!!.contains("network", ignoreCase = true) -> ErrorType.NETWORK
                    state.error!!.contains("password", ignoreCase = true) ||
                    state.error!!.contains("email", ignoreCase = true) ||
                    state.error!!.contains("credentials", ignoreCase = true) -> ErrorType.AUTH
                    state.error!!.contains("validation", ignoreCase = true) -> ErrorType.VALIDATION
                    state.error!!.contains("server", ignoreCase = true) -> ErrorType.SERVER
                    else -> ErrorType.UNKNOWN
                },
                title = "Login Failed",
                message = state.error!!,
                details = "Email: ${state.email}\nTimestamp: ${System.currentTimeMillis()}",
                endpoint = "POST /api/auth/login"
            ),
            onDismiss = { 
                showErrorDialog = false
                viewModel.clearError()
            },
            onRetry = { viewModel.login() }
        )
    }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(pageBg)
    ) {
        // Floating Theme Toggle Button at top right
        IconButton(
            onClick = { themeController.toggleTheme() },
            modifier = Modifier
                .align(Alignment.TopEnd)
                .statusBarsPadding()
                .padding(16.dp)
        ) {
            Icon(
                imageVector = if (isDark) Icons.Default.LightMode else Icons.Default.DarkMode,
                contentDescription = "Toggle Theme",
                tint = if (isDark) Color.White else Color(0xFF0F172A),
                modifier = Modifier.size(24.dp)
            )
        }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(vertical = 40.dp, horizontal = 16.dp),
            contentAlignment = Alignment.Center
        ) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .widthIn(max = 440.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = cardBg),
            border = BorderStroke(1.dp, dividerColor),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                // Top Section
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(topSectionBg)
                        .padding(24.dp)
                ) {
                    // Branding Row
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        StaffSphereLogo(size = 32.dp)
                        Text(
                            text = "StaffSphere",
                            style = MaterialTheme.typography.titleLarge.copy(
                                fontWeight = FontWeight.Bold,
                                color = textColorPrimary,
                                fontSize = 20.sp,
                                letterSpacing = (-0.5).sp
                            )
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(36.dp))
                    
                    // Hero Statement
                    Text(
                        text = "Empowering the modern workforce.",
                        style = MaterialTheme.typography.headlineMedium.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = textColorPrimary,
                            fontSize = 24.sp,
                            lineHeight = 30.sp,
                            letterSpacing = (-0.5).sp
                        )
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "A unified platform for performance, engagement, and AI-driven growth insights.",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = textColorSecondary,
                            lineHeight = 20.sp
                        )
                    )
                    
                    Spacer(modifier = Modifier.height(36.dp))
                    
                    // Features list
                    Column(
                        verticalArrangement = Arrangement.spacedBy(18.dp)
                    ) {
                        FeatureItemCompose(
                            icon = Icons.Default.Groups,
                            title = "Integrated Management",
                            desc = "Seamless employee lifecycles",
                            isDark = isDark
                        )
                        FeatureItemCompose(
                            icon = Icons.AutoMirrored.Filled.TrendingUp,
                            title = "Dynamic Reviews",
                            desc = "Data-backed performance tracking",
                            isDark = isDark
                        )
                        FeatureItemCompose(
                            icon = Icons.Default.AutoAwesome,
                            title = "AI Insights",
                            desc = "Predictive talent analytics",
                            isDark = isDark
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(36.dp))
                    
                    // Stats Row
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(36.dp)
                    ) {
                        Column {
                            Text(
                                text = "500+",
                                style = MaterialTheme.typography.titleLarge.copy(
                                    fontWeight = FontWeight.ExtraBold,
                                    color = textColorPrimary,
                                    fontSize = 22.sp
                                )
                            )
                            Text(
                                text = "ENTERPRISES",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = textColorSecondary,
                                    letterSpacing = 1.sp,
                                    fontSize = 9.sp
                                )
                            )
                        }
                        Box(
                            modifier = Modifier
                                .width(1.dp)
                                .height(28.dp)
                                .background(dividerColor)
                        )
                        Column {
                            Text(
                                text = "99.9%",
                                style = MaterialTheme.typography.titleLarge.copy(
                                    fontWeight = FontWeight.ExtraBold,
                                    color = textColorPrimary,
                                    fontSize = 22.sp
                                )
                            )
                            Text(
                                text = "RELIABILITY",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = textColorSecondary,
                                    letterSpacing = 1.sp,
                                    fontSize = 9.sp
                                )
                            )
                        }
                    }
                }
                
                // Horizontal Divider Line separating top and bottom halves
                HorizontalDivider(color = dividerColor, thickness = 1.dp)
                
                // Bottom Section
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(cardBg)
                        .padding(24.dp)
                ) {
                    // Sign-in Header
                    Text(
                        text = "Sign in to your account",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = textColorPrimary,
                            fontSize = 22.sp,
                            letterSpacing = (-0.5).sp
                        ),
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Enter your workspace credentials to continue.",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = textColorSecondary,
                            fontSize = 14.sp
                        ),
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = TextAlign.Center
                    )
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    // Continue with Google Button
                    OutlinedButton(
                        onClick = {
                            coroutineScope.launch {
                                try {
                                    val googleWebClientId = context.getString(R.string.google_web_client_id)
                                    val googleIdOption = GetGoogleIdOption.Builder()
                                        .setFilterByAuthorizedAccounts(false)
                                        .setServerClientId(googleWebClientId)
                                        .setAutoSelectEnabled(false)
                                        .build()

                                    val request = GetCredentialRequest.Builder()
                                        .addCredentialOption(googleIdOption)
                                        .build()

                                    val result = credentialManager.getCredential(
                                        context = context,
                                        request = request
                                    )

                                    val credential = result.credential
                                    if (credential is CustomCredential && 
                                        credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                                        val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                                        val idToken = googleIdTokenCredential.idToken
                                        viewModel.loginWithGoogle(idToken, rememberMe)
                                    } else {
                                        Log.e("Auth", "Unexpected credential type: ${credential.type}")
                                    }
                                } catch (e: GetCredentialException) {
                                    Log.e("Auth", "Google Sign In Failed", e)
                                    android.widget.Toast.makeText(context, "Google Sign In Failed: ${e.localizedMessage}", android.widget.Toast.LENGTH_LONG).show()
                                } catch (e: Exception) {
                                    Log.e("Auth", "Google Sign In Error", e)
                                }
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp),
                        shape = RoundedCornerShape(8.dp),
                        border = BorderStroke(1.dp, dividerColor),
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = cardBg,
                            contentColor = textColorPrimary
                        )
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(
                                imageVector = GoogleIconVector,
                                contentDescription = null,
                                tint = Color.Unspecified,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Continue with Google",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    fontWeight = FontWeight.Medium,
                                    fontSize = 14.sp,
                                    color = textColorPrimary
                                )
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    // OR divider
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        HorizontalDivider(modifier = Modifier.weight(1f), color = dividerColor, thickness = 1.dp)
                        Text(
                            text = "WORK EMAIL",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = textColorSecondary,
                                letterSpacing = 1.sp,
                                fontSize = 10.sp
                            ),
                            modifier = Modifier.padding(horizontal = 12.dp)
                        )
                        HorizontalDivider(modifier = Modifier.weight(1f), color = dividerColor, thickness = 1.dp)
                    }
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    // Work Email Field
                    Text(
                        text = "Work Email",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = inputLabelColor,
                            fontSize = 14.sp
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = state.email,
                        onValueChange = { viewModel.updateLoginEmail(it) },
                        placeholder = { Text("name@company.com", color = inputPlaceholder) },
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Email,
                            imeAction = ImeAction.Next
                        ),
                        keyboardActions = KeyboardActions(
                            onNext = { focusManager.moveFocus(FocusDirection.Down) }
                        ),
                        singleLine = true,
                        shape = RoundedCornerShape(8.dp),
                        isError = state.error != null,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = inputText,
                            unfocusedTextColor = inputText,
                            focusedContainerColor = inputBg,
                            unfocusedContainerColor = inputBg,
                            focusedBorderColor = inputFocusedBorder,
                            unfocusedBorderColor = inputBorder,
                            errorBorderColor = MaterialTheme.colorScheme.error
                        )
                    )
                    
                    Spacer(modifier = Modifier.height(20.dp))
                    
                    // Password Field
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Password",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                fontWeight = FontWeight.SemiBold,
                                color = inputLabelColor,
                                fontSize = 14.sp
                            )
                        )
                        Text(
                            text = "Forgot?",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = linkText,
                                fontSize = 14.sp
                            ),
                            modifier = Modifier.clickable { showForgotPasswordDialog = true }
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = state.password,
                        onValueChange = { viewModel.updateLoginPassword(it) },
                        placeholder = { Text("••••••••", color = inputPlaceholder) },
                        trailingIcon = {
                            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                Icon(
                                    imageVector = if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                    contentDescription = if (passwordVisible) "Hide password" else "Show password",
                                    tint = inputPlaceholder
                                )
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Password,
                            imeAction = ImeAction.Done
                        ),
                        keyboardActions = KeyboardActions(
                            onDone = { 
                                focusManager.clearFocus()
                                viewModel.login()
                            }
                        ),
                        singleLine = true,
                        shape = RoundedCornerShape(8.dp),
                        isError = state.error != null,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = inputText,
                            unfocusedTextColor = inputText,
                            focusedContainerColor = inputBg,
                            unfocusedContainerColor = inputBg,
                            focusedBorderColor = inputFocusedBorder,
                            unfocusedBorderColor = inputBorder,
                            errorBorderColor = MaterialTheme.colorScheme.error
                        )
                    )
                    
                    Spacer(modifier = Modifier.height(20.dp))
                    
                    // Circular Checkbox Custom Implementation
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { rememberMe = !rememberMe }
                    ) {
                        Box(
                            modifier = Modifier
                                .size(18.dp)
                                .border(
                                    width = 1.5.dp,
                                    color = if (rememberMe) checkboxBorder else checkboxUnselectedBorder,
                                    shape = CircleShape
                                )
                                .background(inputBg, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            if (rememberMe) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .background(checkboxDot, CircleShape)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Keep me signed in",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                color = inputLabelColor,
                                fontSize = 14.sp
                            )
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    // Sign In Button
                    Button(
                        onClick = { viewModel.login(rememberMe) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        enabled = !state.isLoading,
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = buttonBg,
                            contentColor = Color.White,
                            disabledContainerColor = buttonBg.copy(alpha = 0.5f),
                            disabledContentColor = Color.White.copy(alpha = 0.5f)
                        )
                    ) {
                        if (state.isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text(
                                text = "Sign In",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp
                                )
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    // Register Link
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "New to StaffSphere? ",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                color = textColorSecondary,
                                fontSize = 14.sp
                            )
                        )
                        Text(
                            text = "Create an account",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = linkText,
                                fontSize = 14.sp
                            ),
                            modifier = Modifier.clickable { onNavigateToRegister() }
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(40.dp))
                    
                    // Footer Badge
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = null,
                                tint = textColorSecondary,
                                modifier = Modifier.size(12.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Enterprise SSO & Encryption Enabled",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = textColorSecondary,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            )
                        }
                        Text(
                            text = "© 2024 StaffSphere. All rights reserved.",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = if (isDark) Color(0xFF475569) else Color(0xFF94A3B8),
                                fontSize = 12.sp
                            )
                        )
                    }
                }
            }
        }
    }
    
    if (showForgotPasswordDialog) {
        AlertDialog(
            onDismissRequest = { 
                if (forgotState !is com.ems.android.utils.Resource.Loading && resetState !is com.ems.android.utils.Resource.Loading) {
                    showForgotPasswordDialog = false 
                    dialogStep = ResetStep.EMAIL
                    dialogEmail = ""
                    dialogResetToken = ""
                    dialogNewPassword = ""
                    dialogConfirmPassword = ""
                    newPasswordVisible = false
                    confirmPasswordVisible = false
                    dialogError = null
                }
            },
            title = {
                Text(
                    text = if (dialogStep == ResetStep.EMAIL) "Forgot Password" else "Reset Password",
                    fontWeight = FontWeight.Bold,
                    color = textColorPrimary
                )
            },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    if (dialogError != null) {
                        Text(
                            text = dialogError!!,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                    
                    if (dialogStep == ResetStep.EMAIL) {
                        Text(
                            text = "Enter your work email address to receive a password reset code.",
                            color = textColorSecondary,
                            style = MaterialTheme.typography.bodyMedium
                        )
                        OutlinedTextField(
                            value = dialogEmail,
                            onValueChange = { dialogEmail = it; dialogError = null },
                            label = { Text("Email Address") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = inputText,
                                unfocusedTextColor = inputText,
                                focusedContainerColor = inputBg,
                                unfocusedContainerColor = inputBg,
                                focusedBorderColor = inputFocusedBorder,
                                unfocusedBorderColor = inputBorder
                            )
                        )
                    } else {
                        Text(
                            text = "Enter the 6-digit code sent to your email and choose a new password.",
                            color = textColorSecondary,
                            style = MaterialTheme.typography.bodyMedium
                        )
                        OutlinedTextField(
                            value = dialogResetToken,
                            onValueChange = { dialogResetToken = it; dialogError = null },
                            label = { Text("Verification Code") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = inputText,
                                unfocusedTextColor = inputText,
                                focusedContainerColor = inputBg,
                                unfocusedContainerColor = inputBg,
                                focusedBorderColor = inputFocusedBorder,
                                unfocusedBorderColor = inputBorder
                            )
                        )
                        OutlinedTextField(
                            value = dialogNewPassword,
                            onValueChange = { dialogNewPassword = it; dialogError = null },
                            label = { Text("New Password") },
                            trailingIcon = {
                                IconButton(onClick = { newPasswordVisible = !newPasswordVisible }) {
                                    Icon(
                                        imageVector = if (newPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                        contentDescription = if (newPasswordVisible) "Hide password" else "Show password",
                                        tint = inputPlaceholder
                                    )
                                }
                            },
                            visualTransformation = if (newPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = inputText,
                                unfocusedTextColor = inputText,
                                focusedContainerColor = inputBg,
                                unfocusedContainerColor = inputBg,
                                focusedBorderColor = inputFocusedBorder,
                                unfocusedBorderColor = inputBorder
                            )
                        )
                        OutlinedTextField(
                            value = dialogConfirmPassword,
                            onValueChange = { dialogConfirmPassword = it; dialogError = null },
                            label = { Text("Confirm New Password") },
                            trailingIcon = {
                                IconButton(onClick = { confirmPasswordVisible = !confirmPasswordVisible }) {
                                    Icon(
                                        imageVector = if (confirmPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                        contentDescription = if (confirmPasswordVisible) "Hide password" else "Show password",
                                        tint = inputPlaceholder
                                    )
                                }
                            },
                            visualTransformation = if (confirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = inputText,
                                unfocusedTextColor = inputText,
                                focusedContainerColor = inputBg,
                                unfocusedContainerColor = inputBg,
                                focusedBorderColor = inputFocusedBorder,
                                unfocusedBorderColor = inputBorder
                            )
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (dialogStep == ResetStep.EMAIL) {
                            if (dialogEmail.isNotBlank()) {
                                viewModel.forgotPassword(dialogEmail)
                            } else {
                                dialogError = "Email is required"
                            }
                        } else {
                            if (dialogResetToken.isBlank() || dialogNewPassword.isBlank() || dialogConfirmPassword.isBlank()) {
                                dialogError = "All fields are required"
                            } else if (dialogNewPassword != dialogConfirmPassword) {
                                dialogError = "Passwords do not match"
                            } else {
                                viewModel.resetPassword(dialogEmail, dialogResetToken, dialogNewPassword)
                            }
                        }
                    },
                    enabled = forgotState !is com.ems.android.utils.Resource.Loading && resetState !is com.ems.android.utils.Resource.Loading,
                    colors = ButtonDefaults.buttonColors(containerColor = buttonBg)
                ) {
                    if (forgotState is com.ems.android.utils.Resource.Loading || resetState is com.ems.android.utils.Resource.Loading) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White)
                    } else {
                        Text(text = if (dialogStep == ResetStep.EMAIL) "Send Code" else "Reset Password")
                    }
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        if (dialogStep == ResetStep.RESET) {
                            dialogStep = ResetStep.EMAIL
                        } else {
                            showForgotPasswordDialog = false
                            dialogEmail = ""
                            dialogResetToken = ""
                            dialogNewPassword = ""
                            dialogConfirmPassword = ""
                            newPasswordVisible = false
                            confirmPasswordVisible = false
                            dialogError = null
                        }
                    },
                    enabled = forgotState !is com.ems.android.utils.Resource.Loading && resetState !is com.ems.android.utils.Resource.Loading
                ) {
                    Text(text = if (dialogStep == ResetStep.RESET) "Back" else "Cancel", color = textColorSecondary)
                }
            },
            containerColor = cardBg
        )
    }
    }
}
