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

  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("تعذر قراءة الملف"));
        return;
      }

      resolve(result);
    };

    reader.onerror = () => {
      reject(new Error("تعذر قراءة الملف"));
    };

    reader.readAsDataURL(payload.file);
  });

  return this.request("/upload", {
    method: "POST",
    body: JSON.stringify({
      data,
      file_name: payload.file.name,
      title: payload.title?.trim() || payload.file.name,
      category: payload.category?.trim() || "other",
      mime_type:
        payload.file.type || "application/octet-stream",

      ...(payload.case_id != null
        ? { case_id: payload.case_id }
        : {}),

      ...(payload.hearing_id != null
        ? { hearing_id: payload.hearing_id }
        : {}),
    }),
  });
}
