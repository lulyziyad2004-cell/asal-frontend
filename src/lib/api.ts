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

  // مهم جدًا:
  // لا نضع Content-Type يدويًا.
  // المتصفح سيضع multipart/form-data مع boundary تلقائيًا.
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

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    let message = "فشل رفع الملف";

    if (contentType.includes("application/json")) {
      const error = await response.json();

      if (error?.errors) {
        message =
          Object.values(error.errors)
            .flat()
            .join(" ");
      } else if (error?.error) {
        message = error.error;
      } else if (error?.message) {
        message = error.message;
      }
    } else {
      const text = await response.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return {
    success: true,
    message: "تم رفع الملف بنجاح",
  };
}
