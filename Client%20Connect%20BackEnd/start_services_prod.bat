@echo off
setlocal EnableDelayedExpansion

:: Define common paths
set "BASE_PATH=E:\src\processor-py-prod"
set "LOG_PATH=E:\src\service_prod.log"
set "ERROR_LOG_PATH=E:\src\service-error-prod.log"

:: Define service configurations
set "SERVICES[0]=ccprod_allocation;service_allocation.bat;Client Connect prod Allocation"
set "SERVICES[1]=ccprod_coverCheck;service_coverCheck.bat;Client Connect prod Cover Check"
set "SERVICES[2]=ccprod_file_processor;service_file_processor.bat;Client Connect prod File processor"
set "SERVICES[3]=ccprod_service_send4approval;service_send4approval.bat;Client Connect prod Send 4 Approval"
set "SERVICES[4]=ccprod_service_vopd_requests;service_vopd_requests.bat;Client Connect prod VOPD Requests"
set "SERVICES[5]=ccprod_service_productOptionUpdate;service_productOptionUpdate.bat;Client Connect prod Product Option Update"
set "SERVICES[6]=ccprod_service_dailyreminder;service_dailyreminder.bat;Client Connect prod Daily reminder e-mails"
set "SERVICES[7]=ccprod_generate_files;service_generateFiles.bat;Client Connect prod Generate Files"
set "SERVICES[8]=ccprod_auth0_maintenance;service_auth0Maintenance.bat;Client Connect prod Auth0 Maintenance"

:: Loop through the SERVICES array and configure each service
for /L %%i in (0,1,9) do (
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