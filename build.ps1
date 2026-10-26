# Usage (PowerShell):  .\build.ps1   ->  creates index.html  (same as build.js, no Node needed)
# index.html is the page GitHub Pages opens first.
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$enc = New-Object System.Text.UTF8Encoding($false)
function Src($f) { [IO.File]::ReadAllText((Join-Path $dir "src\$f"), [Text.Encoding]::UTF8) }
$js = (@('lib.js', 'lessons_1.js', 'lessons_2.js', 'lessons_3.js', 'teacher.js', 'ink.js', 'pages.js', 'book.js', 'app.js') | ForEach-Object { Src $_ }) -join "`n"
if ($js.Contains('</script')) { throw 'found </script inside script' }
$html = (Src 'shell.html').Replace('/*CSS*/', (Src 'style.css')).Replace('/*JS*/', $js)
[IO.File]::WriteAllText((Join-Path $dir 'index.html'), $html, $enc)
Write-Output ("index.html {0} KB" -f [math]::Round($html.Length / 1024))
