export interface DownloadableDocument {
    key: string;
    category: string;
    label: string;
    filename: string | null;
    url: string;
    size: number | null;
}

export interface DownloadableDocumentsResponse {
    documents: DownloadableDocument[];
}
