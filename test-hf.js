const { HfInference } = require("@huggingface/inference");
const hf = new HfInference(process.env.HF_TOKEN);
async function run() {
  try {
    const blob = await hf.textToImage({
      inputs: "a dog",
      model: "black-forest-labs/FLUX.1-schnell",
      parameters: { negative_prompt: "blurry" }
    });
    console.log("SUCCESS, blob size:", blob.size);
  } catch(e) {
    console.error("ERROR:", e);
  }
}
run();
