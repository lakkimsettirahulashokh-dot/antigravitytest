# PowerShell script to create repo and push code using GitHub Desktop credentials

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

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "BTechPath-Dev-Tools"
}

Write-Host "Verifying GitHub authentication..."
$user = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
$login = $user.login
Write-Host "Logged in as: $login ($($user.name))"

$repoName = "antigravitytest"
Write-Host "Checking if repository '$repoName' exists..."

$repo = $null
try {
    $repo = Invoke-RestMethod -Uri "https://api.github.com/repos/$login/$repoName" -Headers $headers
    Write-Host "Repository '$repoName' already exists on GitHub."
} catch {
    Write-Host "Repository does not exist. Creating new repository '$repoName'..."
    $body = @{
        name = $repoName
        description = "TechPath AI OS - Engineering Education & Career Platform"
        private = $false
        auto_init = $false
    } | ConvertTo-Json

    $repo = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body
    Write-Host "Repository created successfully: $($repo.html_url)"
}

Write-Host "Repo URL: $($repo.clone_url)"
