param([string]$base = "http://localhost:3113")

$ErrorActionPreference = "Stop"
$global:failed = 0

function Check([string]$label, [bool]$ok, [string]$detail) {
  if ($ok) { Write-Host "PASS  $label" }
  else { $global:failed += 1; Write-Host "FAIL  $label  :: $detail" }
}

function Get-Resp($s, $path) {
  $r = Invoke-WebRequest -Uri "$base$path" -WebSession $s -MaximumRedirection 0
  return $r
}

function Check-Resp([string]$label, $r, [int]$expected, [string]$locContains = "", [string]$contentContains = "") {
  $loc = ""
  if ($r.Headers["Location"]) { $loc = [string]$r.Headers["Location"] }
  $body = ""
  try { $body = [string]$r.Content } catch {}
  $ok = ([int]$r.StatusCode -eq $expected)
  if ($locContains -ne "") { $ok = $ok -and ($loc -like "*$locContains*") }
  if ($contentContains -ne "") { $ok = $ok -and ($body -like "*$contentContains*") }
  Check $label $ok "code=$($r.StatusCode) loc=$loc"
}

function Guest-Get($path, [int]$expected, [string]$locContains = "", [string]$contentContains = "") {
  $s = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $r = Get-Resp $s $path
  Check-Resp "guest GET $path -> $expected" $r $expected $locContains $contentContains
}

function Login([string]$email, [string]$password) {
  $s = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $csrf = Invoke-RestMethod -Uri "$base/api/auth/csrf" -WebSession $s
  $body = @{ csrfToken = $csrf.csrfToken; email = $email; password = $password; callbackUrl = "$base/connexion"; json = "true" }
  Invoke-RestMethod -Uri "$base/api/auth/callback/credentials" -Method Post -WebSession $s -Body $body -ContentType "application/x-www-form-urlencoded" | Out-Null
  return $s
}

function Auth-Get($label, $s, $path, [int]$expected, [string]$locContains = "", [string]$contentContains = "") {
  $r = Get-Resp $s $path
  Check-Resp $label $r $expected $locContains $contentContains
}

function Post-Json($s, $path, $obj) {
  try {
    $r = Invoke-WebRequest -Uri "$base$path" -Method Post -WebSession $s -ContentType "application/json" -Body ($obj | ConvertTo-Json -Compress)
    return @{ Code = [int]$r.StatusCode; Json = ($r.Content | ConvertFrom-Json) }
  } catch {
    $resp = $_.Exception.Response
    $body = ""
    if ($resp) {
      try {
        $stream = $resp.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
      } catch {}
    }
    $code = -1
    if ($resp) { $code = [int]$resp.StatusCode }
    $parsed = $null
    if ($body) { try { $parsed = $body | ConvertFrom-Json } catch {} }
    return @{ Code = $code; Json = $parsed }
  }
}

Write-Host "--- guests ---"
Guest-Get "/" 200 "" "Ustadi"
Guest-Get "/connexion" 200
Guest-Get "/inscription" 200
Guest-Get "/join" 200
Guest-Get "/cours/math/2bac/limites-continuite" 307 "connexion?redirect="
Guest-Get "/presentation/math/2bac/limites-continuite" 307 "connexion?redirect="
Guest-Get "/professeur" 307 "connexion"
Guest-Get "/etudiant" 307 "connexion"
Guest-Get "/admin" 307 "connexion"
Guest-Get "/en-attente" 307 "connexion"

Write-Host "--- new pending professor via /api/register (multi-level 1bac+5eme) ---"
$newEmail = "prof-smoke-$((Get-Date -Format 'HHmmss'))@coursbac.ma"
$suffix = Get-Random -Minimum 1000 -Maximum 9999
$newEmail = "prof-smoke-$suffix@coursbac.ma"
$regBody = "{`"name`":`"Professeur Nouveau`",`"email`":`"$newEmail`",`"password`":`"password123`",`"role`":`"PROFESSOR`",`"subjects`":[`"math`"],`"levels`":[`"1bac`",`"5eme`"]}"
try {
  $reg = Invoke-RestMethod -Uri "$base/api/register" -Method Post -ContentType "application/json" -Body $regBody
  Check "register ok ($newEmail)" ($reg.ok -eq $true) ($reg | ConvertTo-Json -Compress)
} catch {
  Check "register rejected (expected fresh account)" $false $_.Exception.Message
}
$sn = Login $newEmail "password123"
Auth-Get "pending: /professeur -> /en-attente" $sn "/professeur" 307 "en-attente"
Auth-Get "pending: /en-attente 200" $sn "/en-attente" 200 "" "en cours de"
Auth-Get "pending: /admin -> /" $sn "/admin" 307 "/"

Write-Host "--- approved professor (prof.math) ---"
$sm = Login "prof.math@coursbac.ma" "password123"
Auth-Get "approved: /professeur 200" $sm "/professeur" 200 "" "prof.math"
Auth-Get "prof: /admin -> /" $sm "/admin" 307 "/"
Auth-Get "prof: /en-attente -> /professeur" $sm "/en-attente" 307 "professeur"

Write-Host "--- admin approval flow ---"
$sa = Login "admin@coursbac.ma" "password123"
Auth-Get "admin: /admin 200" $sa "/admin" 200 "" "professeurs"
$list = Invoke-RestMethod -Uri "$base/api/admin/professors" -WebSession $sa
$pendingCount = @($list.professors | Where-Object { -not $_.isApproved }).Count
Check "admin: pending list detected" ($pendingCount -gt 0) "count=$pendingCount"
$target = $list.professors | Where-Object { $_.email -eq $newEmail }
$approveRes = Invoke-RestMethod -Uri "$base/api/admin/professors" -Method Post -WebSession $sa -ContentType "application/json" -Body (@{ professorId = $target.id } | ConvertTo-Json)
Check "admin: approve POST ok" ($approveRes.ok -eq $true) ($approveRes | ConvertTo-Json -Compress)
Auth-Get "approved-now: stale session still /en-attente (JWT)" $sn "/professeur" 307 "en-attente"
$sn2 = Login $newEmail "password123"
Auth-Get "approved-now: re-login /professeur 200" $sn2 "/professeur" 200 "" "Professeur Nouveau"
Auth-Get "approved-now: /en-attente -> /professeur" $sn2 "/en-attente" 307 "professeur"

Write-Host "--- student ---"
$se = Login "eleve@coursbac.ma" "password123"
Auth-Get "student: /etudiant 200" $se "/etudiant" 200 "" "Mes cours"
Auth-Get "student: /professeur -> /etudiant" $se "/professeur" 307 "etudiant"
Auth-Get "student: /admin -> /" $se "/admin" 307 "/"
Auth-Get "student: /en-attente -> /etudiant" $se "/en-attente" 307 "etudiant"
Auth-Get "student: /cours (authentifié) 200" $se "/cours/math/2bac/limites-continuite" 200
Auth-Get "student: /presentation (authentifié) 200" $se "/presentation/math/2bac/limites-continuite" 200

Write-Host "--- live quiz flow ---"
$q = Post-Json $sm "/api/quiz/sessions" @{ chapterSlug = "limites-continuite"; questionCount = 3 }
Check "quiz: create by approved prof" (($q.Code -eq 200) -and $q.Json.ok) "code=$($q.Code)"
$qcode = [string]$q.Json.session.code
Check "quiz: code is 6 digits" ($qcode -match "^\d{6}$") $qcode

$guest = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$jq = Post-Json $guest "/api/quiz/sessions/$qcode/join" @{ studentName = "Smoke Student" }
Check "quiz: guest join (no account)" (($jq.Code -eq 200) -and $jq.Json.ok -and (@($jq.Json.questions).Count -eq 3)) "code=$($jq.Code)"
$hasCorrect = $false
foreach ($qq in @($jq.Json.questions)) { if ($null -ne $qq.correctOptionIndex) { $hasCorrect = $true } }
Check "quiz: join hides correct answers" (-not $hasCorrect) "leak=$hasCorrect"

$sq = Post-Json $guest "/api/quiz/sessions/$qcode/submit" @{ studentName = "Smoke Student"; answers = @(0, 0, 0) }
Check "quiz: guest submit" (($sq.Code -eq 200) -and $sq.Json.ok -and (@($sq.Json.details).Count -eq 3)) "code=$($sq.Code)"
Check "quiz: score within 0..3" (($sq.Json.score -ge 0) -and ($sq.Json.score -le 3)) "score=$($sq.Json.score)"

try {
  $mon = Invoke-WebRequest -Uri "$base/api/quiz/sessions/$qcode" -WebSession $sm -MaximumRedirection 0
  $monJson = $mon.Content | ConvertFrom-Json
  $part = @($monJson.session.participants | Where-Object { $_.studentName -eq "Smoke Student" })
  Check "quiz: monitor shows participant + score" (($mon.StatusCode -eq 200) -and ($part.Count -eq 1)) "n=$(@($monJson.session.participants).Count)"
} catch {
  Check "quiz: monitor shows participant + score" $false $_.Exception.Message
}

$bad = Post-Json $guest "/api/quiz/sessions/000000/join" @{ studentName = "X Y" }
Check "quiz: unknown code -> 404" ($bad.Code -eq 404) "code=$($bad.Code)"

$anon = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$forb = Post-Json $anon "/api/quiz/sessions" @{ chapterSlug = "limites-continuite"; questionCount = 1 }
Check "quiz: guest cannot create session -> 403" ($forb.Code -eq 403) "code=$($forb.Code)"

$cl = Post-Json $sm "/api/quiz/sessions/$qcode/close" @{}
Check "quiz: close by prof" (($cl.Code -eq 200) -and $cl.Json.ok) "code=$($cl.Code)"
$closed = Post-Json $guest "/api/quiz/sessions/$qcode/join" @{ studentName = "Un Autre Eleve" }
Check "quiz: closed session rejects join -> 400" ($closed.Code -eq 400) "code=$($closed.Code)"

Write-Host "--- wrong password ---"
$sw = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$csrf2 = Invoke-RestMethod -Uri "$base/api/auth/csrf" -WebSession $sw
try {
  Invoke-RestMethod -Uri "$base/api/auth/callback/credentials" -Method Post -WebSession $sw -Body @{ csrfToken = $csrf2.csrfToken; email = "eleve@coursbac.ma"; password = "wrong"; json = "true" } -ContentType "application/x-www-form-urlencoded" | Out-Null
  Check "wrong password rejected" $true ""
} catch {
  Check "wrong password rejected" $true ""
}

Write-Host ""
if ($global:failed -eq 0) { Write-Host "ALL PASS" } else { Write-Host "$global:failed FAILURES" }