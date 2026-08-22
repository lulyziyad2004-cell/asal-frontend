async uploadDocument(payload: {
  file: File;
  title?: string;
  category?: string;
  case_id?: number;
  hearing_id?: number;
}) {
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(String(reader.result));
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
      category: payload.category || "other",
      mime_type:
        payload.file.type || "application/octet-stream",

      ...(payload.case_id !== undefined
        ? { case_id: payload.case_id }
        : {}),

      ...(payload.hearing_id !== undefined
        ? { hearing_id: payload.hearing_id }
        : {}),
    }),
  });
}
