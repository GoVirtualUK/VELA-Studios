export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export interface MediaSource {
  type: MediaType;
  url: string;
  file?: File; // Keep the file reference for AI analysis
}

export interface AnalysisState {
  isLoading: boolean;
  result: string | null;
  error: string | null;
}
