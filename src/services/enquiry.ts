export interface EnquiryData {
  name: string;
  email: string;
  contact: string;
  subject: string;
  message: string;
}

export async function submitEnquiry(data: EnquiryData, source: "contact" | "product" = "contact"): Promise<void> {
  const endpoint = import.meta.env.VITE_APP_SCRIPT_EXCEL_URL?.trim();

  if (!endpoint) {
    throw new Error("Google Sheets enquiry endpoint is not configured.");
  }

  if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint)) {
    throw new Error("Configure the deployed Google Apps Script /exec URL.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const requestId = crypto.randomUUID();
  try {
    // text/plain avoids a preflight; CORS mode requires a readable acknowledgement.
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify({ ...data, source, requestId }),
      mode: "cors",
      credentials: "omit",
      redirect: "follow",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Enquiry service is unavailable.");
    const result: unknown = await response.json();
    if (!result || typeof result !== "object" || !("success" in result)
      || result.success !== true || !("requestId" in result) || result.requestId !== requestId) {
      throw new Error("The enquiry could not be confirmed.");
    }
  } finally {
    clearTimeout(timeout);
  }
}
