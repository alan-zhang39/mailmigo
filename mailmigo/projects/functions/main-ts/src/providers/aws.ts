import { BedrockClient, BedrockClientConfig } from "@aws-sdk/client-bedrock";

import { TextractClient, TextractClientConfig } from "@aws-sdk/client-textract";
import "dotenv/config";

const awsDefaultConfig = {
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env["AWS_ACCESS_KEY_ID"],
    secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"],
  },
};

export const bedrock = new BedrockClient(
  awsDefaultConfig as BedrockClientConfig,
);

export const textract = new TextractClient(
  awsDefaultConfig as TextractClientConfig,
);
