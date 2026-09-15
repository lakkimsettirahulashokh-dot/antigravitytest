# PowerShell script to stage, commit, and push codebase to antigravitytest repo
$ErrorActionPreference = "Stop"

$source = @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public class WinCredManager {
    [DllImport("Advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern bool CredRead(string target, int type, int reservedFlag, out IntPtr credentialPtr);

    [DllImport("Advapi32.dll", EntryPoint = "CredFree", SetLastError = true)]
    public static extern void CredFree(IntPtr credential);

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct CREDENTIAL {
        public int Flags;
        public int Type;
        public string TargetName;
        public string Comment;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
        public int CredentialBlobSize;
        public IntPtr CredentialBlob;
        public int Persist;
        public int AttributeCount;
        public IntPtr Attributes;
        public string TargetAlias;
        public string UserName;
    }

    public static string GetPassword(string target) {
        IntPtr credPtr;
        if (CredRead(target, 1, 0, out credPtr)) {
            try {
                CREDENTIAL cred = (CREDENTIAL)Marshal.PtrToStructure(credPtr, typeof(CREDENTIAL));
                if (cred.CredentialBlobSize > 0 && cred.CredentialBlob != IntPtr.Zero) {
                    byte[] bytes = new byte[cred.CredentialBlobSize];
                    Marshal.Copy(cred.CredentialBlob, bytes, 0, cred.CredentialBlobSize);
                    return Encoding.UTF8.GetString(bytes);
                }
            } finally {
                CredFree(credPtr);
            }
        }
        return null;
    }
}
"@

Add-Type -TypeDefinition $source

$targetKey = "LegacyGeneric:target=GitHub - https://api.github.com/lakkimsettirahulashokh-dot"
$token = [WinCredManager]::GetPassword($targetKey)

if (-not $token) {
    Write-Error "Could not retrieve GitHub token from Windows Credential Manager."
    exit 1
}

$gitExe = "C:\Users\LENOVO\AppData\Local\GitHubDesktop\app-3.6.5\resources\app\git\cmd\git.exe"
if (-not (Test-Path $gitExe)) {
    Write-Error "Git executable not found at $gitExe"
    exit 1
}

Write-Host "Using Git from: $gitExe"
& $gitExe --version

# Ensure git config has user.name and user.email set locally if not present
$userName = (& $gitExe config user.name)
if (-not $userName) {
    Write-Host "Setting local git user.name..."
    & $gitExe config user.name "lakkimsettirahulashokh-dot"
}
$userEmail = (& $gitExe config user.email)
if (-not $userEmail) {
    Write-Host "Setting local git user.email..."
    & $gitExe config user.email "lakkimsettirahulashokh@gmail.com"
}

# Check if git repository is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing git repository..."
    & $gitExe init
}

Write-Host "Adding files to staging..."
& $gitExe add .

Write-Host "Verifying staged files..."
$staged = & $gitExe diff --cached --name-only
if ($staged -match "\.env$") {
    Write-Error "CRITICAL: .env was staged! Unstaging immediately."
    & $gitExe reset HEAD .env
    exit 1
}

Write-Host "Staged file count: $($staged.Count)"

# Check if there are changes to commit
$status = & $gitExe status --porcelain
if ($status) {
    Write-Host "Committing changes..."
    & $gitExe commit -m "Initial commit: TechPath AI OS - Engineering Education & Career Platform with Full Security Suite"
} else {
    Write-Host "No changes to commit (working tree clean)."
}

# Ensure branch is main
Write-Host "Setting active branch to main..."
& $gitExe branch -M main

# Configure remote origin
$login = "lakkimsettirahulashokh-dot"
$repoName = "antigravitytest"
$authUrl = "https://${login}:${token}@github.com/${login}/${repoName}.git"
$cleanUrl = "https://github.com/${login}/${repoName}.git"

$existingRemote = & $gitExe remote
if ($existingRemote -contains "origin") {
    Write-Host "Updating origin remote URL..."
    & $gitExe remote set-url origin $authUrl
} else {
    Write-Host "Adding origin remote..."
    & $gitExe remote add origin $authUrl
}

try {
    Write-Host "Pushing to GitHub: origin main..."
    & $gitExe push -u origin main --force
    Write-Host "Successfully pushed to GitHub!"
} finally {
    # Ensure sensitive token is scrubbed from .git/config
    Write-Host "Scrubbing credentials from local git remote URL..."
    & $gitExe remote set-url origin $cleanUrl
}

Write-Host "Verification: checking remote commits..."
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "BTechPath-Dev-Tools"
}
$commits = Invoke-RestMethod -Uri "https://api.github.com/repos/$login/$repoName/commits" -Headers $headers
Write-Host "Latest commit on remote: $($commits[0].sha.Substring(0,7)) - $($commits[0].commit.message)"
Write-Host "Repository URL: https://github.com/$login/$repoName"
