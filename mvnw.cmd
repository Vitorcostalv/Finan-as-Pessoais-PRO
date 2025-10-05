@ECHO OFF
REM Apache Maven Wrapper startup script for Windows
SETLOCAL EnableExtensions EnableDelayedExpansion

SET "BASEDIR=%~dp0"
REM Remove trailing backslash
IF "%BASEDIR:~-1%"=="\" SET "BASEDIR=%BASEDIR:~0,-1%"
SET "MAVEN_PROJECTBASEDIR=%BASEDIR%"
SET "WRAPPER_JAR=%BASEDIR%\.mvn\wrapper\maven-wrapper.jar"
SET "PROPS_FILE=%BASEDIR%\.mvn\wrapper\maven-wrapper.properties"

IF NOT EXIST "%WRAPPER_JAR%" (
  SET "DOWNLOAD_URL="
  IF EXIST "%PROPS_FILE%" (
    FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%PROPS_FILE%") DO (
      IF "%%A"=="wrapperUrl" SET "DOWNLOAD_URL=%%B"
    )
  )
  IF "!DOWNLOAD_URL!"=="" SET "DOWNLOAD_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"
  IF NOT EXIST "%BASEDIR%\.mvn\wrapper" MKDIR "%BASEDIR%\.mvn\wrapper" >NUL 2>&1
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri \"!DOWNLOAD_URL!\" -OutFile \"%WRAPPER_JAR%\"" || (
    ECHO Failed to download maven-wrapper.jar
    EXIT /B 1
  )
)

SET "JAVA_EXE=java"
IF NOT "%JAVA_HOME%"=="" SET "JAVA_EXE=%JAVA_HOME%\bin\java.exe"

"%JAVA_EXE%" %MAVEN_OPTS% "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" -cp "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
EXIT /B %ERRORLEVEL%
