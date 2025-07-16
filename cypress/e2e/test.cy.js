describe('Fluxo de registro, login e pergunta', () => {
  const email = `guerreirogamer08@gmail.com`;
  const senha = 'cassio';

  it('Deve logar com o usuário recém-criado', () => {
    // Página de login
    cy.visit('frontend/login.html');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(senha);
    cy.get('#entrada').click();
  });

  it('Deve fazer uma pergunta no chat', () => {
    // Página do chat
    cy.visit('frontend/index.html');
    cy.get('#mensagem').type('Qual o placar do jogo?');
    cy.get('.enviar').click();
  });
});
