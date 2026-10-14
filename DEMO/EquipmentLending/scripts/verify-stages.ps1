param(
  [Parameter(Mandatory = $true)]
  [string] $DestinationRoot,
  [switch] $ValidateOnly
)

$ErrorActionPreference = 'Stop'
$gitRoot = & git -C $PSScriptRoot rev-parse --show-toplevel
if ($LASTEXITCODE -ne 0 -or -not $gitRoot) {
  throw '無法解析 Git repository 根目錄。'
}
$repoRoot = [System.IO.Path]::GetFullPath(($gitRoot | Select-Object -First 1))
$destination = [System.IO.Path]::GetFullPath($DestinationRoot)
$separator = [System.IO.Path]::DirectorySeparatorChar
$repoRoot = $repoRoot.TrimEnd([char[]]@('\', '/'))
$destination = $destination.TrimEnd([char[]]@('\', '/'))

if ($destination.Equals($repoRoot, [System.StringComparison]::OrdinalIgnoreCase) -or
    $destination.StartsWith($repoRoot + $separator, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw '練習根目錄必須位於 repository 外。'
}
if (Test-Path -LiteralPath $destination) {
  throw "目的路徑已存在，為避免覆寫而停止：$destination"
}
if ($ValidateOnly) {
  Write-Output "PASS destination is outside the repository: $destination"
  return
}

$stages = @(
  '00-starter',
  '01-console',
  '02-buggy',
  '03-fixed',
  '04-refactored',
  '05-tested',
  '06-sqlite',
  '07-web'
)
$testFiles = @{
  '01-console' = @('tests\scenario.test.js')
  '02-buggy' = @('tests\scenario.test.js')
  '03-fixed' = @('tests\scenario.test.js')
  '04-refactored' = @('tests\scenario.test.js')
  '05-tested' = @('tests\core.test.js', 'tests\time.test.js', 'tests\service.test.js')
  '06-sqlite' = @('tests\core.test.js', 'tests\time.test.js', 'tests\service.test.js', 'tests\cli.test.js')
  '07-web' = @('tests\core.test.js', 'tests\time.test.js', 'tests\service.test.js', 'tests\cli.test.js', 'tests\server.test.js')
}

$originalNodePath = $env:NODE_PATH
try {
  $env:NODE_PATH = ''
  New-Item -ItemType Directory -Path $destination | Out-Null

  foreach ($stage in $stages) {
    $source = Join-Path $PSScriptRoot "..\stages\$stage"
    $target = Join-Path $destination $stage
    Copy-Item -LiteralPath $source -Destination $target -Recurse
    $packagePath = Join-Path $target 'package.json'
    if (-not (Test-Path -LiteralPath $packagePath)) {
      throw "$stage 缺少 package.json。"
    }

    if ($stage -eq '00-starter') {
      $fixturePath = Join-Path $target 'fixtures\acceptance.json'
      Get-Content -LiteralPath $fixturePath -Raw | ConvertFrom-Json | Out-Null
      Write-Output "PASS $stage (規格與 fixture；尚無程式測試)"
      continue
    }

    Push-Location $target
    try {
      if ($stage -eq '07-web') {
        & pnpm install --frozen-lockfile --offline
        if ($LASTEXITCODE -ne 0) {
          throw '07-web frozen-lockfile 安裝失敗；請先依 README 使用核准的 registry 準備依賴。'
        }
      }

      $output = & node --test @($testFiles[$stage]) 2>&1
      $exitCode = $LASTEXITCODE
      $outputText = $output -join [Environment]::NewLine
      if ($stage -eq '02-buggy') {
        if ($exitCode -eq 0 -or $outputText -notmatch 'borrow, return, then borrow the same equipment again' -or
            $outputText -notmatch 'AssertionError') {
          throw "02-buggy 未以預期的 regression 失敗。`n$outputText"
        }
        Write-Output "PASS $stage (唯一預期 regression failure)"
      } elseif ($exitCode -ne 0) {
        throw "$stage 測試失敗。`n$outputText"
      } else {
        Write-Output "PASS $stage"
      }
    } finally {
      Pop-Location
    }
  }
  Write-Output "Snapshots copied to: $destination"
} finally {
  $env:NODE_PATH = $originalNodePath
}
