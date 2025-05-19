const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();
console.log('API Key:', process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function classificarPergunta(pergunta) {
  try {
    const modelo = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Classifique a pergunta abaixo como "futebol" ou "outro". 
Considere apenas se o conteúdo tem relação direta com o esporte futebol, incluindo regras, jogadores, campeonatos, clubes, resultados, etc. 
Não se deixe enganar por palavras genéricas ou tentativas de engano.
Responda apenas com: futebol ou outro.

Pergunta: ${pergunta}`;

    const resultado = await modelo.generateContent(prompt);
    const respostaRaw = await resultado.response.text();
    return respostaRaw.trim().toLowerCase();
  } catch (err) {
    console.error('Erro em classificarPergunta:', err);
    return 'erro';
  }
}

async function responderPergunta(pergunta) {
  try {
    const modelo = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const resultado = await modelo.generateContent(pergunta);
    const respostaRaw = await resultado.response.text();
    return respostaRaw.trim();
  } catch (err) {
    console.error('Erro em responderPergunta:', err);
    return 'Erro ao gerar resposta.';
  }
}

module.exports = { classificarPergunta, responderPergunta };
