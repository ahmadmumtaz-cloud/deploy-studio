export interface FileData {
  filename: string;
  content: string;
  language: string;
}

export interface GeneratedProject {
  projectName: string;
  description: string;
  files: FileData[];
  setupInstructions: string;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}