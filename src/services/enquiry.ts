export interface EnquiryData {
  name: string;
  email: string;
  contact: string;
  subject: string;
  message: string;
}

export async function submitEnquiry(data: EnquiryData): Promise<void> {
  const endpoint = import.meta.env.VITE_APP_SCRIPT_EXCEL_URL?.trim();

  if (!endpoint) {
    throw new Error("Google Sheets enquiry endpoint is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    // Apps Script returns an opaque response, so delivery cannot be confirmed here.
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(data),
      mode: "no-cors",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
