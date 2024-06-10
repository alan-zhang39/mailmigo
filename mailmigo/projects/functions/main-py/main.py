# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn
from firebase_admin import initialize_app
from providers.pinecone import index

initialize_app()


@https_fn.on_request()
def on_request_example(req: https_fn.Request) -> https_fn.Response:
    return https_fn.Response("Hello world!")


@https_fn.on_request()
def pinecone_test(req: https_fn.Request) -> https_fn.Response:
    results = index.list(limit=5)
    ids = []
    for id in results:
        print(id)
        ids.append(id)
    return https_fn.Response(ids if len(ids) != 0 else "No results in index\n")
