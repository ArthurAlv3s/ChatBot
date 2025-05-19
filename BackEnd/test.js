const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelo = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const resultado = await modelo.generateContent("Quem é Lionel Messi?");
    const resposta = await resultado.response.text();
    console.log("Resposta:", resposta);
  } catch (err) {
    console.error(err);
  }
}

test();
