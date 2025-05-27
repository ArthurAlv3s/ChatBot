const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();
console.log('API Key:', process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function classificarPergunta(pergunta) {
  try {
    const modelo = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Classifique a pergunta abaixo como "futebol" ou "outro".

Analise o conteúdo da pergunta e classifique como "futebol" somente se o tema principal estiver diretamente relacionado ao esporte futebol, de forma clara e significativa.

Considere como "futebol" qualquer pergunta que trate de forma direta e relevante de um ou mais dos seguintes tópicos:

Regras do jogo (incluindo arbitragem, VAR, infrações, formatos de disputa etc.);

Jogadores (carreiras, desempenho, histórico, estatísticas, rumores de transferência etc.);

Clubes e seleções (história, elenco, títulos, estrutura, torcida etc.);

Campeonatos e competições (nacionais, internacionais, amistosos, rankings etc.);

Técnicos, comissões técnicas e suas decisões;

Táticas, formações, estilos de jogo e análises técnicas;

Resultados de partidas, classificações, confrontos diretos, retrospectos etc.;

Mercado da bola, finanças de clubes, direitos de transmissão, gestão esportiva;

Eventos históricos e culturais relevantes ao futebol.

Não classifique como "futebol" se:

a menção ao futebol for superficial, irrelevante ou meramente incidental (como piadas, memes, analogias ou uso figurado);

a pergunta tratar de outro assunto (como política, música, cinema, cultura pop, etc.), ainda que cite jogadores, clubes ou termos ligados ao futebol;

houver tentativa de enganar usando nomes, palavras ou expressões relacionadas ao futebol fora de contexto real do esporte.

Importante:
Analise o contexto completo da pergunta, e não apenas a presença de palavras relacionadas ao futebol. A decisão deve considerar intenção, foco e relevância temática.

Responda apenas com uma única palavra, sem explicações:
futebol ou outro

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
