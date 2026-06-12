# Dev Server Troubleshooting

## Common Symptoms

- `missing required error components`
- `MODULE_NOT_FOUND .next/server/webpack-runtime.js`
- `GET / 500`

These usually mean the `.next` cache or an old dev server process is stale after code changes.

## Recommended Restart

1. Press `Ctrl+C` in the running PowerShell window.
2. Start again:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1
```

`scripts/dev.ps1` removes stale `.next` before starting.

## Stop Old Dev Servers

If ports are occupied, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\stop-dev.ps1
```

The script checks ports `3000`, `3001`, and `3002`, displays process ids, and only stops node/next related processes after confirmation.

## Localhost 3000 vs 3001

Next.js normally starts on `http://localhost:3000`. If 3000 is already occupied, it may use 3001 or another available port.

Always use the `Local:` URL printed in the terminal as the source of truth. Do not keep opening `http://localhost:3000` if the terminal says a different Local URL.
