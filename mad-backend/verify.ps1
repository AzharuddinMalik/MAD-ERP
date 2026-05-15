$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:Path = "C:\Program Files\Java\jdk-17\bin;" + $env:Path
Set-Location -LiteralPath "D:\Spring-Boot Vipul Tyagi\journalApp\mad-backend"
.\mvnw.cmd clean compile -DskipTests > compile_output.txt 2>&1
