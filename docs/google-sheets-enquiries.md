# Receive website enquiries in your VHN Google Sheet

Both the Contact form and product enquiry form use this integration. Each submission saves a timestamp, request ID, source, name, email, optional phone, subject (including the product name for product enquiries), message, and initial status `New`.

## 1. Create a sheet under your VHN account

1. Sign in to https://sheets.google.com/ using your VHN Google account.
2. Create a blank spreadsheet named **VHN Global Website Enquiries**.
3. Keep the spreadsheet sharing setting **Restricted**. Visitors do not need access to the sheet.
4. Copy the spreadsheet ID from its URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`.
5. In the spreadsheet open **Extensions > Apps Script** and name the project **VHN Website Enquiries**.

## 2. Install the script

1. Replace the contents of `Code.gs` with the entire file at `integrations/google-sheets/Code.gs` in this repository. Save.
2. In **Project Settings > Script properties**, add a property named **SPREADSHEET_ID**, with the ID copied above as its value. Save.
3. Set the project time zone to **Asia/Kolkata**, and the spreadsheet time zone to India under **File > Settings**.
4. Return to the editor, choose **setupSheet** in the function dropdown, and click **Run**.
5. Review and authorize access with the VHN account that owns the sheet. If Google displays an unverified-app warning for your own script, inspect the project and permissions before continuing. You do not need to submit this private owner-operated project for public OAuth verification.
6. Check that the spreadsheet now has an **Enquiries** tab with column headings. Do not rename or reorder these headings. The script does not overwrite existing enquiry rows; if a tab has unrelated headings, rename that tab and rerun setup.

## 3. Deploy as a web app

1. Click **Deploy > New deployment**.
2. Choose the gear icon and select **Web app**.
3. Description: **VHN website enquiries**.
4. **Execute as: Me** (your VHN account).
5. **Who has access: Anyone**. Website visitors must be able to submit without signing in. Do not choose only signed-in Google users. If your Workspace administrator disables anonymous web apps, the administrator must allow them or the website needs a backend relay.
6. Click **Deploy**, authorize if prompted, and copy the **Web app URL**, ending in `/exec`. Do not copy a deployment ID, editor URL, `/dev` test URL, or Google Sheet URL.
7. Open the `/exec` URL in an incognito window. It should display `{"success":true,"service":"VHN Global enquiries"}` without a login prompt. This only confirms the web app is reachable; it does not write an enquiry.

Official deployment instructions: https://developers.google.com/apps-script/guides/web

## 4. Connect the website

Send the `/exec` URL to the developer or set this variable in the production website build environment:

```dotenv
VITE_APP_SCRIPT_EXCEL_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

The URL is public frontend configuration; do not put a Google password, OAuth token, or service account key into any `VITE_` variable. Preserve the existing API and GA4 configuration. Rebuild and redeploy the website after setting the URL. For local testing, set the same variable in `.env.local` and restart Vite.

## 5. Test both forms

1. Submit a Contact enquiry with recognizable test details, then check for exactly one row in **Enquiries**.
2. Open a product, choose **Enquire Now**, and submit a test enquiry. Check the source is `product` and the subject includes the product name.
3. Verify the website shows success only after receiving `{success:true, requestId: ...}` matching the submission. Only then does GA4 receive `generate_lead`; names, messages, emails, and phone numbers are never sent as analytics parameters.
4. Mark `generate_lead` as a key event in GA4 if you want confirmed enquiry conversions. The older `enquiry_submitted` event is no longer sent.
5. Delete your test rows when finished. You can update the Status column manually as enquiries progress.

## Troubleshooting and maintenance

- If you edit the script later, use **Deploy > Manage deployments > Edit > New version > Deploy**. Saving editor code alone does not update the live `/exec` deployment.
- If the website errors, inspect **Apps Script > Executions** and check the spreadsheet property, owner permissions, and anonymous deployment access. The app deliberately rejects unreadable, non-JSON, unsuccessful, or mismatched responses instead of claiming delivery.
- The browser sends JSON as `text/plain`, follows Google's Content Service redirect, and requires a readable CORS response. Verify this from the actual website after deployment. If Google blocks cross-origin responses in your deployment, use a backend relay that returns the same JSON contract; do not change back to `no-cors` or add JSONP containing customer details. Content Service documentation: https://developers.google.com/apps-script/guides/content
- A timeout or lost acknowledgement can occur after a row was saved. Check the sheet before manually resubmitting. Repeated requests using the same request ID are deduplicated by the script; a fresh form submission creates a new ID.
- The web app accepts public submissions, but never exposes sheet contents. It validates input, escapes spreadsheet formulas, and locks concurrent writes. Apps Script quotas apply. High traffic or persistent spam would call for backend rate limiting and bot protection.
- This setup saves enquiries to Sheets only; it does not send notification or reply emails.

The Google account setup and live end-to-end test require your account and deployed URL; they cannot be completed solely from this repository.
