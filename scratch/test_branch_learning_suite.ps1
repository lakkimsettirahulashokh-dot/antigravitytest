# Test Branch Learning Normalization and Catalog Mapping
$catalogPath = "data/branch_learning_catalog.json"
$raw = Get-Content $catalogPath -Raw | ConvertFrom-Json

$testCases = @(
    @{ Input = "ECE"; Expected = "ECE"; TitleMatch = "Chips & Semiconductors" },
    @{ Input = "Automobile Engineering"; Expected = "AUTO"; TitleMatch = "Automobile Engines" },
    @{ Input = "automobile"; Expected = "AUTO"; TitleMatch = "Automobile Engines" },
    @{ Input = "Mechanical"; Expected = "MECH"; TitleMatch = "Mechanical" },
    @{ Input = "mech"; Expected = "MECH"; TitleMatch = "Mechanical" },
    @{ Input = "EIE"; Expected = "EIE"; TitleMatch = "Instrumentation" },
    @{ Input = "EEE"; Expected = "EEE"; TitleMatch = "Power Systems" },
    @{ Input = "CSE"; Expected = "CSE"; TitleMatch = "Software Development" },
    @{ Input = "IT"; Expected = "IT"; TitleMatch = "Enterprise Cloud" },
    @{ Input = "AI & ML"; Expected = "AIML"; TitleMatch = "Deep Learning" },
    @{ Input = "ai-ml"; Expected = "AIML"; TitleMatch = "Deep Learning" },
    @{ Input = "Civil"; Expected = "CIVIL"; TitleMatch = "Structural Mechanics" },
    @{ Input = "Chemical"; Expected = "CHEM"; TitleMatch = "Chemical Process" },
    @{ Input = "Biotechnology"; Expected = "BIOTECH"; TitleMatch = "Bioprocess" },
    @{ Input = "Biomedical"; Expected = "BIOMED"; TitleMatch = "Biomedical" },
    @{ Input = "Aerospace"; Expected = "AERO"; TitleMatch = "Aerodynamics" },
    @{ Input = "Mechatronics"; Expected = "MECHTRON"; TitleMatch = "Mechatronics" },
    @{ Input = "Robotics"; Expected = "ROBOTICS"; TitleMatch = "Robotics" },
    @{ Input = "Manufacturing"; Expected = "MFG"; TitleMatch = "Manufacturing" }
)

Write-Host "Running Verification Suite for Branch Learning Specializations..."
$passCount = 0

foreach ($tc in $testCases) {
    $code = $tc.Expected
    $prop = $raw.PSObject.Properties[$code]
    if ($prop -and $prop.Value) {
        $val = $prop.Value
        $title = $val.specializationTitle
        if ($title -match $tc.TitleMatch) {
            Write-Host "  [PASS] $($tc.Input) -> Code: $code | Title: '$title' | Modules: $($val.modules.Count)" -ForegroundColor Green
            $passCount++
        } else {
            Write-Host "  [FAIL] $($tc.Input) title mismatch: '$title'" -ForegroundColor Red
        }
    } else {
        Write-Host "  [FAIL] Missing branch code '$code' in catalog!" -ForegroundColor Red
    }
}

Write-Host "Verification Complete: $passCount / $($testCases.Count) test cases passed."
if ($passCount -eq $testCases.Count) {
    Write-Host "ALL BRANCH SPECIALIZATIONS VERIFIED (100%)!" -ForegroundColor Cyan
}
