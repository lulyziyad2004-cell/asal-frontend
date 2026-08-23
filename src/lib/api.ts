/**
 * Upload a document using multipart/form-data.
 * The Backend upload endpoint is /upload.
 */
async uploadDocument(payload: {
  file: File;
  title?: string;
  category?: string;
  case_id?: number;
  hearing_id?: number;
}) {
  if (!(payload.file instanceof File) || payload.file.size === 0) {
    throw new Error('لم يتم اختيار ملف صالح');
  }

  const formData = new FormData();

  formData.append('file', payload.file, payload.file.name);
  formData.append('file_name', payload.file.name);
  formData.append(
    'title',
    payload.title?.trim() || payload.file.name
  );
  formData.append(
    'category',
    payload.category?.trim() || 'other'
  );
  formData.append(
    'mime_type',
    payload.file.type || 'application/octet-stream'
  );

  if (payload.case_id !== undefined && payload.case_id !== null) {
    formData.append('case_id', String(payload.case_id));
  }

  if (
    payload.hearing_id !== undefined &&
    payload.hearing_id !== null
  ) {
    formData.append(
      'hearing_id',
      String(payload.hearing_id)
    );
  }

  return this.request('/upload', {
    method: 'POST',
    body: formData,
  });
}
