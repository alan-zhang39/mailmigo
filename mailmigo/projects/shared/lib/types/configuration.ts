export enum LLMType {
  OPENAI = "openai",
  BEDROCK = "bedrock",
}

export interface Configuration {
  llm: LLMType;
  prompt: string;
}
