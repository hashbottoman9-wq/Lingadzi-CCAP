Add-Type -AssemblyName System.Drawing

$maxWidth = 1600
$quality = 75

$folders = Get-ChildItem -Path "photos" -Directory
foreach ($folder in $folders) {
    $files = Get-ChildItem -Path $folder.FullName -Filter *.JPG
    foreach ($file in $files) {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        if ($img.Width -gt $maxWidth) {
            $ratio = $maxWidth / $img.Width
            $newWidth = $maxWidth
            $newHeight = [int]($img.Height * $ratio)
            $newImg = New-Object System.Drawing.Bitmap $newWidth, $newHeight
            $graphics = [System.Drawing.Graphics]::FromImage($newImg)
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.DrawImage($img, 0, 0, $newWidth, $newHeight)
            $img.Dispose()
            $img = $newImg
        }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)
        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
        $tempPath = $file.FullName + ".tmp"
        $img.Save($tempPath, $jpegCodec, $encoderParams)
        $img.Dispose()
        Remove-Item $file.FullName
        Rename-Item $tempPath $file.FullName
    }
    Write-Host "Done: $($folder.Name)"
}

Write-Host "ALL DONE"