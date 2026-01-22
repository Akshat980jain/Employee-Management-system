# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Keep Moshi adapters
-keep class com.ems.android.data.models.** { *; }
-keepclassmembers class com.ems.android.data.models.** { *; }

# Keep Retrofit interfaces
-keep,allowobfuscation interface * { @retrofit2.http.* <methods>; }
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }

# OkHttp
-dontwarn okhttp3.**
-keep class okhttp3.** { *; }
-dontwarn okio.**
-keep class okio.** { *; }
