async function run() {
  const model = "gemini-embedding-2-preview";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          model: `models/${model}`,
          content: { parts: [{ text: "hello" }] }
        },
        {
          model: `models/${model}`,
          content: { parts: [{ text: "world" }] }
        }
      ]
    })
  });
  const data = await res.json();
  console.log("Response:", Object.keys(data));
  if (data.embeddings) {
    console.log("Embeddings count:", data.embeddings.length);
    console.log("First embedding dim:", data.embeddings[0].values.length);
  } else {
    console.log("Error data:", JSON.stringify(data, null, 2));
  }
}
run();
