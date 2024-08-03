export enum ConfigurationType {
  USER = "user",
  ORGANIZATION = "org",
  SYSTEM = "system",
}

export enum LLMType {
  OPENAI = "OpenAI",
  BEDROCK = "AWS Bedrock",
}

export interface Configuration {
  type: ConfigurationType;
  llm: LLMType;
  prompt: string;
  required?: boolean;
}
