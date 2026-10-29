# Package the selected artwork at browser/app icon sizes without redrawing it.
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path $PSScriptRoot -Parent
$artwork = [System.Drawing.Image]::FromFile((Join-Path $projectRoot 'public/monkey-logo.png'))
function Save-BrandIcon([int]$size, [string]$name, [bool]$maskable = $false) {
    $bitmap = [System.Drawing.Bitmap]::new($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.Clear($(if ($maskable) { [System.Drawing.ColorTranslator]::FromHtml('#fff6e7') } else { [System.Drawing.Color]::Transparent }))
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $available = $size * $(if ($maskable) { 0.70 } else { 0.94 })
        $scale = [Math]::Min($available / $artwork.Width, $available / $artwork.Height)
        $width = [int]($artwork.Width * $scale)
        $height = [int]($artwork.Height * $scale)
        $graphics.DrawImage($artwork, [int](($size-$width)/2), [int](($size-$height)/2), $width, $height)
        $bitmap.Save((Join-Path $projectRoot "public/icons/$name"), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally { $graphics.Dispose(); $bitmap.Dispose() }
}
try {
    foreach ($size in @(16,32,48,180,192,512)) { Save-BrandIcon $size "monkey-$size.png" }
    Save-BrandIcon 512 'monkey-maskable-512.png' $true
    $images = @(16,32,48 | ForEach-Object { ,([System.IO.File]::ReadAllBytes((Join-Path $projectRoot "public/icons/monkey-$_.png"))) })
    $stream = [System.IO.File]::Create((Join-Path $projectRoot 'public/favicon.ico'))
    $writer = [System.IO.BinaryWriter]::new($stream)
    try {
        $writer.Write([uint16]0); $writer.Write([uint16]1); $writer.Write([uint16]3)
        $offset = 6 + 3 * 16
        for ($i=0; $i -lt 3; $i++) {
            $size = @(16,32,48)[$i]
            $writer.Write([byte]$size); $writer.Write([byte]$size); $writer.Write([byte]0); $writer.Write([byte]0)
            $writer.Write([uint16]1); $writer.Write([uint16]32)
            $writer.Write([uint32]$images[$i].Length); $writer.Write([uint32]$offset)
            $offset += $images[$i].Length
        }
        foreach ($bytes in $images) { $writer.Write([byte[]]$bytes) }
    } finally { $writer.Dispose(); $stream.Dispose() }
} finally { $artwork.Dispose() }
