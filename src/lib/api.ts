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

  formData.append("file", payload.file);
  formData.append("file_name", payload.file.name);
  formData.append("title", payload.title?.trim() || payload.file.name);
  formData.append("category", payload.category?.trim() || "other");
  formData.append(
    "mime_type",
    payload.file.type || "application/octet-stream"
  );

  if (payload.case_id !== undefined && payload.case_id !== null) {
    formData.append("case_id", String(payload.case_id));
  }

  if (payload.hearing_id !== undefined && payload.hearing_id !== null) {
    formData.append("hearing_id", String(payload.hearing_id));
  }

  const token =
    this.token ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token");

  if (!token) {
    throw new Error("يجب تسجيل الدخول أولاً");
  }

  const response = await fetch(
    "https://asal-backend-2.onrender.com/api/upload",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const text = await response.text();

  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (response.status === 401) {
    throw new Error("401: التوكن غير صالح أو انتهت جلسة الدخول");
  }

  if (response.status === 422) {
    throw new Error(
      data?.errors
        ? Object.values(data.errors).flat().join(" ")
        : data?.message || "بيانات رفع الملف غير صحيحة"
    );
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
