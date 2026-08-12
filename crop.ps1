Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\User\.gemini\antigravity\scratch\controle-rapido-agora\src\assets\mascots.png")
$rect = New-Object System.Drawing.Rectangle 25, 780, 360, 205
$bmp = New-Object System.Drawing.Bitmap $rect.Width, $rect.Height
$gfx = [System.Drawing.Graphics]::FromImage($bmp)
$destRect = New-Object System.Drawing.Rectangle 0, 0, $rect.Width, $rect.Height
$gfx.DrawImage($img, $destRect, $rect, [System.Drawing.GraphicsUnit]::Pixel)
$bmp.Save("C:\Users\User\.gemini\antigravity\scratch\controle-rapido-agora\src\assets\logo-cropped.png", [System.Drawing.Imaging.ImageFormat]::Png)
$gfx.Dispose()
$bmp.Dispose()
$img.Dispose()
