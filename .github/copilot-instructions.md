# GH-300 Repository Instructions

- This is a course-reference repository, not one deployable application. Most executable code is historical teaching material under `DEMO\SampleApps\`.
- Preserve each `DEMO\SampleApps\` folder as an independent teaching snapshot.
- Always select the target sample before editing. Do not synchronize, normalize, or cross-pollinate M4/M5 BankAccount or SalesReport variants.
- Treat incomplete code and mismatched expectations as deliberate exercise context, not a repository-wide regression.
- Do not install, update, or change dependencies solely to validate an intentionally incomplete training baseline. Provision pinned dependencies only when the user explicitly requests environment setup.
- Respond to the repository user in Traditional Chinese.
- For course preparation or refresh work, use `.github\skills\course-prep`, but skip its Terraform backup, Azure model, deployment, and destroy steps for GH-300.
- Never create a Terraform demo environment or run `terraform apply` / `terraform destroy` for this course.
- For authoritative, version-specific third-party API guidance, use `.github\skills\context7`.

## Architecture

- `README.md` is the attendee-facing GH-300 reference: course links, labs, current Copilot topics, exam resources, and the mind map.
- `docs\teaching-guide.md` and `docs\demo-environment.md` are trainer-only. Keep instructor guidance, environment details, and verified demo results out of the attendee README.
- `DEMO\DEMO.md` and `DEMO\PROMPT.md` are prompt catalogs used during instruction, not application entry points.
- `DEMO\SampleApps\` is a collection of standalone C# and Python snapshots. Folder names retain the older APL2007 module labels; use `docs\demo-environment.md` to map them to GH-300 teaching purposes.
- There is no root solution or aggregate application. Build and test only the selected project or snapshot.
- `PPT\` is local instructor slide material and is intentionally git-ignored.

## Build and test commands

### .NET

```powershell
dotnet build 'DEMO\SampleApps\APL2007M3SalesReport-CodeLogicChallenge\APL2007M3SalesReport.csproj'
dotnet test 'DEMO\SampleApps\APL2007M4PrimeService-UnitTests\PrimeService.UnitTests\PrimeService.UnitTests.csproj'
dotnet test 'DEMO\SampleApps\APL2007M4PrimeService-UnitTests\PrimeService.UnitTests\PrimeService.UnitTests.csproj' --filter 'FullyQualifiedName~PrimeServiceTests.IsPrime_InputIs2_ReturnTrue' --nologo
```

- All .NET projects are standalone.
- Target frameworks are `net6.0`, `net6.0-windows`, or `net8.0`, except the PrimeService library, which targets `netstandard2.0`.

### Python

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

## Validation and repository conventions

- No root lint configuration, CI workflow, or aggregate build/test command exists. Do not invent a repository-wide lint step.
- Use the smallest command that validates the selected snapshot. A failure in one snapshot does not establish a regression in its siblings.
- Do not add cross-project references or copy fixes between similarly named samples unless the user explicitly requests it.
- Do not stage generated `bin\`, `obj\`, `.venv\`, `__pycache__\`, `.pytest_cache\`, or package-cache output.
- This course does not require an Azure demo environment or Terraform. Do not add infrastructure for routine course work.
