$baseUrl = "http://localhost:8080"
$user = "admin"
$pass = "admin123"

Write-Host "🔍 Testing Material Requisition Submission..." -ForegroundColor Cyan

# 1. Login
Write-Host "✓ Logging in as $user..."
try {
    $loginData = @{
        username = $user
        password = $pass
    } | ConvertTo-Json
    
    $loginResp = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    $token = $loginResp.token
    
    if (-not $token) {
        Write-Error "❌ Login failed! No token in response."
        exit 1
    }
    Write-Host "✅ Login successful. Token: $($token.Substring(0, 10))..." -ForegroundColor Green
} catch {
    Write-Error "❌ Login failed! $_"
    exit 1
}

# 2. Get projects (to get a valid ID)
Write-Host "✓ Fetching projects..."
try {
    # Using the paginated projects endpoint
    $url = $baseUrl + '/api/v1/projects?page=0&size=1'
    $projectsResp = Invoke-RestMethod -Uri $url -Headers @{ Authorization = "Bearer $token" }
    $projects = $projectsResp.content
    if ($null -eq $projects -or $projects.Count -eq 0) {
        Write-Warning "⚠️ No projects found in system. Using fallback ID 1."
        $projectId = 1
    } else {
        $projectId = $projects[0].id
        Write-Host "✅ Found project: $($projects[0].name) (ID: $projectId)" -ForegroundColor Green
    }
} catch {
    Write-Warning "⚠️ Failed to fetch projects! Using fallback ID 1. Error: $_"
    $projectId = 1
}

# 3. Submit Requisition
Write-Host "✓ Submitting Requisition..."
try {
    $reqData = @{
        project = @{ id = $projectId }
        customItemName = "E2E Test Item (Cement)"
        quantity = 5.5
        unitOfMeasure = "BAGS"
        urgency = "URGENT"
        remarks = "Automated E2E Test"
    } | ConvertTo-Json
    
    $reqResp = Invoke-RestMethod -Uri "$baseUrl/api/requisitions" -Method Post -Body $reqData -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
    
    if ($reqResp.id) {
        Write-Host "🎉 SUCCESS: Requisition created with ID: $($reqResp.id)" -ForegroundColor Green
    } else {
        Write-Error "❌ Submission failed! Response: $($reqResp | ConvertTo-Json)"
        exit 1
    }
} catch {
    Write-Error "❌ Submission failed! $_"
    exit 1
}

Write-Host "🏁 Requisition Test PASSED" -ForegroundColor Cyan
