Add-Type -AssemblyName System.Drawing

$maxWidth = 1600
$quality = 75
$orientationId = 0x0112
$logoPath = Join-Path (Get-Location) "logo.png"

if (-Not (Test-Path $logoPath)) {
    Write-Host "ERROR: logo.png not found in project root. Aborting."
    exit
}

$folders = Get-ChildItem -Path "photos" -Directory
foreach ($folder in $folders) {
    $files = Get-ChildItem -Path $folder.FullName -Filter *.JPG
    foreach ($file in $files) {
        $img = [System.Drawing.Image]::FromFile($file.FullName)

        if ($img.PropertyIdList -contains $orientationId) {
            $orientation = $img.GetPropertyItem($orientationId).Value[0]
            switch ($orientation) {
                2 { $img.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX) }
                3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
                4 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipX) }
                5 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipX) }
                6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
                7 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipX) }
                8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
            }
            $img.RemovePropertyItem($orientationId)
        }

        if ($img.Width -gt $maxWidth) {
            $ratio = $maxWidth / $img.Width
            $newWidth = $maxWidth
            $newHeight = [int]($img.Height * $ratio)
        } else {
            $newWidth = $img.Width
            $newHeight = $img.Height
        }

        $newImg = New-Object System.Drawing.Bitmap $newWidth, $newHeight, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
        $graphics = [System.Drawing.Graphics]::FromImage($newImg)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($img, 0, 0, $newWidth, $newHeight)
        $img.Dispose()

        # Stamp the logo permanently onto the photo (bottom-right corner)
        $logo = [System.Drawing.Image]::FromFile($logoPath)
        $logoWidth = [int]($newWidth * 0.15)
        $logoHeight = [int]($logo.Height * ($logoWidth / $logo.Width))
        $padding = [int]($newWidth * 0.02)

        $colorMatrix = New-Object System.Drawing.Imaging.ColorMatrix
        $colorMatrix.Matrix33 = 0.85
        $imgAttributes = New-Object System.Drawing.Imaging.ImageAttributes
        $imgAttributes.SetColorMatrix($colorMatrix, [System.Drawing.Imaging.ColorMatrixFlag]::Default, [System.Drawing.Imaging.ColorAdjustType]::Bitmap)

        $destRect = New-Object System.Drawing.Rectangle(
            ($newWidth - $logoWidth - $padding),
            ($newHeight - $logoHeight - $padding),
            $logoWidth,
            $logoHeight
        )
        $graphics.DrawImage($logo, $destRect, 0, 0, $logo.Width, $logo.Height, [System.Drawing.GraphicsUnit]::Pixel, $imgAttributes)
        $logo.Dispose()
        $graphics.Dispose()

        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)
        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
        $tempPath = $file.FullName + ".tmp"
        $newImg.Save($tempPath, $jpegCodec, $encoderParams)
        $newImg.Dispose()
        Remove-Item $file.FullName
        Rename-Item $tempPath $file.FullName
    }
    Write-Host "Done: $($folder.Name)"
}

Write-Host "ALL DONE"