/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { TEST_STR } from "*shared";
import { bedrock } from "./providers/aws";
import {
  ListFoundationModelsCommand,
  ListFoundationModelsCommandInput,
} from "@aws-sdk/client-bedrock";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send(TEST_STR);
});

export const testBedrock = onRequest(async (req, res) => {
  const input = {
    byOutputModality: "TEXT",
    byInferenceType: "ON_DEMAND",
  };
  const cmd = new ListFoundationModelsCommand(
    <ListFoundationModelsCommandInput>input,
  );
  try {
    const aws_res = await bedrock.send(cmd);
    res.json(aws_res);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});
