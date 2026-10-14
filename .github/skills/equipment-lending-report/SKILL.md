---
name: equipment-lending-report
description: Use when checking current equipment availability, borrowed loans, overdue items, or a read-only status report in the GH-300 EquipmentLending demo.
---

# Equipment Lending Read-only Report

Use this Skill only for the local `DEMO\EquipmentLending` demo. It can read the existing loan report and run its existing regression suite; it cannot create or change demo data.

## Allowed commands

Run commands only from `DEMO\EquipmentLending`:

```powershell
node src\cli.js report --json
pnpm test
```

Run `report --json` when the request asks for equipment or overdue status. Run `pnpm test` only when asked to validate the existing unit and HTTP suite. Do not add command options or substitute another project path.

## Data boundary

- Never run `init`, `borrow`, `return`, or any command that writes, deletes, resets, migrates, seeds, or repairs data.
- A missing database, invalid schema, locked database, nonzero command, or malformed report is an explicit failure. Stop and report the exact error; do not initialize an empty database, install packages, create a success-shaped empty report, or retry with a different path.
- A user request to initialize or modify data does not change this Skill's read-only boundary. Explain that the requested action is outside this Skill.
- Do not inspect, copy, query, or infer data from another project or database.
- Do not claim the demo seed represents real employee or equipment records.

## Report interpretation

Use only the actual JSON emitted by `report --json`. Explain that `overdue` means an active loan whose server UTC time is at or past its due instant; returned loans remain history and are not active. If the report fails, say that the current status is unknown rather than saying there are no overdue loans.

## Common mistakes

| Mistake | Safe response |
| --- | --- |
| “The DB is missing; initialize it so the report works.” | Stop at `DATABASE_NOT_FOUND`; do not run `init`. |
| “The report is empty, so no one is overdue.” | Confirm the report command succeeded and includes its summary; a failed command is not an empty result. |
| “Tests need dependencies, so install them.” | Report the test failure; dependency setup is outside the allowed command list. |
| “Use a different project’s database.” | Refuse; the Skill is scoped to this demo and its default DB only. |
