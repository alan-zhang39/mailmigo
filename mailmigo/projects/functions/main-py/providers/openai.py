from openai import OpenAI
import os

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
MODEL = "text-embedding-3-small"
# response = client.embeddings.create(
#     input="Your text string goes here", model="text-embedding-3-small"
# )
