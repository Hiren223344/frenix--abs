
$endpoint = "https://sgp.cloud.appwrite.io/v1"
$projectId = "69ff1325002b662d7d07"
$apiKey = "standard_a51bad52221819d2d52c50e95fd1d43d159e42e57bfabe7cd6cef327d989b6a31d7ea83b501e11f31cd6009dafe336a02b5a9fb873b5b5d8fa2b57ac7721d7e6d8e669063b7b0f60be7b6fcc38a486b4838712d9af35f54e23721799211c913f84cae62fde8ccf50447acfdb9535eded4bc5b9958d1cf0f1e7915e51d6baae21"
$databaseId = "69ff1c05000a214b9934"

function Call-Appwrite($path, $method, $body) {
    $headers = @{
        "X-Appwrite-Project" = $projectId
        "X-Appwrite-Key" = $apiKey
        "Content-Type" = "application/json"
    }
    
    $uri = "$endpoint$path"
    Write-Host "Calling $method $uri"
    
    try {
        if ($body) {
            Invoke-RestMethod -Uri $uri -Method $method -Headers $headers -Body ($body | ConvertTo-Json)
        } else {
            Invoke-RestMethod -Uri $uri -Method $method -Headers $headers
        }
    } catch {
        $errorResponse = $_.Exception.Message
        Write-Host "Error: $errorResponse"
        return $null
    }
}

# Create collections
Call-Appwrite "/databases/$databaseId/collections" "Post" @{
    collectionId = "requests"
    name = "Requests"
    permissions = @('read("any")', 'create("any")')
    documentSecurity = $false
}

Call-Appwrite "/databases/$databaseId/collections" "Post" @{
    collectionId = "apiKeys"
    name = "API Keys"
    permissions = @('read("any")', 'create("any")')
    documentSecurity = $false
}

# Add Attributes
Write-Host "Adding attributes..."
$attrs = @(
    @{ col = "requests"; type = "string"; key = "userId"; size = 255; required = $true }
    @{ col = "requests"; type = "string"; key = "model"; size = 255; required = $true }
    @{ col = "requests"; type = "integer"; key = "promptTokens"; required = $true }
    @{ col = "requests"; type = "integer"; key = "completionTokens"; required = $true }
    @{ col = "requests"; type = "integer"; key = "totalTokens"; required = $true }
    @{ col = "requests"; type = "string"; key = "status"; size = 50; required = $true }
    @{ col = "requests"; type = "string"; key = "timestamp"; size = 100; required = $true }
    
    @{ col = "apiKeys"; type = "string"; key = "userId"; size = 255; required = $true }
    @{ col = "apiKeys"; type = "string"; key = "key"; size = 255; required = $true }
    @{ col = "apiKeys"; type = "string"; key = "name"; size = 255; required = $true }
    @{ col = "apiKeys"; type = "string"; key = "createdAt"; size = 100; required = $true }
)

foreach ($attr in $attrs) {
    $col = $attr.col
    $type = $attr.type
    $key = $attr.key
    $body = $attr.Clone()
    $body.Remove("col")
    $body.Remove("type")
    
    Call-Appwrite "/databases/$databaseId/collections/$col/attributes/$type" "Post" $body
}

Write-Host "Waiting for attributes to be ready (5 seconds)..."
Start-Sleep -Seconds 5

# Create Indexes
Call-Appwrite "/databases/$databaseId/collections/apiKeys/indexes" "Post" @{
    key = "key_index"
    type = "unique"
    attributes = @("key")
}

Call-Appwrite "/databases/$databaseId/collections/apiKeys/indexes" "Post" @{
    key = "user_index"
    type = "key"
    attributes = @("userId")
}

Call-Appwrite "/databases/$databaseId/collections/requests/indexes" "Post" @{
    key = "user_requests_index"
    type = "key"
    attributes = @("userId")
}

Write-Host "Setup finished."
