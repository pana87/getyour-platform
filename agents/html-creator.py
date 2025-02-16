from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel
from dotenv import load_dotenv
import sys
import os

load_dotenv()
alias = sys.argv[1]
path = sys.argv[2]
lang = sys.argv[3]
html = sys.stdin.read()

model = OpenAIModel(
    os.getenv("LLM_MODEL"),
    base_url = os.getenv("BASE_URL"),
    api_key = os.getenv("API_KEY"),
)
agent = Agent(
    model,
    system_prompt =(
        "Here is the information you need to create the content: "
        f"URL path: {path}, Alias: {alias}, HTML: {html}, Language: {lang}"
    ),
    retries = 2
)

prompt = """
    "You are a creative HTML content creator. Your sole task is to extend the HTML code provided to you with useful and grammatically correct content. "
    "You should never remove any existing HTML, but only add to it. "
    Your output should start with <!DOCTYPE html> and end with </html>
    "Your output should be in valid HTML code and should be written in a mobile-first design. "
    Dont output your thinking 
    "Be creative and innovative in your design choices. "
    Never create inline scripts, remove them if you find any
    check whether the content corresponds to the alias, url path and language and change accordingly
    "Don't wrap the html"
    "Don't explain anything"
    "Don't talk to anybody"
"""
result = agent.run_sync(prompt)
sys.stdout.write(result.data)
