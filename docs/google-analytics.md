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
| `product_view` | Product detail successfully loads; once per consecutive product visit | `product_id`, `product_name`, `product_category` |
| `enquiry_start` | First form change, or first attempt/validation error if autofilled | `form_source`, `product_id` for product forms |
| `enquiry_attempt` | Form passes browser validation and reaches the submit handler | `form_source`, `product_id` for product forms |
| `enquiry_error` | Browser/custom validation, unavailable endpoint, or unconfirmed delivery | `form_source`, optional `product_id`, `error_type: validation`, `unavailable`, or `unconfirmed` |
| `generate_lead` | Google Sheets confirms the enquiry was saved | `form_source`, optional `product_id`, `delivery_status: confirmed` |
| `contact_click` | Email or telephone link click, or successful email copy | `contact_method: email`, `phone`, or `email_copy` |
| `scroll_depth` | Viewport bottom reaches 25%, 50%, 75%, or 90% after scrolling | `percent_scrolled` |

Both catalogue cards and product detail buttons report `enquiry_open`. Starts are counted once per mounted form until a successful submission resets the contact form. Attempts and errors can repeat during retries; browser validation may emit an error for each invalid field. Scroll events fire once per threshold per pathname visit, not for query/filter-only changes. Scroll depth is a visibility proxy, not proof that someone read the content.

The enquiry endpoint requires a readable JSON acknowledgement containing `success: true` and the matching request ID. Only confirmed saves emit `generate_lead`; failed, blocked, or unconfirmed submissions do not. Deploy the matching script described in [Google Sheets setup](google-sheets-enquiries.md). Historical `enquiry_submitted` events were unconfirmed sends and should not be treated as confirmed leads.

No visitor names, emails, phone numbers, messages, raw error messages, or link destinations are included in custom event parameters. Product names/categories come from the public catalogue. URL queries and fragments, including product search text, are omitted from reported page locations. Query/filter-only changes are not new page views. Redirect aliases are skipped in favour of their destination page.

At initialization, `utm_source`, `utm_medium`, and `utm_campaign` are mapped to Google's campaign configuration fields. Only 1-64 character labels using letters, digits, underscores, and hyphens are accepted. Do not put personal information in campaign labels. Other query values, including `utm_term` and `utm_content`, are not forwarded. Example incoming marketing link: `https://vhnglobal.com/products?utm_source=linkedin&utm_medium=social&utm_campaign=cocopeat_2026`. Campaigns are read on full page entry, not internal filter changes. Google reference: https://developers.google.com/analytics/devguides/collection/ga4/reference/config

Analytics is disabled during local development unless `VITE_GA_DEBUG=true` is explicitly set. Use a separate test property for local tests. Script loading is asynchronous; blocked analytics must not prevent enquiries or navigation.

## Validate after configuring an ID

1. For a test property, put its ID and `VITE_GA_DEBUG=true` in `.env.local` and restart Vite.
2. Check GA4 **DebugView**: visit Home, Products, a product detail, then Contact. Each pathname visit should generate one `page_view`. Filters and section links should not generate extra views.
3. Open a product enquiry and click email/telephone links; inspect the custom events.
4. Send a test enquiry using the configured test enquiry destination. Confirm the sheet row exists and GA4 receives `generate_lead` with `delivery_status: confirmed`. An unsuccessful response must not emit a lead.
5. Verify that event payloads have no enquiry form values or query strings. Register event-scoped custom dimensions for `form_source`, `contact_method`, `product_id`, `product_name`, `product_category`, `error_type`, and `delivery_status` in GA4. Optionally register `percent_scrolled` as a custom dimension for depth comparisons.
6. Disable debugging for production, build, deploy, and verify traffic in **Realtime**. Mark `generate_lead` as a key event to report confirmed enquiries. Do not mark historical `enquiry_submitted` events as confirmed leads.

Run local implementation checks with `node --test tests/analytics.test.mjs`, `npm run build`, and lint the changed frontend files. Live collection cannot be verified before the real Measurement ID is configured.

## Analyse the new data

Deploy the updated frontend, then validate in DebugView before interpreting reports. These events cannot fill historical gaps. This repository does not configure the GA4 account itself.

1. **Confirmed enquiries:** mark `generate_lead` as a key event. Leave starts, attempts, and contact clicks as supporting activity, so they do not inflate confirmed leads.
2. **Product interest:** create a free-form Exploration with `product_name`/`product_id` as rows and event name as columns. Compare `product_view`, `enquiry_open`, and `generate_lead`, using total users as the metric. Product-card enquiries can skip the detail page, so analyse those as a separate entry path.
3. **Form drop-off:** build an open funnel with `enquiry_start` -> `enquiry_attempt` -> `generate_lead`, scoped within the same session and broken down by `form_source`. For product-specific analysis, also filter by `product_id`. Compare users reaching each step, not raw event counts, because retries repeat events. Review `enquiry_error` separately by `error_type` to distinguish validation trouble from delivery issues.
4. **Audience quality:** compare country and device category against engaged sessions and confirmed key events. Use session source/medium and session campaign to compare marketing traffic. Avoid conclusions based on countries with only one or two visitors.
5. **Content engagement:** compare `scroll_depth` users by page path and `percent_scrolled`, alongside average engagement time. A high scroll depth alone does not indicate a useful visit.
6. **Weekly review:** export the same date-range reports to CSV and compare product interest, form-start users, confirmed-lead users, and errors with the preceding period. Share those exports for analysis; account access or a data export is required to analyse actual collected traffic.

Recommended Google event reference for confirmed leads: https://developers.google.com/analytics/devguides/collection/ga4/reference/events#generate_lead
