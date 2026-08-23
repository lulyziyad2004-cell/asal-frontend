async uploadDocument(payload: {
  file: File;
  title?: string;
  category?: string;
  case_id?: number;
  hearing_id?: number;
}) {
  if (!(payload.file instanceof File) || payload.file.size === 0) {
    throw new Error("لم يتم اختيار ملف صالح");
  }

  const params = new URLSearchParams();

  params.set("file_name", payload.file.name);
  params.set(
    "title",
    payload.title?.trim() || payload.file.name
  );
  params.set(
    "category",
    payload.category?.trim() || "other"
  );
  params.set(
    "mime_type",
    payload.file.type || "application/octet-stream"
  );

  if (payload.case_id != null) {
    params.set(
      "case_id",
      String(payload.case_id)
    );
  }

  if (payload.hearing_id != null) {
    params.set(
      "hearing_id",
      String(payload.hearing_id)
    );
  }

  const response = await fetch(
    `https://asal-backend-2.onrender.com/api/upload?${params.toString()}`,
    {
      method: "POST",

      headers: {
        Accept: "application/json",

        ...(this.token
          ? {
              Authorization: `Bearer ${this.token}`,
            }
          : {}),

        "Content-Type":
          payload.file.type ||
          "application/octet-stream",
      },

      // الملف نفسه مباشرة، بدون FormData وبدون Base64
      body: payload.file,
    }
  );

  if (response.status === 401) {
    throw new Error(
      "انتهت جلسة الدخول، سجلي الدخول مرة أخرى"
    );
  }

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `فشل رفع الملف (${response.status})`
    );
  }

  return data;
}
