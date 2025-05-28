const knex = require('./knexfile');

async function inserirTimes() {
  const times = await obterTimes();
  for (const time of times) {
    try {
      await knex('teams').insert({
        name: time.team.name,
        league: time.team.league,
        wins: time.statistics.wins,
        losses: time.statistics.losses,
        draws: time.statistics.draws
      });
      console.log(`Time ${time.team.name} inserido com sucesso.`);
    } catch (error) {
      console.error(`Erro ao inserir time ${time.team.name}:`, error);
    }
  }
}
