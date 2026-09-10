type Web3FormsResult = {
  success: boolean;
  message?: string;
};

type SubmitOptions = {
  extras?: Record<string, string>;
  /** Defaults to the main contact form key. */
  accessKey?: string;
};

export async function submitWeb3Form(
  formData: FormData,
  options: SubmitOptions = {}
) {
  const accessKey =
    options.accessKey || process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    throw new Error("Form delivery is not configured.");
  }

  formData.append("access_key", accessKey);
  if (options.extras) {
    for (const [key, value] of Object.entries(options.extras)) {
      formData.append(key, value);
    }
  }

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    body: formData,
  });

  const result = (await response.json()) as Web3FormsResult;
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not send. Please try again.");
  }

  return result;
}
