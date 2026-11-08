# Google Analytics 4 setup

Analytics is optional and disabled until a valid `VITE_GA_MEASUREMENT_ID` is configured. No account password, API key, paid subscription, or analytics backend is needed.

## Create the property with your VHN Google account

1. Sign in at https://analytics.google.com/ with your VHN Google account.
2. Create an Analytics account named **VHN Global**, then a GA4 property for the production website. Choose India reporting time and INR currency.
3. Create a **Web** data stream using your actual public website URL.
4. Copy the **Measurement ID**, beginning with `G-`, from the stream details.
5. **Turn off Enhanced Measurement for this stream.** The app sends page views itself. Automatic history tracking would duplicate views, and automatic form/search tracking is intentionally excluded. Do not also install a Google tag snippet or another tag manager for this property.

Google reference: https://developers.google.com/analytics/devguides/collection/ga4/views

## Configure and deploy

Set this in the production build environment (or `.env.production`):

```dotenv
VITE_GA_MEASUREMENT_ID=G-YOUR_ACTUAL_ID
VITE_GA_DEBUG=false
```

Replace the example with the real Measurement ID. Vite embeds these values at build time, so rebuild and redeploy after changing them. The ID is public configuration, not a secret. Existing API and enquiry environment settings must be kept.

Use the owner's applicable privacy notice and consent requirements when enabling analytics. This integration does not add a consent banner or consent-management platform. Google Signals and ad personalization signals are disabled.

## Events

| Event | Trigger | Parameters |
| --- | --- | --- |
| `page_view` | Initial visit and pathname changes, including browser back/forward | Sanitized page location and referrer |
| `enquiry_open` | Product Enquire Now button | `form_source`, `product_id` |
| `enquiry_submitted` | The enquiry network send resolves | `form_source`, `delivery_status: unconfirmed` |
| `contact_click` | Email or telephone link click, anywhere on the website | `contact_method: email` or `phone` |

The enquiry endpoint currently uses Apps Script with `no-cors`: a resolved request does **not** confirm that Sheets stored the enquiry. Therefore, `generate_lead` is deliberately not emitted and `enquiry_submitted` should not be reported as a confirmed lead. Once the endpoint returns a verifiable success response, confirmed-lead tracking can be added.

No form names, emails, phone numbers, messages, or link destinations are included in custom event parameters. URL queries and fragments, including product search text, are omitted from reported page locations. Query/filter-only changes are not new page views. Explicit UTM campaign attribution is not implemented; referrer-based acquisition remains available. Redirect aliases are skipped in favour of their destination page.

Analytics is disabled during local development unless `VITE_GA_DEBUG=true` is explicitly set. Use a separate test property for local tests. Script loading is asynchronous; blocked analytics must not prevent enquiries or navigation.

## Validate after configuring an ID

1. For a test property, put its ID and `VITE_GA_DEBUG=true` in `.env.local` and restart Vite.
2. Check GA4 **DebugView**: visit Home, Products, a product detail, then Contact. Each pathname visit should generate one `page_view`. Filters and section links should not generate extra views.
3. Open a product enquiry and click email/telephone links; inspect the custom events.
4. Send a test enquiry using the configured test enquiry destination. Only a resolved network send should emit `enquiry_submitted`; it carries `delivery_status: unconfirmed`.
5. Verify that event payloads have no enquiry form values or query strings. If needed, register event-scoped custom dimensions for `form_source`, `contact_method`, `product_id`, and `delivery_status` in GA4.
6. Disable debugging for production, build, deploy, and verify traffic in **Realtime**. Do not mark `enquiry_submitted` as a confirmed-lead key event.

Run local implementation checks with `node --test tests/analytics.test.mjs`, `npm run build`, and lint the changed frontend files. Live collection cannot be verified before the real Measurement ID is configured.
