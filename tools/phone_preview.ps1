# ==========================================================================
# 手机预览服务器（免安装版）
# --------------------------------------------------------------------------
# 作用：把这个项目文件夹变成一个临时小网站，
#       同一个 Wi-Fi 下的手机用浏览器输入网址就能打开。
# 特点：只用 Windows 自带的 PowerShell，不需要安装 Python 或任何软件。
#
# 用法：
#   双击根目录的「手机预览-Windows.bat」
#   或在本文件夹运行：
#     powershell -NoProfile -ExecutionPolicy Bypass -File tools\phone_preview.ps1
#   换端口：在 bat 后面加参数，例如 -Port 9000
#
# 停止：在窗口里按 Ctrl+C，或直接关闭这个窗口。
# ==========================================================================

param(
    [int]$Port = 8765   # 起始端口；被占用时自动往后试 20 个
)

# --------------------------------------------------------------------------
# 0. 基础准备：编码 + 路径
# --------------------------------------------------------------------------
$ErrorActionPreference = "Stop"

# 让中文在黑窗口里正常显示（失败也不影响运行）
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
try { $OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

# 项目根目录 = 本脚本所在文件夹的上一级（tools 的上一级就是项目根目录）
$RootFull = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
if (-not $RootFull.EndsWith("\")) { $RootFull += "\" }

if (-not (Test-Path (Join-Path $RootFull "index.html"))) {
    Write-Host "找不到 index.html。请确认 tools\phone_preview.ps1 还在项目里。"
    exit 1
}

# --------------------------------------------------------------------------
# 1. 找到本电脑在局域网里的地址（例如 192.168.1.23）
# --------------------------------------------------------------------------
function Get-LanIp {
    # 借用 UDP 连接“探路”：不会真的发数据，只是让系统告诉我们走哪个网卡
    foreach ($target in @("8.8.8.8", "1.1.1.1")) {
        try {
            $socket = New-Object System.Net.Sockets.Socket(
                [System.Net.Sockets.AddressFamily]::InterNetwork,
                [System.Net.Sockets.SocketType]::Dgram,
                [System.Net.Sockets.ProtocolType]::Udp)
            $socket.Connect($target, 80)
            $ip = $socket.LocalEndPoint.Address.ToString()
            $socket.Close()
            if ($ip -and -not $ip.StartsWith("127.")) { return $ip }
        } catch { continue }
    }
    return "127.0.0.1"
}

# --------------------------------------------------------------------------
# 2. 文件后缀 → 网页内容类型 对照表
# --------------------------------------------------------------------------
$ContentTypes = @{
    ".html" = "text/html; charset=utf-8";  ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8";   ".js"   = "text/javascript; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".jpg"  = "image/jpeg";                ".jpeg" = "image/jpeg"
    ".png"  = "image/png";                 ".webp" = "image/webp"
    ".gif"  = "image/gif";                 ".ico"  = "image/x-icon"
    ".wav"  = "audio/wav";                 ".mp3"  = "audio/mpeg"
    ".m4a"  = "audio/mp4";                 ".ogg"  = "audio/ogg"
    ".mp4"  = "video/mp4";                 ".webm" = "video/webm"
    ".mov"  = "video/quicktime"
    ".json" = "application/json; charset=utf-8"
    ".txt"  = "text/plain; charset=utf-8"; ".md"   = "text/plain; charset=utf-8"
}

# 404 时的友好提示页（比浏览器自带的白色错误页温柔一点）
$NotFoundHtml = [System.Text.Encoding]::UTF8.GetBytes(
    "<!DOCTYPE html><html lang=`"zh-CN`"><head><meta charset=`"utf-8`">" +
    "<title>没找到页面</title></head><body style=`"font-family:sans-serif;text-align:center;padding-top:80px;color:#a86b71`">" +
    "<h1>404</h1><p>这个文件不在这里。<br>请回到根目录打开 <b>/</b> 试试。</p></body></html>")

# --------------------------------------------------------------------------
# 3. 读取并解析浏览器的请求
# --------------------------------------------------------------------------
function Read-Request($stream) {
    $stream.ReadTimeout = 4000   # 4 秒内没读完就放弃，避免卡住整个服务
    $buffer = New-Object byte[] 8192
    $total = 0
    while ($total -lt $buffer.Length) {
        try { $received = $stream.Read($buffer, $total, $buffer.Length - $total) }
        catch { return $null }
        if ($received -le 0) { break }
        $total += $received
        $text = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $total)
        if ($text.Contains("`r`n`r`n")) { return $text }   # 请求头读完的标志
    }
    if ($total -gt 0) { return [System.Text.Encoding]::ASCII.GetString($buffer, 0, $total) }
    return $null
}

# 把一段字节按 HTTP 格式发回给浏览器
function Send-Response($stream, $statusCode, $statusText, $contentType, $bytes, [bool]$headOnly) {
    $header =
        "HTTP/1.1 $statusCode $statusText`r`n" +
        "Content-Type: $contentType`r`n" +
        "Content-Length: $($bytes.Length)`r`n" +
        "Cache-Control: no-store, max-age=0`r`n" +   # 不缓存：改完内容一刷新就生效
        "Connection: close`r`n`r`n"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $stream.Write($headerBytes, 0, $headerBytes.Length)
    if (-not $headOnly -and $bytes.Length -gt 0) {
        $stream.Write($bytes, 0, $bytes.Length)
    }
    $stream.Flush()
}

# --------------------------------------------------------------------------
# 4. 找一个空闲端口，启动服务
# --------------------------------------------------------------------------
$server = $null
$usedPort = $Port
for ($candidate = $Port; $candidate -lt $Port + 20; $candidate++) {
    try {
        $server = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $candidate)
        $server.Start()
        $usedPort = $candidate
        break
    } catch {
        $server = $null   # 这个端口被占了，换下一个
    }
}
if (-not $server) {
    Write-Host "端口 $Port 到 $($Port + 19) 全被占用了。"
    Write-Host "可以换一个端口，例如：powershell -File tools\phone_preview.ps1 -Port 9000"
    exit 1
}

$lanIp = Get-LanIp

Write-Host ""
Write-Host ("=" * 56)
Write-Host "  手机预览已启动（免安装版）"
Write-Host ("=" * 56)
Write-Host ""
Write-Host "  电脑本机打开：  http://127.0.0.1:$usedPort/"
Write-Host "  手机浏览器打开：http://$lanIp`:$usedPort/"
Write-Host ""
Write-Host "  手机和电脑要连同一个 Wi-Fi。"
Write-Host "  在手机浏览器地址栏里，手动输入这一行："
Write-Host ""
Write-Host "      $lanIp`:$usedPort"
Write-Host ""
Write-Host "  第一次启动时，Windows 可能弹出防火墙提示。"
Write-Host "  请选择「允许访问」（勾选专用网络），否则手机打不开。"
Write-Host ""
Write-Host "  这个地址只在同一个 Wi-Fi 下有效，关掉这个窗口就停止。"
Write-Host "  想让对方在外地也能看，见 docs/02-公网部署教程.md。"
Write-Host ""
Write-Host ("=" * 56)
Write-Host ""

if ($lanIp -eq "127.0.0.1") {
    Write-Host "⚠ 没有找到局域网地址。请确认电脑已连接 Wi-Fi 或网线。"
    Write-Host ""
}

# --------------------------------------------------------------------------
# 5. 主循环：一个请求一个请求地接待（预览用途，简单可靠优先）
# --------------------------------------------------------------------------
try {
    while ($true) {
        $client = $server.AcceptTcpClient()
        try {
            $client.ReceiveTimeout = 5000
            $client.SendTimeout = 5000
            $stream = $client.GetStream()

            $requestText = Read-Request $stream
            if (-not $requestText) { continue }

            # 请求长这样：GET /css/style.css HTTP/1.1
            $firstLine = ($requestText -split "`r`n")[0]
            $parts = $firstLine -split " "
            $method = $parts[0]
            $rawPath = "/"
            if ($parts.Length -gt 1) { $rawPath = $parts[1] }

            # 少数手机浏览器会发完整网址（http://192.168.x.x:8765/），去掉前缀
            if ($rawPath -match "^https?://[^/]+(/.*)$") { $rawPath = $Matches[1] }

            if ($method -ne "GET" -and $method -ne "HEAD") {
                Send-Response $stream 405 "Method Not Allowed" "text/plain; charset=utf-8" ([System.Text.Encoding]::UTF8.GetBytes("只支持 GET 请求")) $false
                continue
            }
            $headOnly = ($method -eq "HEAD")

            # 去掉 ?后面的参数，再把网址还原成硬盘上的路径
            $path = ($rawPath -split "\?")[0]
            $path = [System.Uri]::UnescapeDataString($path)
            $path = $path.TrimStart("/").Replace("/", "\")
            if ($path -eq "") { $path = "index.html" }

            # 安全检查：拼出来的路径必须还在项目文件夹里，防止读到电脑其他文件
            $full = [System.IO.Path]::GetFullPath((Join-Path $RootFull $path))
            if (-not $full.StartsWith($RootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
                Send-Response $stream 403 "Forbidden" "text/plain; charset=utf-8" ([System.Text.Encoding]::UTF8.GetBytes("Forbidden")) $headOnly
                Write-Host "  · 403 已拦截项目外的路径请求"
                continue
            }

            # 如果访问的是文件夹，就去找里面的 index.html
            if (Test-Path $full -PathType Container) {
                $full = Join-Path $full "index.html"
            }

            if (Test-Path $full -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($full)
                $ext = [System.IO.Path]::GetExtension($full).ToLower()
                $type = "application/octet-stream"
                if ($ContentTypes.ContainsKey($ext)) { $type = $ContentTypes[$ext] }
                Send-Response $stream 200 "OK" $type $bytes $headOnly
                $sizeKb = [Math]::Round($bytes.Length / 1024, 1)
                Write-Host "  · $method $rawPath → 200 ($sizeKb KB)"
            } else {
                Send-Response $stream 404 "Not Found" "text/html; charset=utf-8" $NotFoundHtml $headOnly
                Write-Host "  · $method $rawPath → 404（文件不存在）"
            }

            $stream.Close()
        } catch {
            # 单个请求出错不影响服务继续运行
        } finally {
            $client.Close()
        }
    }
} finally {
    $server.Stop()
    Write-Host ""
    Write-Host "已停止。"
}
