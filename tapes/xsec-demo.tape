# xsec-demo.tape — Quickstart: a scan from start to finish
Output assets/xsec-demo.gif

Require bun

Set Shell "powershell"
Set FontSize 16
Set Width 1200
Set Height 720
Set FontFamily "Cascadia Mono"
Set Theme "Builtin Dark"
Set TypingSpeed 50ms

# Launch TUI
Type "bun run packages/cli/src/index.ts tui"
Enter
Sleep 3s

# Open the engagement control pane
Type "/run"
Sleep 1s
Enter
Sleep 2s

# Enter a target URL
Type "https://juice-shop.example.com"
Sleep 1s
Enter
Sleep 5s

# Let the scan run
Sleep 8s
