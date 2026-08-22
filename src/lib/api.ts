async uploadDocument(payload: {
  file: File;
  title?: string;
  category?: string;
  case_id?: number;
  hearing_id?: number;
}) {
  const formData = new FormData();

  formData.append('file', payload.file);

  if (payload.title) {
    formData.append('title', payload.title);
  }

  if (payload.category) {
    formData.append('category', payload.category);
  }

  if (payload.case_id !== undefined) {
    formData.append('case_id', String(payload.case_id));
  }

  if (payload.hearing_id !== undefined) {
    formData.append('hearing_id', String(payload.hearing_id));
  }

  return this.request('/documents', {
    method: 'POST',
    body: formData,
  });
}
