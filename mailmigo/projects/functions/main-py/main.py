# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn, db_fn
from firebase_admin import initialize_app
from providers.pinecone import index
from providers.openai import client, MODEL
from langchain.text_splitter import RecursiveCharacterTextSplitter
import uuid

initialize_app()


@https_fn.on_request()
def on_request_example(req: https_fn.Request) -> https_fn.Response:
    return https_fn.Response("Hello world!")


@https_fn.on_request()
def pinecone_test(req: https_fn.Request) -> https_fn.Response:
    results = list(index.list())
    print("first 5 ids:", [results[0][i] for i in range(0, 5)])
    return https_fn.Response(results[0] if len(results[0]) != 0 else "No results in index\n")


# export interface Transcription {
#   id: string;
#   uid: string;
#   orgId: string;
#   documentId: string;
#   content: string;
#   createdOn: number;
# }

@db_fn.on_value_written(reference="/transcriptions/{orgId}/{uid}/{documentId}")
# Get transcription content -> chunk content -> embed content -> upsert into Pinecone index
def on_transcription_upload(event: db_fn.Event[db_fn.Change]) -> None:
    # transcription was deleted
    if event.data.after is None:
        return

    before = event.data.before
    after = event.data.after

    # transcription was updated. diff before and after for new child
    if event.data.before is not None:
        transcription = {k: after[k] for k in set(after) - set(before)}.values()
    else:
        transcription = event.data.after.values()

    # remove key; get transcription object; get content
    content = next(iter(transcription))["content"]
    chunked_text = chunk_text(content)
    embed_and_upsert(chunked_text, 32)


def chunk_text(text: str) -> list[str]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=256,
        chunk_overlap=20
    )
    return text_splitter.split_text(text)


def embed_and_upsert(chunked_text: list[str], batch_size: int):
    for i in range(0, len(chunked_text), batch_size):
        # set end position of batch
        i_end = min(i + batch_size, len(chunked_text))

        # get batch of lines and IDs
        lines_batch = chunked_text[i: i + batch_size]
        ids_batch = [str(uuid.uuid4()) for n in range(i, i_end)]

        # create embeddings
        res = client.embeddings.create(input=lines_batch, model=MODEL)
        embeds = [record.embedding for record in res.data]

        # prep metadata and upsert batch
        meta = [{'text': line} for line in lines_batch]
        to_upsert = zip(ids_batch, embeds, meta)

        # upsert to Pinecone
        index.upsert(vectors=list(to_upsert))
