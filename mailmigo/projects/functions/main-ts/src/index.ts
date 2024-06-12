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
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { onValueCreated } from "firebase-functions/v2/database";
import {
  ListFoundationModelsCommand,
  ListFoundationModelsCommandInput,
} from "@aws-sdk/client-bedrock";

import { openai } from "./providers/openai";

initializeApp({ credential: applicationDefault() });

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
    <ListFoundationModelsCommandInput>input
  );
  try {
    const aws_res = await bedrock.send(cmd);
    res.json(aws_res);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

/* Upon transcription upload, use OpenAI to summarize and upload results to generations */
export const on_transcription_upload_gen_summary = onValueCreated(
  "/transcriptions/{orgId}/{uid}/{documentId}",
  async (event) => {
    const { uid, documentId } = event.params;

    // Grab the current value of what was written to the Realtime Database.
    const transcription_content = event.data.val();

    // Create summary
    const summary = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant, who summarizes emails.",
        },
        {
          role: "user",
          content: `Please summarize the following:\n\n${transcription_content}`,
        },
      ],
      model: "gpt-4o",
    });

    const summary_text = summary.choices[0].message.content;

    // Create the new reference path for the summary
    const summaryRef = event.data.ref.root.child(
      `generations/summary/${uid}/${documentId}`
    );

    // Write the summary text to the new location
    return summaryRef.set(summary_text);
  }
);
