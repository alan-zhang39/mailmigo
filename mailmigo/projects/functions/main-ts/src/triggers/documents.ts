import * as logger from "firebase-functions/logger";
import { getStorage } from "firebase-admin/storage";
import { getDatabase } from "firebase-admin/database";
import { strict as assert } from "node:assert";
import { textract } from "../providers/aws";
import { convert } from "pdf-img-convert";
import {
  DetectDocumentTextCommand,
  DetectDocumentTextCommandInput,
  DetectDocumentTextCommandOutput,
  BlockType,
} from "@aws-sdk/client-textract";
import { Transcription } from "*shared/lib/types/interfaces/transcription";
import { onValueCreated } from "firebase-functions/v2/database";
import { TaskStatus } from "*shared";

const storage = getStorage();
const db = getDatabase();

/*
 * Create a transcription entry in the RTDB and storage
 * when a task is added to the RTDB.
 */
export const onTaskUploadCreateTranscription = onValueCreated(
  {
    ref: "tasks/{taskId}",
    memory: "2GiB",
  },
  async (event) => {
    const { taskId } = event.params;
    const { orgId, uid, documentId } = event.data.val();
    db.ref(`tasks/${taskId}/status`).set(TaskStatus.TRANSCRIBING);
    try {
      const docPath = `documents/${orgId}/${uid}/${documentId}.pdf`;
      const bucket = storage.bucket();
      const file = bucket.file(docPath);

      const exists = await file.exists();
      if (!exists) throw Error("Associated PDF does not exist");

      const pdfBytes = Buffer.concat(await file.download());
      const transcriptionText = await transcribePdf(pdfBytes);

      const transcriptionPath = `transcriptions/${orgId}/${uid}/${documentId}`;
      // Take the same Storage bucket as the download
      const transcription: Transcription = {
        uid,
        orgId,
        documentId,
        taskId,
        content: transcriptionText,
        timestamp: Date.now(),
      };

      // Upload to storage
      await bucket.file(`${transcriptionPath}.txt`).save(transcriptionText);

      // Upload to RTDB
      const transcriptionRef = db.ref(transcriptionPath);
      transcriptionRef.set(transcription);
      return logger.log(`Finished pdf transcription: ${documentId}`);
    } catch (e) {
      logger.error(e);
      logger.error(`Failed to complete pdf transcription: ${documentId}`);
      db.ref(`tasks/${taskId}/status`).set(TaskStatus.FAILED);
    }
  },
);

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
