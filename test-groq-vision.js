const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
async function run() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this image in one word." },
            { type: "image_url", image_url: { url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" } }
          ]
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct"
    });
    console.log("SUCCESS:", chatCompletion.choices[0]?.message?.content);
  } catch (err) {
    console.log("ERROR:", err.message);
  }
}
run();
