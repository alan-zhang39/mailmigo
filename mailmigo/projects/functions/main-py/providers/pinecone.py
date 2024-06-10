from pinecone import Pinecone
import os

print(os.environ.get("PINECONE_API_KEY"))

pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
index = pc.Index(os.environ.get("PINECONE_INDEX_ID") or "")
