window.SURPRISE_AI = window.SURPRISE_AI || {};

window.SURPRISE_AI.generateGeminiResponse = async function (
  prompt,
  options = {},
) {
  const maxOutputTokens = options.maxOutputTokens || 120;
  const temperature = options.temperature || 0.75;
  const timeoutMs = options.timeoutMs || 20000;
  const retries = Number.isInteger(options.retries) ? options.retries : 1;

  if (!window.GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured.");
  }

  if (!window.GEMINI_MODEL) {
    throw new Error("Gemini model not configured.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${window.GEMINI_MODEL}:generateContent`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: temperature,
      maxOutputTokens: maxOutputTokens,
    },
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": window.GEMINI_API_KEY,
        },

        body: JSON.stringify(requestBody),

        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await response.json();

      console.log("Gemini Response:", data);

      if (!response.ok) {
        throw new Error(
          `Gemini API Error ${response.status}\n\n${JSON.stringify(data, null, 2)}`,
        );
      }

      if (data.error) {
        throw new Error(data.error.message);
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error(
          "Gemini returned no text.\n\n" + JSON.stringify(data, null, 2),
        );
      }

      return text.trim();
    } catch (error) {
      clearTimeout(timeout);

      console.error("Gemini Error:", error);

      if (attempt === retries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};
