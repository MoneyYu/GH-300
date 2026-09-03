# GH-300 Repository Instructions

- Preserve each `DEMO\SampleApps\` folder as an independent teaching snapshot.
- Always select the target sample before editing. Do not synchronize, normalize, or cross-pollinate M4/M5 BankAccount or SalesReport variants.
- Treat incomplete code and mismatched expectations as deliberate exercise context, not a repository-wide regression.
- Do not install, update, or change dependencies solely to validate an intentionally incomplete training baseline. Provision pinned dependencies only when the user explicitly requests environment setup.
- Respond to the repository user in Traditional Chinese.
- For course preparation or refresh work, use `.github\skills\course-prep`.
- For authoritative, version-specific third-party API guidance, use `.github\skills\context7`.

## Repository map

- `README.md` is the attendee-facing GH-300 course reference.
- `docs/` contains trainer-only course preparation material; keep instructor guidance and demo-environment details out of the attendee README.
- `DEMO\DEMO.md` is a catalog of historical Agent demo prompts, not a runnable application.
- `DEMO\SampleApps\` contains independent module/topic snapshots.
- `PPT\` is local instructor slide material and is intentionally git-ignored.

## .NET commands

```powershell
dotnet build 'DEMO\SampleApps\APL2007M3SalesReport-CodeLogicChallenge\APL2007M3SalesReport.csproj'
dotnet test 'DEMO\SampleApps\APL2007M4PrimeService-UnitTests\PrimeService.UnitTests\PrimeService.UnitTests.csproj'
dotnet test 'DEMO\SampleApps\APL2007M4PrimeService-UnitTests\PrimeService.UnitTests\PrimeService.UnitTests.csproj' --filter 'FullyQualifiedName~PrimeServiceTests.IsPrime_InputIs2_ReturnTrue' --nologo
```

- All .NET projects are standalone.
- Target frameworks are `net6.0` or `net8.0`, except the PrimeService library, which targets `netstandard2.0`.
- No root solution, lint configuration, CI workflow, or aggregate test command exists.
- Do not stage generated `bin/`, `obj/`, `.venv/`, or package-cache output from an individual snapshot.

## Python commands

```powershell
Set-Location 'DEMO\SampleApps\APL2007M3Python'
# Only when explicitly asked to provision this environment:
uv venv --python 3.11 --no-python-downloads .venv
uv pip install --python .\.venv\Scripts\python.exe --index-url https://packagefeedproxy.microsoft.io/pypi/simple/ -r requirements.txt

# Use an existing environment for validation:
$env:PYTHONPATH = 'src'
.\.venv\Scripts\python.exe -m pytest tests\test_main.py
.\.venv\Scripts\python.exe -m pytest tests\test_main.py -k test_add_numbers
```

- This project pins `pytest==6.2.5`.
- The current source/test mismatch is a training baseline that must be assessed in the target snapshot's context.
- If the required Python 3.11 interpreter or pytest environment is unavailable, report that state; do not change the pinned dependency or source merely to make the baseline pass.
