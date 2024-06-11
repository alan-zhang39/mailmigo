import { BedrockClient, BedrockClientConfig } from "@aws-sdk/client-bedrock";

import { TextractClient, TextractClientConfig } from "@aws-sdk/client-textract";

const aws_default_config = {
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env["AWS_ACCESS_KEY_ID"],
    secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"],
  },
};

export const bedrock = new BedrockClient(
  <BedrockClientConfig>aws_default_config,
);

export const textract = new TextractClient(
  <TextractClientConfig>aws_default_config,
);
