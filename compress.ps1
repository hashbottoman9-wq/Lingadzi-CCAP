Add-Type -AssemblyName System.Drawing

$maxWidth = 1600
$quality = 75
$orientationId = 0x0112

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
        $graphics.Dispose()
        $img.Dispose()

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