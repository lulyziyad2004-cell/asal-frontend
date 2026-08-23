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

  const formData = new FormData();

  formData.append("file", payload.file, payload.file.name);
  formData.append("file_name", payload.file.name);
  formData.append(
    "title",
    payload.title?.trim() || payload.file.name
  );
  formData.append(
    "category",
    payload.category?.trim() || "other"
  );
  formData.append(
    "mime_type",
    payload.file.type || "application/octet-stream"
  );

  if (payload.case_id != null) {
    formData.append("case_id", String(payload.case_id));
  }

  if (payload.hearing_id != null) {
    formData.append("hearing_id", String(payload.hearing_id));
  }

  const response = await fetch(
    "https://asal-backend-2.onrender.com/api/upload",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(this.token
          ? {
              Authorization: `Bearer ${this.token}`,
            }
          : {}),
      },
      body: formData,
    }
  );

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (response.status === 401) {
    throw new Error("انتهت جلسة الدخول، سجلي الدخول مرة أخرى");
  }

  if (!response.ok) {
    throw new Error(
      data?.errors
        ? Object.values(data.errors).flat().join(" ")
        : data?.message ||
          data?.error ||
          `فشل رفع الملف (${response.status})`
    );
  }

  return data;
}
