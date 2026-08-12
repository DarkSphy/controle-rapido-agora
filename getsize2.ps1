Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile("C:\Users\User\.gemini\antigravity\scratch\controle-rapido-agora\src\assets\mascots2.jpg")
Write-Output "x"
$img.Dispose()
