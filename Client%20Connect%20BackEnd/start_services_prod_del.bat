@echo off
set SERVICE_NAME=ccprod_allocation
set APPLICATION_PATH=E:\src\processor-py-prod\service_allocation.bat
set SERVICE_DESCRIPTION="Client Connect prod Allocation"

:: Check if the service exists
sc query %SERVICE_NAME% >nul 2>&1

:: If the service does not exist, do nothing else remove it
if %ERRORLEVEL% NEQ 0 (
    echo Service %SERVICE_NAME% does not exist
) else (
    echo Service %SERVICE_NAME% already exists.
    nssm remove %SERVICE_NAME% confirm
    echo Service %SERVICE_NAME% removed successfully.
)

set SERVICE_NAME=ccprod_check_external
set APPLICATION_PATH=E:\src\processor-py-prod\service_check_external.bat
set SERVICE_DESCRIPTION="Client Connect prod Check External"

:: Check if the service exists
sc query %SERVICE_NAME% >nul 2>&1

:: If the service does not exist, do nothing else remove it
if %ERRORLEVEL% NEQ 0 (
    echo Service %SERVICE_NAME% does not exist
) else (
    echo Service %SERVICE_NAME% already exists.
    nssm remove %SERVICE_NAME% confirm
    echo Service %SERVICE_NAME% removed successfully.
)

set SERVICE_NAME=ccprod_check_internal
set APPLICATION_PATH=E:\src\processor-py-prod\service_check_internal.bat
set SERVICE_DESCRIPTION="Client Connect prod Check Internal"

:: Check if the service exists
sc query %SERVICE_NAME% >nul 2>&1

:: If the service does not exist, do nothing else remove it
if %ERRORLEVEL% NEQ 0 (
    echo Service %SERVICE_NAME% does not exist
) else (
    echo Service %SERVICE_NAME% already exists.
    nssm remove %SERVICE_NAME% confirm
    echo Service %SERVICE_NAME% removed successfully.
)

set SERVICE_NAME=ccprod_coverCheck
set APPLICATION_PATH=E:\src\processor-py-prod\service_coverCheck.bat
set SERVICE_DESCRIPTION="Client Connect prod Cover Check"

:: Check if the service exists
sc query %SERVICE_NAME% >nul 2>&1

:: If the service does not exist, do nothing else remove it
if %ERRORLEVEL% NEQ 0 (
    echo Service %SERVICE_NAME% does not exist
) else (
    echo Service %SERVICE_NAME% already exists.
    nssm remove %SERVICE_NAME% confirm
    echo Service %SERVICE_NAME% removed successfully.
)

set SERVICE_NAME=ccprod_file_processor
set APPLICATION_PATH=E:\src\processor-py-prod\service_file_processor.bat
set SERVICE_DESCRIPTION="Client Connect prod File processor"

:: Check if the service exists
sc query %SERVICE_NAME% >nul 2>&1

:: If the service does not exist, do nothing else remove it
if %ERRORLEVEL% NEQ 0 (
    echo Service %SERVICE_NAME% does not exist
) else (
    echo Service %SERVICE_NAME% already exists.
    nssm remove %SERVICE_NAME% confirm
    echo Service %SERVICE_NAME% removed successfully.
)

set SERVICE_NAME=ccprod_service_flag_checks
set APPLICATION_PATH=E:\src\processor-py-prod\service_flag_checks.bat
set SERVICE_DESCRIPTION="Client Connect prod Flag checks"

:: Check if the service exists
sc query %SERVICE_NAME% >nul 2>&1

:: If the service does not exist, do nothing else remove it
if %ERRORLEVEL% NEQ 0 (
    echo Service %SERVICE_NAME% does not exist
) else (
    echo Service %SERVICE_NAME% already exists.
    nssm remove %SERVICE_NAME% confirm
    echo Service %SERVICE_NAME% removed successfully.
)

set SERVICE_NAME=ccprod_service_send4approval
set APPLICATION_PATH=E:\src\processor-py-prod\service_send4approval.bat
set SERVICE_DESCRIPTION="Client Connect prod Send 4 Approval"

:: Check if the service exists
sc query %SERVICE_NAME% >nul 2>&1

:: If the service does not exist, create it
if %ERRORLEVEL% NEQ 0 (
    echo Service %SERVICE_NAME% does not exist. Creating service...
    nssm install %SERVICE_NAME% %APPLICATION_PATH%
    nssm set %SERVICE_NAME% Description %SERVICE_DESCRIPTION%
    nssm set %SERVICE_NAME% AppStdout E:\src\service_prod.log
    nssm set %SERVICE_NAME% AppStderr E:\src\service-error-prod.log
    nssm start %SERVICE_NAME%
    echo Service %SERVICE_NAME% created and started successfully.
    nssm stop %SERVICE_NAME%
) else (
    echo Service %SERVICE_NAME% already exists.
    @REM nssm restart %SERVICE_NAME%
    nssm stop %SERVICE_NAME%
)

set SERVICE_NAME=ccprod_service_vopd_requests
set APPLICATION_PATH=E:\src\processor-py-prod\service_vopd_requests.bat
set SERVICE_DESCRIPTION="Client Connect prod VOPD Requests"

:: Check if the service exists
sc query %SERVICE_NAME% >nul 2>&1

:: If the service does not exist, do nothing else remove it
if %ERRORLEVEL% NEQ 0 (
    echo Service %SERVICE_NAME% does not exist
) else (
    echo Service %SERVICE_NAME% already exists.
    nssm remove %SERVICE_NAME% confirm
    echo Service %SERVICE_NAME% removed successfully.
)

set SERVICE_NAME=ccprod_service_vopd_update
set APPLICATION_PATH=E:\src\processor-py-prod\service_vopd_update.bat
set SERVICE_DESCRIPTION="Client Connect prod VOPD Update"

:: Check if the service exists
sc query %SERVICE_NAME% >nul 2>&1

:: If the service does not exist, do nothing else remove it
if %ERRORLEVEL% NEQ 0 (
    echo Service %SERVICE_NAME% does not exist
) else (
    echo Service %SERVICE_NAME% already exists.
    nssm remove %SERVICE_NAME% confirm
    echo Service %SERVICE_NAME% removed successfully.
)

set SERVICE_NAME=ccprod_service_vopd_v2response
set APPLICATION_PATH=E:\src\processor-py-prod\service_vopd_v2response.bat
set SERVICE_DESCRIPTION="Client Connect prod VOPD v2 Response"

:: Check if the service exists
sc query %SERVICE_NAME% >nul 2>&1

:: If the service does not exist, do nothing else remove it
if %ERRORLEVEL% NEQ 0 (
    echo Service %SERVICE_NAME% does not exist
) else (
    echo Service %SERVICE_NAME% already exists.
    nssm remove %SERVICE_NAME% confirm
    echo Service %SERVICE_NAME% removed successfully.
)

set SERVICE_NAME=ccprod_service_productOptionUpdate
set APPLICATION_PATH=E:\src\processor-py-prod\service_productOptionUpdate.bat
set SERVICE_DESCRIPTION="Client Connect prod Product Option Update"

:: Check if the service exists
sc query %SERVICE_NAME% >nul 2>&1

:: If the service does not exist, do nothing else remove it
if %ERRORLEVEL% NEQ 0 (
    echo Service %SERVICE_NAME% does not exist
) else (
    echo Service %SERVICE_NAME% already exists.
    nssm remove %SERVICE_NAME% confirm
    echo Service %SERVICE_NAME% removed successfully.
)


set SERVICE_NAME=ccprod_service_auth0_sync
set APPLICATION_PATH=E:\src\processor-py-prod\service_auth0_sync.bat
set SERVICE_DESCRIPTION="Client Connect prod Auth0 user sync"

:: Check if the service exists
sc query %SERVICE_NAME% >nul 2>&1

:: If the service does not exist, do nothing else remove it
if %ERRORLEVEL% NEQ 0 (
    echo Service %SERVICE_NAME% does not exist
) else (
    echo Service %SERVICE_NAME% already exists.
    nssm remove %SERVICE_NAME% confirm
    echo Service %SERVICE_NAME% removed successfully.
)

set SERVICE_NAME=ccprod_service_dailyreminder
set APPLICATION_PATH=E:\src\processor-py-prod\service_dailyreminder.bat
set SERVICE_DESCRIPTION="Client Connect prod Daily reminder e-mails"

:: Check if the service exists
sc query %SERVICE_NAME% >nul 2>&1

:: If the service does not exist, do nothing else remove it
if %ERRORLEVEL% NEQ 0 (
    echo Service %SERVICE_NAME% does not exist
) else (
    echo Service %SERVICE_NAME% already exists.
    nssm remove %SERVICE_NAME% confirm
    echo Service %SERVICE_NAME% removed successfully.
)