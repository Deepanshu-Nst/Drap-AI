const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
async function run() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What is this image about?" },
            { type: "image_url", image_url: { url: "https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/html/element/img/clock-demo-400px.png" } }
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
