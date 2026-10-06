import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DocumentItem } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  constructor(private api: ApiService) {}

  getDocuments(params?: { case_id?: number; search?: string; doc_type?: string }): Observable<{ success: boolean; data: DocumentItem[] }> {
    return this.api.get<{ success: boolean; data: DocumentItem[] }>('documents', params);
  }

  getDocumentById(id: number): Observable<{ success: boolean; data: DocumentItem }> {
    return this.api.get<{ success: boolean; data: DocumentItem }>(`documents/${id}`);
  }

  uploadDocument(formData: FormData): Observable<{ success: boolean; message: string; data: DocumentItem }> {
    return this.api.postFormData<{ success: boolean; message: string; data: DocumentItem }>('documents/upload', formData);
  }

  deleteDocument(id: number): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`documents/${id}`);
  }

  getDownloadUrl(id: number): string {
    const token = localStorage.getItem('justiceflow_token') || localStorage.getItem('justiceflow_client_token');
    return token
      ? `${environment.apiUrl}/documents/${id}/download?token=${encodeURIComponent(token)}`
      : `${environment.apiUrl}/documents/${id}/download`;
  }
}
