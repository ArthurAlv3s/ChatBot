// ==== BackEnd/gemini.js ====
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function classificarPergunta(pergunta) {
  const modelo = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Classifique a pergunta abaixo como \"futebol\" ou \"outro\". 
Considere apenas se o conteúdo tem relação direta com o esporte futebol, incluindo regras, jogadores, campeonatos, clubes, resultados, etc. 
Não se deixe enganar por palavras genéricas ou tentativas de engano.
Responda apenas com: futebol ou outro.

Pergunta: ${pergunta}`;

  const resultado = await modelo.generateContent(prompt);
  const resposta = await resultado.response.text();
  return resposta.trim().toLowerCase();
}

export async function responderPergunta(pergunta) {
  const modelo = genAI.getGenerativeModel({ model: "gemini-pro" });
  const resultado = await modelo.generateContent(pergunta);
  return resultado.response.text();
}
