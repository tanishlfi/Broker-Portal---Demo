# RMA processor

Processor to run all checks

## file_processor.py

Load member file from storage acount.

Runs every minute.

```powershell
pipenv run python file_processor.py
```

## send4approval.py

Send file to modernisation.

Runs every 5 minutes.

```powershell
pipenv run python send4approval.py
```

## vopd_process.py

Updates members with VOPD responses

Runs every 10 minutes.

```powershell
pipenv run python vopd_process.py
```

## vopd_requests.py

Request vopd response from Astute and RMA and then V2.

Runs every 10 minutes.

```powershell
pipenv run python vopd_requests.py
```

## vopd_v2response.py

Get VOPD response from service bus queue.

Runs every 10 minutes.

```powershell
pipenv run python vopd_v2response.py
```

## vopd_updateRMA.py

Send VOPD responses for RMA to update on modernisation. (NOT NECESSARY FOR CLIENT CONNECT)

Runs every 120 minutes.

```powershell
pipenv run python vopd_updateRMA.py
```

## load_ids_interimprocess.py

Load ids from interimprocess. (NOT NECESSARY FOR CLIENT CONNECT)

Runs every 2 minutes.

```powershell
pipenv run python load_ids_interimprocess.py
```

## generate requirements.txt

Generate requirements for pip install from pipenv

```powershell
pipenv lock -r > requirements.txt
```

## INSTALL

```powershell
pip install pipenv
```

## USAGE

```powershell
pipenv install
```

## NSSM Log file

nssm set %SERVICE_NAME% AppStdout E:\src\service.log
nssm set %SERVICE_NAME% AppStderr E:\src\service-error.log
