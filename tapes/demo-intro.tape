# demo-intro.tape — XSEC intro banner + chat home
Output tapes/demo-intro.gif

Require bun

Set Shell "powershell"
Set FontSize 16
Set Width 1200
Set Height 720
Set FontFamily "Cascadia Mono"
Set Theme "Builtin Dark"
Set TypingSpeed 50ms

Hide
# Launch TUI
Type "bun run packages/cli/src/index.ts tui"
Enter
Sleep 1.5

Show
# Show the home screen with XSEC logo
Sleep 4s

# Type a message to show the chat interface
Type "Find SQL injection vulnerabilities in https://juice-shop.example.com"
Sleep 1s
Enter
Sleep 4s
