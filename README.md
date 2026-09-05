# My Budget V5.2 — Android Project (V4-Compatible Install)

This version uses a unique Android application ID:
`com.sohanlakra.mybudget.v52`

This is intentional so it can be installed **alongside the existing V4 app** without the package/signing conflict shown when installing the first V5.2 APK.

Features:
- Dashboard and monthly category chart
- Multiple loans and loan payment history
- Multiple credit cards and payment history
- Multiple named bills/recurring expenses
- Local backup/restore
- Google Sheets sync through a native Android bridge
- No PWA installation/status panels

Google Apps Script:
- `Code_V5_2.gs` is in the project root.
- Use your Apps Script `/exec` URL in Settings → Google Sheets Sync.

Build:
GitHub → Actions → Build My Budget V5.2 APK → Run workflow.
Download `MyBudgetV5.2-debug-apk`.

IMPORTANT:
Do NOT uninstall V4. This V5.2 build is designed to coexist with V4.
