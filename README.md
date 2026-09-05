# My Budget V5.2 — Complete Android Project

Upload the whole folder to GitHub.

Features:
- Dashboard and monthly category chart
- Unlimited loans and loan payment history
- Unlimited credit cards and payment history
- Multiple named utility/recurring bills
- Mark active/closed and delete records
- Local backup/restore
- Google Sheets sync through a native Android bridge, avoiding file:// WebView CORS issues

Google Apps Script:
- `Code_V5_2.gs` is included in the project root.
- Use the Web App `/exec` URL in Settings → Google Sheets Sync.

Build:
GitHub → Actions → Build My Budget V5.2 APK → Run workflow.
Download the artifact `MyBudgetV5.2-debug-apk`.
