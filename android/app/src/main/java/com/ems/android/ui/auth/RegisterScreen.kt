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
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
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
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.ems.android.ui.components.AppError
import com.ems.android.ui.components.ErrorDialog
import com.ems.android.ui.components.ErrorType
import com.ems.android.ui.components.LocalThemeController
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.CustomCredential
import androidx.credentials.exceptions.GetCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import kotlinx.coroutines.launch
import android.util.Log

// Reusable Google G icon vector matching the web version
val GoogleIconVectorRegister = ImageVector.Builder(
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
fun StaffSphereLogoRegister(modifier: Modifier = Modifier, size: Dp = 28.dp) {
    Image(
        painter = painterResource(id = R.drawable.logo),
        contentDescription = "StaffSphere Logo",
        modifier = modifier
            .size(size)
            .clip(RoundedCornerShape(8.dp))
    )
}

data class RoleCardOption(
    val value: String,
    val label: String,
    val description: String,
    val icon: ImageVector
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(
    onNavigateToLogin: () -> Unit,
    onRegisterSuccess: () -> Unit,
    onPendingApproval: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val state by viewModel.registerState.collectAsState()
    val organizations by viewModel.organizations.collectAsState()
    var passwordVisible by remember { mutableStateOf(false) }
    var confirmPasswordVisible by remember { mutableStateOf(false) }
    var showOrgDropdown by remember { mutableStateOf(false) }
    
    val context = androidx.compose.ui.platform.LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val credentialManager = remember { CredentialManager.create(context) }
    
    // Dynamic theme state detection
    val themeController = LocalThemeController.current
    val isDark = themeController.isDark
    
    val pageBg = if (isDark) Color(0xFF0F172A) else Color(0xFFF8FAFC)
    val headerBg = if (isDark) Color(0xFF1E293B) else Color.White
    val headerBorder = if (isDark) Color(0xFF334155) else Color(0xFFE2E8F0)
    val headerLogoTextMain = if (isDark) Color.White else Color(0xFF0F172A)
    val headerLogoTextSub = if (isDark) Color(0xFF818CF8) else Color(0xFF2E31E6)
    val cardBg = if (isDark) Color(0xFF1E293B) else Color.White
    val cardBorder = if (isDark) Color(0xFF334155) else Color(0xFFE2E8F0)
    val titleColor = if (isDark) Color.White else Color(0xFF0F172A)
    val subtitleColor = if (isDark) Color(0xFF94A3B8) else Color(0xFF64748B)
    val labelColor = if (isDark) Color(0xFFCBD5E1) else Color(0xFF334155)
    
    val roleCardBgSelected = if (isDark) Color(0xFF242F4D) else Color(0xFFEEF2FF)
    val roleCardBorderSelected = if (isDark) Color(0xFF818CF8) else Color(0xFF2E31E6)
    val roleCardBgUnselected = if (isDark) Color(0xFF1E293B) else Color.White
    val roleCardBorderUnselected = if (isDark) Color(0xFF334155) else Color(0xFFE2E8F0)
    
    val roleIconWrapperBgSelected = if (isDark) Color(0xFF1E293B) else Color.White
    val roleIconWrapperBgUnselected = if (isDark) Color(0xFF151F32) else Color(0xFFF1F5F9)
    val roleIconSelectedTint = if (isDark) Color(0xFF818CF8) else Color(0xFF2E31E6)
    val roleIconUnselectedTint = if (isDark) Color(0xFF94A3B8) else Color(0xFF64748B)
    
    val roleLabelSelected = if (isDark) Color(0xFF818CF8) else Color(0xFF2E31E6)
    val roleLabelUnselected = if (isDark) Color.White else Color(0xFF0F172A)
    val roleDescSelected = if (isDark) Color(0xFF818CF8) else Color(0xFF5850EC)
    val roleDescUnselected = if (isDark) Color(0xFF94A3B8) else Color(0xFF64748B)
    val roleCheckBadge = if (isDark) Color(0xFF818CF8) else Color(0xFF2E31E6)
    
    val modeCardBgActive = if (isDark) Color(0xFF242F4D) else Color(0xFFEEF2FF)
    val modeCardBorderActive = if (isDark) Color(0xFF818CF8) else Color(0xFF2E31E6)
    val modeCardBgInactive = if (isDark) Color(0xFF1E293B) else Color.White
    val modeCardBorderInactive = if (isDark) Color(0xFF334155) else Color(0xFFE2E8F0)
    val modeCardTextActive = if (isDark) Color(0xFF818CF8) else Color(0xFF2E31E6)
    val modeCardTextInactive = if (isDark) Color(0xFF94A3B8) else Color(0xFF64748B)
    
    val orgSelectedCardBg = if (isDark) Color(0xFF242F4D).copy(alpha = 0.5f) else Color(0xFFEEF2FF).copy(alpha = 0.5f)
    val orgSelectedCardBorder = if (isDark) Color(0xFF334155) else Color(0xFFE2E8F0)
    val orgSelectedText = if (isDark) Color.White else Color(0xFF0F172A)
    val orgSelectedIcon = if (isDark) Color(0xFF818CF8) else Color(0xFF2E31E6)
    
    val dropdownSelectedText = if (isDark) Color.White else Color(0xFF0F172A)
    val dropdownSelectedDesc = if (isDark) Color(0xFF94A3B8) else Color(0xFF64748B)
    
    val inputBg = if (isDark) Color(0xFF0F172A) else Color.White
    val inputBorder = if (isDark) Color(0xFF334155) else Color(0xFFE2E8F0)
    val inputFocusedBorder = if (isDark) Color(0xFF818CF8) else Color(0xFF2E31E6)
    val inputText = if (isDark) Color.White else Color(0xFF0F172A)
    val inputPlaceholder = if (isDark) Color(0xFF64748B) else Color(0xFF94A3B8)
    
    val buttonBg = if (isDark) Color(0xFF4F46E5) else Color(0xFF2E31E6)
    val termsTextMain = if (isDark) Color(0xFF94A3B8) else Color(0xFF64748B)
    val termsTextLink = if (isDark) Color(0xFF818CF8) else Color(0xFF2E31E6)
    
    val footerBg = if (isDark) Color(0xFF0F172A) else Color(0xFFF8FAFC)
    val footerBorder = if (isDark) Color(0xFF334155) else Color(0xFFE2E8F0)
    val footerLogoText = if (isDark) Color.White else Color(0xFF0F172A)
    val footerLinkText = if (isDark) Color(0xFF94A3B8) else Color(0xFF64748B)
    val footerCopyrightText = if (isDark) Color(0xFF475569) else Color(0xFF94A3B8)

    val roles = remember {
        listOf(
            RoleCardOption("ADMIN", "Admin", "Full organizational control", Icons.Default.Shield),
            RoleCardOption("HR_MANAGER", "HR Manager", "Manage people & roles", Icons.Default.Work),
            RoleCardOption("EMPLOYEE", "Employee", "Join existing team", Icons.Default.Person)
        )
    }
    
    LaunchedEffect(state.isRegistered, state.pendingApproval) {
        when {
            state.pendingApproval -> onPendingApproval()
            state.isRegistered -> onRegisterSuccess()
        }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(pageBg)
            .verticalScroll(rememberScrollState())
    ) {
        // Top Navigation Header bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .background(headerBg)
                .border(width = 1.dp, color = headerBorder)
                .padding(horizontal = 24.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            StaffSphereLogoRegister(size = 26.dp)
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = buildAnnotatedString {
                    withStyle(SpanStyle(fontWeight = FontWeight.Bold, color = headerLogoTextMain)) {
                        append("StaffSphere")
                    }
                },
                fontSize = 18.sp,
                letterSpacing = (-0.5).sp
            )
            Spacer(modifier = Modifier.weight(1f))
            IconButton(
                onClick = { themeController.toggleTheme() },
                modifier = Modifier.size(36.dp)
            ) {
                Icon(
                    imageVector = if (isDark) Icons.Default.LightMode else Icons.Default.DarkMode,
                    contentDescription = "Toggle Theme",
                    tint = if (isDark) Color.White else Color(0xFF0F172A),
                    modifier = Modifier.size(22.dp)
                )
            }
        }
        
        // Centered card panel
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 40.dp, horizontal = 16.dp),
            contentAlignment = Alignment.Center
        ) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .widthIn(max = 440.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = cardBg),
                border = BorderStroke(1.dp, cardBorder),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp)
                ) {
                    // Header text
                    Text(
                        text = "Create your workspace",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = titleColor,
                            fontSize = 22.sp,
                            letterSpacing = (-0.5).sp
                        ),
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Join 500+ modern organizations boosting their HR efficiency.",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = subtitleColor,
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
                                        viewModel.loginWithGoogle(idToken)
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
                        border = BorderStroke(1.dp, cardBorder),
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = cardBg,
                            contentColor = titleColor
                        )
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(
                                imageVector = GoogleIconVectorRegister,
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
                                    color = titleColor
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
                        HorizontalDivider(modifier = Modifier.weight(1f), color = cardBorder, thickness = 1.dp)
                        Text(
                            text = "OR REGISTER WITH EMAIL",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = subtitleColor,
                                letterSpacing = 1.sp,
                                fontSize = 10.sp
                            ),
                            modifier = Modifier.padding(horizontal = 12.dp)
                        )
                        HorizontalDivider(modifier = Modifier.weight(1f), color = cardBorder, thickness = 1.dp)
                    }
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    // Full Name Input
                    Text(
                        text = "Full Name",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = labelColor,
                            fontSize = 14.sp
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = state.firstName + (if (state.lastName.isNotEmpty()) " " + state.lastName else ""),
                        onValueChange = { input ->
                            val parts = input.trim().split(" ")
                            val fName = parts.firstOrNull() ?: ""
                            val lName = if (parts.size > 1) parts.drop(1).joinToString(" ") else ""
                            viewModel.updateRegisterField(firstName = fName, lastName = lName)
                        },
                        placeholder = { Text("John Doe", color = inputPlaceholder) },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(8.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = inputText,
                            unfocusedTextColor = inputText,
                            focusedContainerColor = inputBg,
                            unfocusedContainerColor = inputBg,
                            focusedBorderColor = inputFocusedBorder,
                            unfocusedBorderColor = inputBorder
                        )
                    )
                    
                    Spacer(modifier = Modifier.height(20.dp))
                    
                    // Work Email Input
                    Text(
                        text = "Work Email",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = labelColor,
                            fontSize = 14.sp
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = state.email,
                        onValueChange = { viewModel.updateRegisterField(email = it) },
                        placeholder = { Text("name@company.com", color = inputPlaceholder) },
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        singleLine = true,
                        shape = RoundedCornerShape(8.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = inputText,
                            unfocusedTextColor = inputText,
                            focusedContainerColor = inputBg,
                            unfocusedContainerColor = inputBg,
                            focusedBorderColor = inputFocusedBorder,
                            unfocusedBorderColor = inputBorder
                        )
                    )
                    
                    Spacer(modifier = Modifier.height(20.dp))
                    
                    // Select Your Role Label
                    Text(
                        text = "Select Your Role",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = labelColor,
                            fontSize = 14.sp
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    
                    // Vertical stacked selectable role options
                    Column(
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        roles.forEach { role ->
                            val isSelected = state.role == role.value
                            val roleCardBg = if (isSelected) roleCardBgSelected else roleCardBgUnselected
                            val roleCardBorder = if (isSelected) roleCardBorderSelected else roleCardBorderUnselected
                            val roleIconWrapperBg = if (isSelected) roleIconWrapperBgSelected else roleIconWrapperBgUnselected
                            val roleIconTint = if (isSelected) roleIconSelectedTint else roleIconUnselectedTint
                            val roleLabelColor = if (isSelected) roleLabelSelected else roleLabelUnselected
                            val roleDescColor = if (isSelected) roleDescSelected else roleDescUnselected
                            
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .border(
                                        width = 1.5.dp,
                                        color = roleCardBorder,
                                        shape = RoundedCornerShape(10.dp)
                                    )
                                    .background(roleCardBg)
                                    .clickable {
                                        viewModel.updateRegisterField(role = role.value)
                                    }
                                    .padding(16.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(36.dp)
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(roleIconWrapperBg)
                                            .border(
                                                width = if (isSelected) 1.dp else 0.dp,
                                                color = cardBorder,
                                                shape = RoundedCornerShape(8.dp)
                                            ),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = role.icon,
                                            contentDescription = null,
                                            tint = roleIconTint,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                    Column {
                                        Text(
                                            text = role.label,
                                            style = MaterialTheme.typography.bodyMedium.copy(
                                                fontWeight = FontWeight.Bold,
                                                color = roleLabelColor,
                                                fontSize = 14.sp
                                            )
                                        )
                                        Text(
                                            text = role.description,
                                            style = MaterialTheme.typography.bodySmall.copy(
                                                color = roleDescColor,
                                                fontSize = 12.sp
                                            )
                                        )
                                    }
                                }
                                if (isSelected) {
                                    Box(
                                        modifier = Modifier
                                            .align(Alignment.TopEnd)
                                            .size(18.dp)
                                            .background(roleCheckBadge, CircleShape),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Check,
                                            contentDescription = null,
                                            tint = Color.White,
                                            modifier = Modifier.size(12.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                    
                    // Organization Management Fields
                    if (state.role == "ADMIN") {
                        Spacer(modifier = Modifier.height(20.dp))
                        Text(
                            text = "Organization Management",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                fontWeight = FontWeight.SemiBold,
                                color = labelColor,
                                fontSize = 14.sp
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            val isJoin = state.organizationChoice == "JOIN_EXISTING"
                            val isCreate = state.organizationChoice == "CREATE_NEW"
                            
                            val joinBg = if (isJoin) modeCardBgActive else modeCardBgInactive
                            val joinBorder = if (isJoin) modeCardBorderActive else modeCardBorderInactive
                            val joinText = if (isJoin) modeCardTextActive else modeCardTextInactive
                            
                            val createBg = if (isCreate) modeCardBgActive else modeCardBgInactive
                            val createBorder = if (isCreate) modeCardBorderActive else modeCardBorderInactive
                            val createText = if (isCreate) modeCardTextActive else modeCardTextInactive
                            
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .border(
                                        width = 1.dp,
                                        color = joinBorder,
                                        shape = RoundedCornerShape(8.dp)
                                    )
                                    .background(joinBg)
                                    .clickable { viewModel.updateRegisterField(organizationChoice = "JOIN_EXISTING") }
                                    .padding(10.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(
                                        Icons.Default.PersonAdd,
                                        contentDescription = null,
                                        tint = joinText,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Text(
                                        "Join Existing",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = joinText
                                    )
                                }
                            }
                            
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .border(
                                        width = 1.dp,
                                        color = createBorder,
                                        shape = RoundedCornerShape(8.dp)
                                    )
                                    .background(createBg)
                                    .clickable { viewModel.updateRegisterField(organizationChoice = "CREATE_NEW") }
                                    .padding(10.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(
                                        Icons.Default.PlusOne,
                                        contentDescription = null,
                                        tint = createText,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Text(
                                        "Create New",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = createText
                                    )
                                }
                            }
                        }
                    }
                    
                    // Join existing search field
                    if (state.organizationChoice == "JOIN_EXISTING") {
                        Spacer(modifier = Modifier.height(20.dp))
                        Text(
                            text = "Join Organization",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                fontWeight = FontWeight.SemiBold,
                                color = labelColor,
                                fontSize = 14.sp
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        ExposedDropdownMenuBox(
                            expanded = showOrgDropdown && organizations.isNotEmpty(),
                            onExpandedChange = { showOrgDropdown = it }
                        ) {
                            OutlinedTextField(
                                value = state.searchQuery,
                                onValueChange = { 
                                    viewModel.searchOrganizations(it)
                                    showOrgDropdown = true
                                },
                                placeholder = { Text("Choose an organization", color = inputPlaceholder) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .menuAnchor(MenuAnchorType.PrimaryNotEditable),
                                singleLine = true,
                                shape = RoundedCornerShape(8.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedTextColor = inputText,
                                    unfocusedTextColor = inputText,
                                    focusedContainerColor = inputBg,
                                    unfocusedContainerColor = inputBg,
                                    focusedBorderColor = inputFocusedBorder,
                                    unfocusedBorderColor = inputBorder
                                ),
                                trailingIcon = {
                                    Icon(
                                        imageVector = Icons.Default.ArrowDropDown,
                                        contentDescription = null,
                                        tint = inputPlaceholder
                                    )
                                }
                            )
                            
                            ExposedDropdownMenu(
                                expanded = showOrgDropdown && organizations.isNotEmpty(),
                                onDismissRequest = { showOrgDropdown = false }
                            ) {
                                organizations.forEach { org ->
                                    DropdownMenuItem(
                                        text = { 
                                            Column {
                                                Text(org.name, fontWeight = FontWeight.SemiBold, color = dropdownSelectedText)
                                                org.industry?.let {
                                                    Text(
                                                        text = it,
                                                        style = MaterialTheme.typography.bodySmall,
                                                        color = dropdownSelectedDesc
                                                    )
                                                }
                                            }
                                        },
                                        onClick = {
                                            viewModel.updateRegisterField(
                                                organizationId = org.id,
                                                organizationName = org.name
                                            )
                                            viewModel.searchOrganizations(org.name)
                                            showOrgDropdown = false
                                        }
                                    )
                                }
                            }
                        }
                        
                        if (state.organizationId != null) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(
                                    containerColor = orgSelectedCardBg
                                ),
                                border = BorderStroke(1.dp, orgSelectedCardBorder)
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        Icons.Default.CheckCircle,
                                        contentDescription = null,
                                        tint = orgSelectedIcon
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Selected: ${state.organizationName}", color = orgSelectedText, fontSize = 14.sp)
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Organization admins must approve your membership request.",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = subtitleColor,
                                fontSize = 12.sp
                            )
                        )
                    }
                    
                    // Create new org field
                    if (state.role == "ADMIN" && state.organizationChoice == "CREATE_NEW") {
                        Spacer(modifier = Modifier.height(20.dp))
                        Text(
                            text = "New Organization Name",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                fontWeight = FontWeight.SemiBold,
                                color = labelColor,
                                fontSize = 14.sp
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = state.organizationName,
                            onValueChange = { viewModel.updateRegisterField(organizationName = it) },
                            placeholder = { Text("Enter your organization name", color = inputPlaceholder) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(8.dp),
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
                    
                    // Password Field
                    Spacer(modifier = Modifier.height(20.dp))
                    Text(
                        text = "Password",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = labelColor,
                            fontSize = 14.sp
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = state.password,
                        onValueChange = { viewModel.updateRegisterField(password = it) },
                        placeholder = { Text("••••••••", color = inputPlaceholder) },
                        trailingIcon = {
                            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                Icon(
                                    imageVector = if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                    contentDescription = null,
                                    tint = inputPlaceholder
                                )
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        singleLine = true,
                        shape = RoundedCornerShape(8.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = inputText,
                            unfocusedTextColor = inputText,
                            focusedContainerColor = inputBg,
                            unfocusedContainerColor = inputBg,
                            focusedBorderColor = inputFocusedBorder,
                            unfocusedBorderColor = inputBorder
                        )
                    )
                    
                    // Confirm Password Field
                    Spacer(modifier = Modifier.height(20.dp))
                    Text(
                        text = "Confirm Password",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = labelColor,
                            fontSize = 14.sp
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = state.confirmPassword,
                        onValueChange = { viewModel.updateRegisterField(confirmPassword = it) },
                        placeholder = { Text("••••••••", color = inputPlaceholder) },
                        trailingIcon = {
                            IconButton(onClick = { confirmPasswordVisible = !confirmPasswordVisible }) {
                                Icon(
                                    imageVector = if (confirmPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                    contentDescription = null,
                                    tint = inputPlaceholder
                                )
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        visualTransformation = if (confirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        singleLine = true,
                        shape = RoundedCornerShape(8.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = inputText,
                            unfocusedTextColor = inputText,
                            focusedContainerColor = inputBg,
                            unfocusedContainerColor = inputBg,
                            focusedBorderColor = inputFocusedBorder,
                            unfocusedBorderColor = inputBorder
                        ),
                        isError = state.confirmPassword.isNotEmpty() && state.password != state.confirmPassword
                    )
                    
                    if (state.error != null) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = state.error!!,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    // Register Button
                    Button(
                        onClick = { viewModel.register() },
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
                                text = "Create Account",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp
                                )
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Terms and conditions
                    Text(
                        text = buildAnnotatedString {
                            append("By signing up, you agree to our ")
                            withStyle(SpanStyle(color = termsTextLink, fontWeight = FontWeight.Bold)) {
                                append("Terms of Service")
                            }
                            append(" & ")
                            withStyle(SpanStyle(color = termsTextLink, fontWeight = FontWeight.Bold)) {
                                append("Privacy Policy")
                            }
                        },
                        fontSize = 12.sp,
                        color = termsTextMain,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    Spacer(modifier = Modifier.height(20.dp))
                    
                    // Log In Link
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Already have a professional account? ",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                color = termsTextMain,
                                fontSize = 14.sp
                            )
                        )
                        Text(
                            text = "Log In",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = termsTextLink,
                                fontSize = 14.sp
                            ),
                            modifier = Modifier.clickable { onNavigateToLogin() }
                        )
                    }
                }
            }
        }
        
        // Page footer bar
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(footerBg)
                .border(width = 1.dp, color = footerBorder)
                .padding(vertical = 32.dp, horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                StaffSphereLogoRegister(size = 20.dp)
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "StaffSphere",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = footerLogoText
                    )
                )
            }
            Row(
                horizontalArrangement = Arrangement.spacedBy(20.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = "Security", fontSize = 13.sp, color = footerLinkText)
                Text(text = "Legal", fontSize = 13.sp, color = footerLinkText)
                Text(text = "System Status", fontSize = 13.sp, color = footerLinkText)
            }
            Text(
                text = "© 2024 StaffSphere. All rights reserved.",
                style = MaterialTheme.typography.bodySmall.copy(
                    color = footerCopyrightText,
                    fontSize = 12.sp
                )
            )
        }
    }
}
