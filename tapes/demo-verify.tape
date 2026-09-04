# demo-verify.tape — Blind verification of findings
Output assets/demo-verify.gif

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

# Run a scan
Type "Scan https://juice-shop.example.com for SQL injection"
Sleep 1s
Enter
Sleep 10s

# Show findings
Type "/findings"
Sleep 1s
Enter
Sleep 3s

# Verify a finding
Type "/verify"
Sleep 1s
Enter
Sleep 5s
