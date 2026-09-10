export const INQUIRY_STORAGE_KEY = "sc-inquiry-prefill";

export type InquiryPrefill = {
  gift?: string;
  quantity?: string;
};

export function saveInquiryPrefill(data: InquiryPrefill) {
  try {
    sessionStorage.setItem(INQUIRY_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage failures (private mode quotas, etc.)
  }
}

export function consumeInquiryPrefill(): InquiryPrefill | null {
  try {
    const raw = sessionStorage.getItem(INQUIRY_STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(INQUIRY_STORAGE_KEY);
    return JSON.parse(raw) as InquiryPrefill;
  } catch {
    return null;
  }
}
