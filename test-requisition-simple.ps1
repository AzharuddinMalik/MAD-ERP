$baseUrl = "http://localhost:8080"
$user = "admin"
$pass = "admin123"

# 1. Login
$loginData = @{ username = $user; password = $pass } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
$token = $loginResp.token

# 2. Submit
try {
    $reqData = @{
        project = @{ id = 1 }
        customItemName = "E2E Test Item"
        quantity = 1.0
        unitOfMeasure = "PCS"
        urgency = "NORMAL"
        remarks = "Final E2E Test"
    } | ConvertTo-Json
    
    $reqResp = Invoke-RestMethod -Uri "$baseUrl/api/requisitions" -Method Post -Body $reqData -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
    $reqResp | ConvertTo-Json
} catch {
    $_.Exception.Message
}
