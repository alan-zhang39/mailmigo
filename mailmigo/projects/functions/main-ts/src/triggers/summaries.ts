import { Transcription, Generation, GenerationType, TaskStatus } from "*shared";
import { onValueCreated } from "firebase-functions/v2/database";
import { openai } from "../providers/openai";
import * as logger from "firebase-functions/logger";
import { mdToPdf } from "md-to-pdf";
import { getStorage } from "firebase-admin/storage";
import { getDatabase } from "firebase-admin/database";

/* Upon transcription upload,
 * use OpenAI to summarize and upload results to generations */
const storage = getStorage();
const db = getDatabase();

const extractMarkdownContent = (text: string | null): string | null => {
  if (text === null) return null;
  const regexWithBackticks = /```(?:markdown)?\s*([\s\S]*?)\s*```/g;
  const matchesWithBackticks = regexWithBackticks.exec(text);
  if (matchesWithBackticks) return matchesWithBackticks[1];
  return text.trim();
};

export const onTranscriptionUploadGenSummary = onValueCreated(
  {
    ref: "transcriptions/{orgId}/{uid}/{documentId}",
    memory: "1GiB",
  },
  async (event) => {
    logger.info("New transcription detected");

    // Grab the current value of what was written to the Realtime Database.
    const transcription: Transcription = event.data.val();
    const { orgId, uid, documentId, taskId } = transcription;
    db.ref(`tasks/${taskId}/status`).set(TaskStatus.GENERATING);
    try {
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

            content: `Please provide a markdown summarization of the following: \n\n${transcription.content}`,
          },
        ],
        model: "gpt-4o",
      });

      const summaryText = extractMarkdownContent(
        summary.choices[0].message.content,
      );

      if (summaryText === null) throw Error("Unable to generate summary.");

      const { content: buffer } = await mdToPdf({ content: summaryText }, {});

      const path = `generations/summary/${orgId}/${uid}/${documentId}`;

      await storage.bucket().file(`${path}.pdf`).save(buffer);

      // Write the summary text to the new location
      // Create the new reference path for the summary
      const summaryRef = event.data.ref.root.child(path);
      const generation: Generation = {
        type: GenerationType.SUMMARY,
        uid,
        orgId,
        documentId,
        taskId,
        timestamp: Date.now(),
      };
      summaryRef.set(generation);
      return logger.info(`Summary generated for id: ${documentId}`);
    } catch (e) {
      logger.error(e);
      db.ref(`tasks/${taskId}/status`).set(TaskStatus.FAILED);
      return logger.error(`Failed to generate summary for id: ${documentId}`);
    }
  },
);
