async uploadDocument(payload: {
  file: File;
  title?: string;
  category?: string;
  case_id?: number;
  hearing_id?: number;
}) {
  if (!(payload.file instanceof File)) {
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

  if (payload.case_id !== undefined) {
    formData.append("case_id", String(payload.case_id));
  }

  if (payload.hearing_id !== undefined) {
    formData.append("hearing_id", String(payload.hearing_id));
  }

  return this.request("/documents", {
    method: "POST",
    body: formData,
  });
}
