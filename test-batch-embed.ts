async function run() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    models?: Array<{ name: string; supportedGenerationMethods?: string[] }>;
  };
  const embedModels = (data.models || []).filter((m) =>
    m.supportedGenerationMethods?.some((method) => method.toLowerCase().includes('embed'))
  );
  console.log(
    "Available embedding models:",
    embedModels.map((m) => `${m.name} (${m.supportedGenerationMethods?.join(', ')})`)
  );
}
run();
