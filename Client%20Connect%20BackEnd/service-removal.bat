@echo off
echo Starting service removal...

:: Remove allocation service
echo Removing ccprod_allocation service...
nssm remove ccprod_allocation confirm

:: Remove cover check service
echo Removing ccprod_coverCheck service...
nssm remove ccprod_coverCheck confirm

:: Remove file processor service
echo Removing ccprod_file_processor service...
nssm remove ccprod_file_processor confirm

:: Remove send4approval service
echo Removing ccprod_service_send4approval service...
nssm remove ccprod_service_send4approval confirm

:: Remove vopd requests service
echo Removing ccprod_service_vopd_requests service...
nssm remove ccprod_service_vopd_requests confirm

:: Remove vopd v2response service
echo Removing ccprod_service_vopd_v2response service...
nssm remove ccprod_service_vopd_v2response confirm

:: Remove product option update service
echo Removing ccprod_service_productOptionUpdate service...
nssm remove ccprod_service_productOptionUpdate confirm

:: Remove auth0 sync service
echo Removing ccprod_service_auth0_sync service...
nssm remove ccprod_service_auth0_sync confirm

:: Remove daily reminder service
echo Removing ccprod_service_dailyreminder service...
nssm remove ccprod_service_dailyreminder confirm

:: Remove generate files service
echo Removing ccprod_generate_files service...
nssm remove ccprod_generate_files confirm

echo Service removal complete.
pause
