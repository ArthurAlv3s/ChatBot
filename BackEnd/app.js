const knexdb = require('./knexfile');

// Função para listar todos os jogos
async function listarJogos() {
  try {
    const jogos = await knexdb('games').select('*');
    console.log('Jogos cadastrados:');
    console.table(jogos);
  } catch (error) {
    console.error('Erro ao listar jogos:', error);
  }
}

// Função para inserir uma nova consulta e resposta
async function registrarConsulta(userQuery, response) {
  try {
    await knexdb('queries').insert({
      user_query: userQuery,
      response: response
    });
    console.log('Consulta registrada com sucesso.');
  } catch (error) {
    console.error('Erro ao registrar consulta:', error);
  }
}

// Função para buscar estatísticas de um jogador pelo nome
async function estatisticasDoJogador(nomeJogador) {
  try {
    const stats = await knexdb('statistics')
      .join('players', 'statistics.player_id', 'players.player_id')
      .where('players.name', nomeJogador)
      .select(
        'players.name',
        'statistics.goals',
        'statistics.assists',
        'statistics.minutes_played'
      );

    if (stats.length > 0) {
      console.log(`Estatísticas do jogador ${nomeJogador}:`);
      console.table(stats);
    } else {
      console.log(`Nenhuma estatística encontrada para ${nomeJogador}`);
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
  }
}

// Executa as funções de teste
async function main() {
  await listarJogos();
  await registrarConsulta("Quem ganhou o jogo?", "O time A venceu por 2 a 1.");
  await estatisticasDoJogador("Lionel Messi"); // Substitua por um nome que exista no seu banco
  process.exit(0);
}

main();
