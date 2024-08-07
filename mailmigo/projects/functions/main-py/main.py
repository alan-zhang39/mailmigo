# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn, db_fn
from firebase_admin import initialize_app
from providers.pinecone import index
from providers.openai import client, MODEL, CHAT_MODEL
from langchain.text_splitter import RecursiveCharacterTextSplitter
import uuid
from firebase_admin import db
import json
import datetime
from flask_cors import cross_origin
from typing import Any
import ast
import time

initialize_app()


@https_fn.on_request()
def on_request_example(req: https_fn.Request) -> https_fn.Response:
    return https_fn.Response("Hello world!")


@https_fn.on_request()
def pinecone_test(req: https_fn.Request) -> https_fn.Response:
    results = list(index.list())
    print("first 5 ids:", [results[0][i] for i in range(0, 5)])
    return https_fn.Response(
        results[0] if len(results[0]) != 0 else "No results in index\n"
    )


# export interface Transcription {
#   id: string;
#   uid: string;
#   orgId: string;
#   documentId: string;
#   content: string;
#   createdOn: number;
# }


@db_fn.on_value_created(reference="/transcriptions/{orgId}/{uid}/{documentId}")
# Get transcription content -> chunk content -> embed content -> upsert into Pinecone index
def on_transcription_upload(event: db_fn.Event[Any]) -> None:
    # transcription was deleted
    original = event.data
    if not isinstance(original, dict):
        print(f"Not a dict: {event.reference}")
        return

    # # transcription was updated. diff before and after for new child
    # if event.data.before is not None:
    #     transcription = {k: after[k] for k in set(after) - set(before)}.values()
    # else:
    #     transcription = event.data.after.values()

    # remove key; get transcription object; get content
    documentId = event.params["documentId"]
    content = original["content"]
    chunked_text = chunk_text(content)
    embed_and_upsert(documentId, chunked_text, 32)


@db_fn.on_value_written(reference="/chatMessages/{documentId}")
# Chunk, embed, and upsert message content.
# Generate response to message from OpenAI, using top_k=10 closest matches from Pinecone as context
# Insert response into DB
def on_new_user_chat(event: db_fn.Event[db_fn.Change]) -> None:
    # Weird thing happens where if we listen for value created on chatMessages/{docId}/{messageId}
    # we get an empty string for event.data
    # so we listen for written on a given document, compare the prev and after,
    # and pick out the new message that was added

    # document tree was deleted
    if event.data.after is None:
        return

    before = event.data.before
    after = event.data.after

    # document was updated. diff before and after for new message
    if event.data.before is not None:
        messages = {k: after[k] for k in set(after) - set(before)}.values()
    else:
        messages = event.data.after.values()

    # Extract message from .values()
    message = list(messages)[0]

    print(messages)

    if message == "" or message["isResponse"]:
        return

    docId = message["documentId"]

    ref_path = f"chatMessages/{docId}"
    messages_ref = db.reference(ref_path)
    embedding = client.embeddings.create(input=message["content"], model=MODEL)
    closest = index.query(
        vector=embedding.data[0].embedding,
        filter={"documentId": {"$eq": docId}},
        top_k=5,
        include_metadata=True,
    )["matches"]
    closest_text = [d["metadata"]["text"] for d in closest]

    # "a","b","c"
    formatted_closest_text = ",".join(['"{}"'.format(value) for value in closest_text])

    if len(closest) == 0:
        print("No matches found")
    print(f"Formatted closest:\n {formatted_closest_text}")

    chat_completion_messages = [
        {
            "role": "system",
            "content": "You are a helpful assistant who answers user questions. "
            "Context will be provided as a comma delimited list of quotation wrapped strings. In your answer, do not include or mention anything about the given context. If the context does not make sense, do not mention this to the user. Instead, answer normally without the context.",
        },
        {
            "role": "user",
            "content": message["content"] + "\n\nContext: " + formatted_closest_text,
        },
    ]

    response = client.chat.completions.create(
        model=CHAT_MODEL, messages=chat_completion_messages
    )

    child_ref = messages_ref.push()
    child_ref.set(
        {
            "id": child_ref.key,
            "documentId": docId,
            "content": response.choices[0].message.content,
            "timestamp": int(time.time()),
            "isResponse": True,
        }
    )


# @cross_origin()
# @https_fn.on_request()
# def create_chat_message(req: https_fn.Request) -> https_fn.Response:
#     if req.method != "POST":
#         return https_fn.Response("Please send POST request.", status=405)
#     if "documentId" not in req.args:
#         return https_fn.Response("Missing documentId query parameter.", status=404)
#     # For now, not checking if documentId is valid (ie real document), can change later if needed
#
#     # Convert bytes to dict
#     message = json.loads(req.data.decode("UTF-8"))
#
#     # Insert in DB
#     messages_ref = db.reference(f"chatMessages/{req.args["documentId"]}")
#
#     # Important: push empty dict or else firebase treats it as a string and not a dict
#     child_ref = messages_ref.push({})
#     child_ref.set({"id": child_ref.key,
#                    "documentId": req.args["documentId"],
#                    "content": message["content"],
#                    # https://stackoverflow.com/questions/11875770/how-can-i-overcome-datetime-datetime-not-json-serializable
#                    "timestamp": json.dumps(datetime.datetime.now(), indent=4, sort_keys=True, default=str),
#                    "isResponse": False, })
#
#     return https_fn.Response(child_ref.key)


@https_fn.on_request()
def get_all_chat_messages(req: https_fn.Request) -> https_fn.Response:
    if req.method != "GET":
        return https_fn.Response("Please send GET request.", status=405)
    if "documentId" not in req.args:
        return https_fn.Response("Missing documentId query parameter.", status=404)

    message_ref = db.reference("chatMessages/" + req.args["documentId"])
    messages = message_ref.get()

    if messages is None:
        return https_fn.Response([])

    return https_fn.Response(json.dumps(messages))


def chunk_text(text: str) -> list[str]:
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=256, chunk_overlap=20)
    return text_splitter.split_text(text)


# Return format: [(id1, embed1, meta1), (id2, embed2, meta2), ...]
def embed_and_upsert(
    documentId: str, chunked_text: list[str], batch_size: int
) -> list[tuple]:
    for i in range(0, len(chunked_text), batch_size):
        # set end position of batch
        i_end = min(i + batch_size, len(chunked_text))

        # get batch of lines and IDs
        lines_batch = chunked_text[i : i + batch_size]
        ids_batch = [str(uuid.uuid4()) for n in range(i, i_end)]

        # create embeddings
        res = client.embeddings.create(input=lines_batch, model=MODEL)
        embeds = [record.embedding for record in res.data]

        # prep metadata and upsert batch
        meta = [{"text": line, "documentId": documentId} for line in lines_batch]
        to_upsert = zip(ids_batch, embeds, meta)

        # upsert erases upserted list, so we need to make a copy. might be really inefficient? idk
        to_upsert_copy = list(zip(ids_batch, embeds, meta))

        # upsert to Pinecone
        index.upsert(vectors=list(to_upsert))

        return to_upsert_copy
