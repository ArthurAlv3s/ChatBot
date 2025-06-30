const axios = require('axios');

async function obterTimes() {
  try {
    const response = await axios.get('https://api-football-v1.p.rapidapi.com/v3/teams', {
      headers: {
        'X-RapidAPI-Key': '12b4a3162005f39e0132f693e3db49da',
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error('Erro ao obter dados da API-Football:', error.response?.data || error.message);
  }
}

obterTimes();
