/**
 * Paperless-ngx API Client
 *
 * Direct API client for Paperless-ngx document repository
 * Based on official API documentation: https://github.com/paperless-ngx/paperless-ngx/blob/main/docs/api.md
 *
 * @version 1.0.0
 */

// ============================================================================
// Type Definitions
// ============================================================================

interface PaginationParams {
  page?: number;
  page_size?: number;
}

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  all: number[];
  results: T[];
}

interface SearchHit {
  score: number;
  highlights: string;
  rank: number;
}

interface SearchResult extends Document {
  __search_hit__?: SearchHit;
}

// ============================================================================
// Core API Client
// ============================================================================

export class PaperlessClient {
  private baseUrl: string;
  private token?: string;
  private apiVersion: string = '6';

  constructor(config: PaperlessClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.token = config.token;
  }

  // =========================================================================
  // Private Methods
  // =========================================================================

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json; version=' + this.apiVersion,
      'Accept': 'application/json; version=' + this.apiVersion,
    };

    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new PaperlessError(
        `Request failed: ${response.status} ${response.statusText}`,
        response.status,
        error
      );
    }

    return response.json();
  }

  // =========================================================================
  // Authentication
  // =========================================================================

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = undefined;
  }

  /**
   * Create or recreate authentication token
   */
  async createToken(username: string, password: string): Promise<TokenResponse> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    return this.request<TokenResponse>('/api/token/', {
      method: 'POST',
      body: formData,
    });
  }

  // =========================================================================
  // Documents
  // =========================================================================

  /**
   * List all documents
   */
  async listDocuments(params: PaginationParams & QueryParams = {}): Promise<ApiResponse<SearchResult>> {
    const queryParams = this.buildQueryParams(params);
    return this.request<ApiResponse<SearchResult>>(`/api/documents/?${queryParams}`);
  }

  /**
   * Get document by ID
   */
  async getDocument(id: number): Promise<Document> {
    return this.request<Document>(`/api/documents/${id}/`);
  }

  /**
   * Search documents
   */
  async searchDocuments(query: string, params: PaginationParams = {}): Promise<ApiResponse<SearchResult>> {
    const queryParams = this.buildQueryParams({ ...params, query });
    return this.request<ApiResponse<SearchResult>>(`/api/documents/?${queryParams}`);
  }

  /**
   * Search documents similar to another document
   */
  async searchSimilar(id: number): Promise<ApiResponse<SearchResult>> {
    return this.request<ApiResponse<SearchResult>>(`/api/documents/?more_like_id=${id}`);
  }

  /**
   * Upload document
   */
  async uploadDocument(file: File, metadata: DocumentMetadata = {}): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('document', file);

    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.created) formData.append('created', metadata.created);
    if (metadata.correspondent) formData.append('correspondent', metadata.correspondent.toString());
    if (metadata.document_type) formData.append('document_type', metadata.document_type.toString());
    if (metadata.tags) formData.append('tags', metadata.tags.join(','));
    if (metadata.storage_path) formData.append('storage_path', metadata.storage_path.toString());
    if (metadata.archive_serial_number) formData.append('archive_serial_number', metadata.archive_serial_number);
    if (metadata.custom_fields) formData.append('custom_fields', JSON.stringify(metadata.custom_fields));

    return this.request<UploadResponse>('/api/documents/post_document/', {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Bulk edit documents
   */
  async bulkEditDocuments(options: BulkEditOptions): Promise<void> {
    return this.request<void>('/api/documents/bulk_edit/', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  /**
   * Download document
   */
  async downloadDocument(id: number, original: boolean = false): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/documents/${id}/download/?original=${original}`, {
      headers: this.token ? { 'Authorization': `Token ${this.token}` } : {},
    });

    if (!response.ok) {
      throw new PaperlessError(
        `Download failed: ${response.status} ${response.statusText}`,
        response.status,
        await response.text()
      );
    }

    return response.blob();
  }

  /**
   * Get document thumbnail
   */
  async getDocumentThumbnail(id: number): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/documents/${id}/thumb/`, {
      headers: this.token ? { 'Authorization': `Token ${this.token}` } : {},
    });

    if (!response.ok) {
      throw new PaperlessError(
        `Thumbnail failed: ${response.status} ${response.statusText}`,
        response.status,
        await response.text()
      );
    }

    return response.blob();
  }

  /**
   * Get document preview
   */
  async getDocumentPreview(id: number): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/documents/${id}/preview/`, {
      headers: this.token ? { 'Authorization': `Token ${this.token}` } : {},
    });

    if (!response.ok) {
      throw new PaperlessError(
        `Preview failed: ${response.status} ${response.statusText}`,
        response.status,
        await response.text()
      );
    }

    return response.blob();
  }

  // =========================================================================
  // Tags
  // =========================================================================

  /**
   * List all tags
   */
  async listTags(params: PaginationParams = {}): Promise<ApiResponse<Tag>> {
    const queryParams = this.buildQueryParams(params);
    return this.request<ApiResponse<Tag>>(`/api/tags/?${queryParams}`);
  }

  /**
   * Get tag by ID
   */
  async getTag(id: number): Promise<Tag> {
    return this.request<Tag>(`/api/tags/${id}/`);
  }

  /**
   * Create tag
   */
  async createTag(tag: CreateTag): Promise<Tag> {
    return this.request<Tag>('/api/tags/', {
      method: 'POST',
      body: JSON.stringify(tag),
    });
  }

  /**
   * Update tag
   */
  async updateTag(id: number, tag: UpdateTag): Promise<Tag> {
    return this.request<Tag>(`/api/tags/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(tag),
    });
  }

  /**
   * Update tag color
   */
  async updateTagColor(id: number, color: string): Promise<Tag> {
    return this.updateTag(id, { color });
  }

  /**
   * Update tag text color
   */
  async updateTagTextColor(id: number, textColor: string): Promise<Tag> {
    return this.updateTag(id, { text_color: textColor });
  }

  /**
   * Delete tag
   */
  async deleteTag(id: number): Promise<void> {
    return this.request<void>(`/api/tags/${id}/`, {
      method: 'DELETE',
    });
  }

  // =========================================================================
  // Correspondents
  // =========================================================================

  /**
   * List all correspondents
   */
  async listCorrespondents(params: PaginationParams = {}): Promise<ApiResponse<Correspondent>> {
    const queryParams = this.buildQueryParams(params);
    return this.request<ApiResponse<Correspondent>>(`/api/correspondents/?${queryParams}`);
  }

  /**
   * Get correspondent by ID
   */
  async getCorrespondent(id: number): Promise<Correspondent> {
    return this.request<Correspondent>(`/api/correspondents/${id}/`);
  }

  /**
   * Create correspondent
   */
  async createCorrespondent(correspondent: CreateCorrespondent): Promise<Correspondent> {
    return this.request<Correspondent>('/api/correspondents/', {
      method: 'POST',
      body: JSON.stringify(correspondent),
    });
  }

  /**
   * Update correspondent
   */
  async updateCorrespondent(id: number, correspondent: UpdateCorrespondent): Promise<Correspondent> {
    return this.request<Correspondent>(`/api/correspondents/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(correspondent),
    });
  }

  /**
   * Delete correspondent
   */
  async deleteCorrespondent(id: number): Promise<void> {
    return this.request<void>(`/api/correspondents/${id}/`, {
      method: 'DELETE',
    });
  }

  // =========================================================================
  // Document Types
  // =========================================================================

  /**
   * List all document types
   */
  async listDocumentTypes(params: PaginationParams = {}): Promise<ApiResponse<DocumentType>> {
    const queryParams = this.buildQueryParams(params);
    return this.request<ApiResponse<DocumentType>>(`/api/document_types/?${queryParams}`);
  }

  /**
   * Get document type by ID
   */
  async getDocumentType(id: number): Promise<DocumentType> {
    return this.request<DocumentType>(`/api/document_types/${id}/`);
  }

  /**
   * Create document type
   */
  async createDocumentType(documentType: CreateDocumentType): Promise<DocumentType> {
    return this.request<DocumentType>('/api/document_types/', {
      method: 'POST',
      body: JSON.stringify(documentType),
    });
  }

  /**
   * Update document type
   */
  async updateDocumentType(id: number, documentType: UpdateDocumentType): Promise<DocumentType> {
    return this.request<DocumentType>(`/api/document_types/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(documentType),
    });
  }

  /**
   * Delete document type
   */
  async deleteDocumentType(id: number): Promise<void> {
    return this.request<void>(`/api/document_types/${id}/`, {
      method: 'DELETE',
    });
  }

  // =========================================================================
  // Storage Paths
  // =========================================================================

  /**
   * List all storage paths
   */
  async listStoragePaths(params: PaginationParams = {}): Promise<ApiResponse<StoragePath>> {
    const queryParams = this.buildQueryParams(params);
    return this.request<ApiResponse<StoragePath>>(`/api/storage_paths/?${queryParams}`);
  }

  /**
   * Get storage path by ID
   */
  async getStoragePath(id: number): Promise<StoragePath> {
    return this.request<StoragePath>(`/api/storage_paths/${id}/`);
  }

  /**
   * Create storage path
   */
  async createStoragePath(storagePath: CreateStoragePath): Promise<StoragePath> {
    return this.request<StoragePath>('/api/storage_paths/', {
      method: 'POST',
      body: JSON.stringify(storagePath),
    });
  }

  /**
   * Update storage path
   */
  async updateStoragePath(id: number, storagePath: UpdateStoragePath): Promise<StoragePath> {
    return this.request<StoragePath>(`/api/storage_paths/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(storagePath),
    });
  }

  /**
   * Delete storage path
   */
  async deleteStoragePath(id: number): Promise<void> {
    return this.request<void>(`/api/storage_paths/${id}/`, {
      method: 'DELETE',
    });
  }

  // =========================================================================
  // Search & Autocomplete
  // =========================================================================

  /**
   * Get search autocomplete suggestions
   */
  async searchAutocomplete(term: string, limit: number = 10): Promise<string[]> {
    return this.request<string[]>(`/api/search/autocomplete/?term=${encodeURIComponent(term)}&limit=${limit}`);
  }

  // =========================================================================
  // Tasks
  // =========================================================================

  /**
   * Get task status
   */
  async getTask(taskId: string): Promise<Task> {
    return this.request<Task>(`/api/tasks/?task_id=${taskId}`);
  }

  /**
   * Acknowledge task
   */
  async acknowledgeTask(taskId: string): Promise<void> {
    return this.request<void>('/api/tasks/acknowledge/', {
      method: 'POST',
      body: JSON.stringify({ task_id: taskId }),
    });
  }

  // =========================================================================
  // Helper Methods
  // =========================================================================

  private buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          searchParams.delete(key);
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.set(key, value.toString());
        }
      }
    }
    return searchParams.toString();
  }
}

// ============================================================================
// Type Definitions
// ============================================================================

export interface PaperlessClientConfig {
  baseUrl: string;
  token?: string;
}

export interface TokenResponse {
  token: string;
}

export interface QueryParams {
  query?: string;
  [key: string]: any;
}

export interface Document {
  id: number;
  title: string;
  content?: string;
  created?: string;
  created_date?: string;
  modified?: string;
  added?: string;
  asn?: string;
  document_type?: number;
  correspondent?: number;
  storage_path?: number;
  tags?: number[];
  archive_serial_number?: string;
  original_file_name?: string;
  archived_file_name?: string;
  owner?: number;
  user_can_change?: boolean;
}

export interface DocumentMetadata {
  title?: string;
  created?: string;
  correspondent?: number;
  document_type?: number;
  tags?: number[];
  storage_path?: number;
  archive_serial_number?: string;
  custom_fields?: Record<number, any> | number[];
}

export interface UploadResponse {
  task_id: string;
  message?: string;
}

export interface BulkEditOptions {
  documents: number[];
  method: BulkEditMethod;
  parameters?: BulkEditParameters;
  owner?: number;
}

export type BulkEditMethod =
  | 'set_correspondent'
  | 'set_document_type'
  | 'set_storage_path'
  | 'add_tag'
  | 'remove_tag'
  | 'modify_tags'
  | 'delete'
  | 'reprocess'
  | 'set_permissions'
  | 'merge'
  | 'split'
  | 'rotate'
  | 'delete_pages'
  | 'edit_pdf'
  | 'modify_custom_fields';

export interface BulkEditParameters {
  correspondent?: number;
  document_type?: number;
  storage_path?: number;
  tag?: number;
  add_tags?: number[];
  remove_tags?: number[];
  set_permissions?: Permissions;
  degrees?: number;
  pages?: string | number[];
  doc_ids?: number[];
  operations?: PDFOperation[];
  metadata_document_id?: number;
  delete_original?: boolean;
  delete_originals?: boolean;
  update_document?: boolean;
  include_metadata?: boolean;
  add_custom_fields?: Record<number, any> | number[];
  remove_custom_fields?: number[];
}

export interface Permissions {
  view?: {
    users?: number[];
    groups?: number[];
  };
  change?: {
    users?: number[];
    groups?: number[];
  };
}

export interface PDFOperation {
  page?: number;
  rotate?: number;
  doc?: number;
}

export interface Tag {
  id: number;
  slug: string;
  name: string;
  color: string;
  text_color: string;
  match: string;
  matching_algorithm: MatchingAlgorithm;
  is_insensitive: boolean;
  is_inbox_tag: boolean;
  document_count: number;
  owner?: number;
  user_can_change: boolean;
  parent?: number;
  children?: Tag[];
}

export type MatchingAlgorithm = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface CreateTag {
  name: string;
  color?: string;
  match?: string;
  matching_algorithm?: MatchingAlgorithm;
  is_inbox_tag?: boolean;
}

export interface UpdateTag {
  name?: string;
  color?: string;
  text_color?: string;
  match?: string;
  matching_algorithm?: MatchingAlgorithm;
}

export interface Correspondent {
  id: number;
  slug: string;
  name: string;
  match: string;
  matching_algorithm: MatchingAlgorithm;
  is_insensitive: boolean;
  document_count: number;
  owner?: number;
  user_can_change: boolean;
}

export interface CreateCorrespondent {
  name: string;
  match?: string;
  matching_algorithm?: MatchingAlgorithm;
  is_insensitive?: boolean;
}

export interface UpdateCorrespondent {
  name?: string;
  match?: string;
  matching_algorithm?: MatchingAlgorithm;
  is_insensitive?: boolean;
}

export interface DocumentType {
  id: number;
  slug: string;
  name: string;
  match: string;
  matching_algorithm: MatchingAlgorithm;
  is_insensitive: boolean;
  document_count: number;
  owner?: number;
  user_can_change: boolean;
}

export interface CreateDocumentType {
  name: string;
  match?: string;
  matching_algorithm?: MatchingAlgorithm;
}

export interface UpdateDocumentType {
  name?: string;
  match?: string;
  matching_algorithm?: MatchingAlgorithm;
}

export interface StoragePath {
  id: number;
  slug: string;
  name: string;
  path: string;
  matching_algorithm: MatchingAlgorithm;
  is_insensitive: boolean;
  document_count: number;
  owner?: number;
  user_can_change: boolean;
}

export interface CreateStoragePath {
  name: string;
  path: string;
  matching_algorithm?: MatchingAlgorithm;
}

export interface UpdateStoragePath {
  name?: string;
  path?: string;
  matching_algorithm?: MatchingAlgorithm;
}

export interface Task {
  id: string;
  status: string;
  related_document?: number;
  created: string;
  finished?: string | null;
  result: string | null;
  acknowledged: boolean;
}

export class PaperlessError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details: string
  ) {
    super(message);
    this.name = 'PaperlessError';
  }
}

// ============================================================================
// Exports
// ============================================================================

export default PaperlessClient;
