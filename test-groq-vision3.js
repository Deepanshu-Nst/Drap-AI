const Groq = require("groq-sdk");
const fs = require('fs');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
async function run() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What is this image about?" },
            { type: "image_url", image_url: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png" } }
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
