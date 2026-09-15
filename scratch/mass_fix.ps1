# BTechPath AI OS — Master HTML Fix Script
# Replaces: Supabase CDN → local, Tailwind CDN → local CSS link
# Removes: duplicate Three.js script tags on pages that also load btech-bg3d.js

 = "c:\Users\LENOVO\Documents\GitHub\BTechPath AI OS"
 = Get-ChildItem -Path  -Filter "*.html" -File

 = @{ supabase = 0; tailwind_forms = 0; tailwind_both = 0; three_removed = 0; files_modified = 0 }

foreach ( in ) {
     = Get-Content .FullName -Raw -Encoding UTF8
     = 
    
    # 1. Replace Supabase CDN (forms variant)
     =  -replace '<script src="https://cdn\.jsdelivr\.net/npm/@supabase/supabase-js@2"></script>', '<script src="js/supabase.min.js"></script>'
    if ( -ne ) { .supabase++ }
    
    # 2. Replace Tailwind CDN with forms only
     =  -replace '<script src="https://cdn\.tailwindcss\.com\?plugins=forms"></script>', '<link rel="stylesheet" href="css/tailwind.output.css">'
    
    # 3. Replace Tailwind CDN with forms,container-queries
     =  -replace '<script src="https://cdn\.tailwindcss\.com\?plugins=forms,container-queries"></script>', '<link rel="stylesheet" href="css/tailwind.output.css">'
    
    # 4. Remove redundant js/three.min.js IF btech-bg3d.js is also on the page
    # (btech-bg3d.js loads three.min.js itself via loadThreeScript)
     =  -match 'btech-bg3d\.js'
    if () {
         = 
        # Remove the local three.min.js script tag
         =  -replace '\s*<script src="js/three\.min\.js"></script>', ''
        # Remove CDN three.min.js (like thank-you.html which uses cdnjs)  
         =  -replace '\s*<script src="https://cdnjs\.cloudflare\.com/ajax/libs/three\.js/[^"]+/three\.min\.js"></script>', ''
        if ( -ne ) { .three_removed++ }
    }
    
    if ( -ne ) {
        Set-Content -Path .FullName -Value  -Encoding UTF8 -NoNewline
        .files_modified++
    }
}

Write-Host "=== REPLACEMENT STATS ==="
Write-Host "Files modified: "
Write-Host "Supabase CDN replaced: "
Write-Host "Three.js duplicates removed: "
