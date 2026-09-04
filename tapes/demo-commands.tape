# demo-commands.tape — Console command palette
Output assets/demo-commands.gif

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

# Open the command palette
Type "/"
Sleep 1s

# Type to filter commands
Type "scan"
Sleep 2s

# Clear and try another
Escape
Type "/model"
Sleep 2s

# Clear and show providers
Escape
Type "/connect"
Sleep 2s

Escape
Sleep 1s
