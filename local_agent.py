import asyncio
from google.antigravity import Agent, LocalOpenAIAgentConfig

# Configure Antigravity to connect to Ollama's local OpenAI-compatible endpoint
config = LocalOpenAIAgentConfig(
    api_url="http://127.0.0.1:11434/v1",
    model_name="qwen2.5-coder:7b",
    api_key="ollama"  # Dummy key required by local SDK interface
)

async def main():
    print("\n--- Antigravity Local Agent (Ollama Offline Mode) ---\n")
    async with Agent(config) as agent:
        while True:
            try:
                user_input = input("You > ")
                if user_input.lower() in ["exit", "quit"]:
                    break
                
                print("\nAgent > ", end="", flush=True)
                response = await agent.chat(user_input)
                
                # Stream responses directly from M1 GPU
                async for token in response:
                    print(token, end="", flush=True)
                print("\n")
                
            except KeyboardInterrupt:
                break

if __name__ == "__main__":
    asyncio.run(main())
