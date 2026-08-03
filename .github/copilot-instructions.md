# GH-300 Repository Instructions

- Preserve each `DEMO\SampleApps\` folder as an independent teaching snapshot.
- Always select the target sample before editing. Do not synchronize, normalize, or cross-pollinate M4/M5 BankAccount or SalesReport variants.
- Treat incomplete code and mismatched expectations as deliberate exercise context, not a repository-wide regression.
- Do not install or update dependencies solely to validate an intentionally incomplete training baseline.
- Respond to the repository user in Traditional Chinese.
- For course preparation or refresh work, use `.github\skills\course-prep`.
- For authoritative, version-specific third-party API guidance, use `.github\skills\context7`.

## Repository map

- `README.md` is the attendee-facing GH-300 course reference.
- `DEMO\DEMO.md` is a catalog of historical Agent demo prompts, not a runnable application.
- `DEMO\SampleApps\` contains independent module/topic snapshots.

## .NET commands

```powershell
dotnet build 'DEMO\SampleApps\APL2007M3SalesReport-CodeLogicChallenge\APL2007M3SalesReport.csproj'
dotnet test 'DEMO\SampleApps\APL2007M4PrimeService-UnitTests\PrimeService.UnitTests\PrimeService.UnitTests.csproj'
dotnet test 'DEMO\SampleApps\APL2007M4PrimeService-UnitTests\PrimeService.UnitTests\PrimeService.UnitTests.csproj' --filter 'FullyQualifiedName~PrimeServiceTests.IsPrime_InputIs2_ReturnTrue' --nologo
```

- All .NET projects are standalone.
- Target frameworks are `net6.0` or `net8.0`, except the PrimeService library, which targets `netstandard2.0`.
- No root solution, lint configuration, CI workflow, or aggregate test command exists.

## Python commands

```powershell
Set-Location 'DEMO\SampleApps\APL2007M3Python'
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
$env:PYTHONPATH = 'src'
python -m pytest tests\test_main.py
python -m pytest tests\test_main.py -k test_add_numbers
```

- This project pins `pytest==6.2.5`.
- The current source/test mismatch is a training baseline that must be assessed in the target snapshot's context.
