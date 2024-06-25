/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at
 * https://firebase.google.com/docs/functions
 */

import { applicationDefault, initializeApp } from "firebase-admin/app";

// Setup
const config = JSON.parse(process.env["FIREBASE_CONFIG"]!);

initializeApp({
  credential: applicationDefault(),
  databaseURL: config.databaseURL,
  storageBucket: config.storageBucket,
});

import { onValueCreated } from "firebase-functions/v2/database";
import {
  onObjectFinalized,
  StorageObjectData,
} from "firebase-functions/v2/storage";
import { getStorage } from "firebase-admin/storage";
import { getDatabase } from "firebase-admin/database";
import {
  DetectDocumentTextCommand,
  DetectDocumentTextCommandInput,
  DetectDocumentTextCommandOutput,
  BlockType,
} from "@aws-sdk/client-textract";
import { Transcription } from "*shared/lib/types/interfaces/transcription";
import { Bucket } from "@google-cloud/storage";
import { strict as assert } from "node:assert";
import { openai } from "./providers/openai";
import { textract } from "./providers/aws";
import * as logger from "firebase-functions/logger";
import { onEmailReceived } from "./routes/gmail";
import { convert } from "pdf-img-convert";
import { onSummaryUploadSendReply } from "./triggers/replies";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const storage = getStorage();
const db = getDatabase();
/*
 * Create a transcription entry in the RTDB and
 * storage for any PDF uploaded to storage.
 *
 * Currently doesn't check the actual file path in storage,
 * which means you can upload the pdf anywhere.
 * See https://stackoverflow.com/a/45405350 for details.
 */
exports.createTranscriptionOnStorageUpload = onObjectFinalized(
  {
    memory: "2GiB",
  },
  async (event) => {
    logger.log(`Detected PDF upload: ${event.data.name}`);
    try {
      if (!isPdf(event.data)) {
        logger.log(`Not a PDF: ${event.data.contentType}`);
        return;
      }

      const pdfBytes = await downloadPdfFromStorage(event.data);

      if (pdfBytes === undefined) {
        logger.log(`PDF is empty`);
        return;
      }

      const bucket = storage.bucket(event.data.bucket);
      const transcriptionText = await transcribePdf(pdfBytes);

      // Take the same Storage bucket as the download
      uploadTranscriptionText(
        bucket,
        event.data.name.replace(".pdf", ""),
        transcriptionText,
      );
    } catch (e) {
      console.log(e);
      logger.error(`Failed to complete pdf transcription: ${event.data.name}`);
    }

    return logger.log(`Finished pdf transcription: ${event.data.name}`);
  },
);

const isPdf = (data: StorageObjectData) => {
  return data.contentType?.startsWith("application/pdf");
};

/*
 * Upload `transcriptionText` to the Firebase RTDB and Firebase Cloud Storage.
 * The path/filename is currently given by `transcriptionFilename` (see below).
 */
const uploadTranscriptionText = (
  bucket: Bucket,
  name: string,
  transcriptionText: string,
) => {
  // TODO: Change temporary values to actual values
  const orgId = "tempOrgId";
  const uid = "tempUid";

  const transcription: Transcription = {
    uid: uid,
    orgId: orgId,
    documentId: name,
    content: transcriptionText,
    createdOn: Date.now(), // TODO: get actual date
  };
  const transcriptionPath = `demo/transcriptions/${orgId}/${uid}/${name}`;

  // Upload to RTDB
  const transcriptionRef = db.ref(transcriptionPath);
  transcriptionRef.set(transcription);

  // Upload string to Storage
  bucket.file(`${transcriptionPath}.txt`).save(transcriptionText);
};

/*
 * Return the bytes of the PDF specified by `data`.
 *
 * Note: May fail if the file path contains unsupported characters.
 * See details below.
 */
const downloadPdfFromStorage = async (data: StorageObjectData) => {
  assert(isPdf(data));

  const fileBucket = data.bucket;
  const filePath = data.name;
  const bucket = storage.bucket(fileBucket);

  /* NOTE: if filePath contains "bad" characters,
   * download() fails with `TypeError [ERR_INVALID_CHAR]:
   *  Invalid character in header content`.
   * This occurs on the default MacOS screenshot name,
   *  which contains the U+202F character.
   * TODO: discuss / fix this ^
   */
  const downloadResponse = await bucket.file(filePath).download();

  // Concatenate because the downloadResponse is [Buffer],
  // but ironpdf requires Buffer.
  const bytes = Buffer.concat(downloadResponse);
  return bytes;
};

/*
 * Transcribe pdfBytes to text.
 * This splits the PDF into images for use in the the detectText function.
 * The results are combined into a single text file.
 */
const transcribePdf = async (pdfBytes: Buffer) => {
  const imageBuffers = await convert(pdfBytes);

  const transcriptionPromises = imageBuffers.map((b) =>
    detectText(b as Uint8Array),
  );
  const textractResponses = await Promise.all(transcriptionPromises);

  let transcriptionText = "";
  // Add all lines in a `textractResponse` to
  // `transcriptionText`, defined above.
  const addToTranscription = (
    textractResponse: DetectDocumentTextCommandOutput,
  ) => {
    textractResponse.Blocks?.forEach((block) => {
      if (block.BlockType === BlockType.LINE) {
        assert(block.Text !== undefined);
        transcriptionText += block.Text + "\n";
      }
    });
  };

  textractResponses.forEach(addToTranscription);

  return transcriptionText;
};

/*
 * Return the result of sending imageBuffer to Textract.
 * Uses the DetectDocumentTextCommand,
 * which requires that the buffer is a JPEG/PNG.
 * See transcribePdf for the PDF wrapper.
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/
 * latest/client/textract/command/DetectDocumentTextCommand/
 */
const detectText = async (imageBuffer: Uint8Array) => {
  const input: DetectDocumentTextCommandInput = {
    Document: {
      Bytes: imageBuffer,
    },
  };
  const command = new DetectDocumentTextCommand(input);

  return textract.send(command);
};

exports.onEmailReceived = onEmailReceived;

/* Upon transcription upload,
 * use OpenAI to summarize and upload results to generations */
exports.onTranscriptionUploadGenSummary = onValueCreated(
  "demo/transcriptions/{orgId}/{uid}/{documentId}",
  async (event) => {
    logger.info("New transcription detected");

    const { orgId, uid, documentId } = event.params;

    // Grab the current value of what was written to the Realtime Database.
    const transcription: Transcription = event.data.val();
    const transcriptionContent = transcription.content;

    // Create summary
    const summary = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant who summarizes documents, such as PDFs, when given a text transcription.",
        },
        {
          role: "user",
          content: `Please provide a plaintext summarization of the following: \n\n${transcriptionContent}`,
        },
      ],
      model: "gpt-4o",
    });

    const summaryText = summary.choices[0].message.content;

    // Create the new reference path for the summary
    const summaryRef = event.data.ref.root.child(
      `demo/generations/summary/${orgId}/${uid}/${documentId}`,
    );

    // Write the summary text to the new location
    summaryRef.set(summaryText);
    return logger.info(`Summary generated for id: ${documentId}`);
  },
);

exports.onSummaryUploadSendReply = onSummaryUploadSendReply;
