const axios = require('axios');

async function obterTimes() {
  try {
    const response = await axios.get('https://api-football-v1.p.rapidapi.com/v3/teams', {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      }
    });
    return response.data.response;
  } catch (error) {
    console.error('Erro ao obter dados da API-Football:', error);
    return [];
  }
}
