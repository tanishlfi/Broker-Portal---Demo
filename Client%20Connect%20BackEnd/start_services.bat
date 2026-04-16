@echo off
setlocal EnableDelayedExpansion

:: Define common paths
set "BASE_PATH=E:\src\processor-py-test"
set "LOG_PATH=E:\src\service_test.log"
set "ERROR_LOG_PATH=E:\src\service-error-test.log"

:: Define service configurations
set "SERVICES[0]=cctest_allocation;service_allocation.bat;Client Connect Test Allocation"
set "SERVICES[1]=cctest_coverCheck;service_coverCheck.bat;Client Connect Test Cover Check"
set "SERVICES[2]=cctest_file_processor;service_file_processor.bat;Client Connect Test File processor"
set "SERVICES[3]=cctest_vopd_requests;service_vopd_requests.bat;Client Connect Test VOPD Requests"
set "SERVICES[4]=cctest_generate_files;service_generateFiles.bat;Client Connect Test Generate Files"
set "SERVICES[5]=cctest_send4approval;service_send4approval.bat;Client Connect test Send 4 Approval"

:: Loop through the SERVICES array and print each element
for /L %%i in (0,1,5) do (
   for /F "tokens=1-3 delims=;" %%a in ("!SERVICES[%%i]!") do (
        set "SERVICE_NAME=%%a"
        set "SERVICE_BATCH=%%b"
        set "SERVICE_DESC=%%c"
        set "APPLICATION_PATH=!BASE_PATH!\!SERVICE_BATCH!"
        echo Service Name: !SERVICE_NAME!
        echo Script: !SERVICE_BATCH!
        echo Description: !SERVICE_DESC!
        echo.
        sc query !SERVICE_NAME! >nul 2>&1
        if !ERRORLEVEL! NEQ 0 (
            echo Service !SERVICE_NAME! does not exist. Creating service...
            nssm install "!SERVICE_NAME!" "!APPLICATION_PATH!"
            nssm set "!SERVICE_NAME!" Description "!SERVICE_DESC!"
            nssm set "!SERVICE_NAME!" AppStdout "!LOG_PATH!"
            nssm set "!SERVICE_NAME!" AppStderr "!ERROR_LOG_PATH!"
            nssm start "!SERVICE_NAME!"
            echo Service !SERVICE_NAME! created and started successfully.
        ) else (
            echo Service !SERVICE_NAME! already exists.
            nssm restart "!SERVICE_NAME!"
        )
    )
)