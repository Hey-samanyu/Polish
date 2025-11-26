export interface ImproverState {
  inputText: string;
  outputText: string;
  isLoading: boolean;
  error: string | null;
}

export enum ImprovementTone {
  NEUTRAL = 'Neutral',
  PROFESSIONAL = 'Professional',
  CASUAL = 'Casual',
  CREATIVE = 'Creative'
}

export interface SelectionState {
  start: number;
  end: number;
  text: string;
}