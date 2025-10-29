/// <reference types="cypress" />

describe('CRUD de Usuários - E2E (com data-cy)', () => {
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    cy.visit(baseUrl);
  });

  it('valida campos obrigatórios', () => {
    cy.get('[data-cy="btn-save"]').click();
    cy.get('[data-cy="msg-flash"]', { timeout: 2000 })
      .should('contain', 'Preencha nome e e-mail');
  });

  it('cria usuário e lista na tabela', () => {
    const name = 'Sidney Cypress';
    const email = `cypress_${Date.now()}@example.com`;

    cy.get('[data-cy="input-name"]').type(name);
    cy.get('[data-cy="input-email"]').type(email);
    cy.get('[data-cy="btn-save"]').click();

    cy.get('[data-cy="msg-flash"]', { timeout: 2000 })
      .should('contain', 'Usuário cadastrado com sucesso!')
      .and('have.class', 'success');

    cy.get('[data-cy="table-body"]')
      .should('contain', name)
      .and('contain', email);
  });

  it('impede email duplicado', () => {
    const name = 'Duplicado Test';
    const email = `dup_${Date.now()}@example.com`;

    cy.get('[data-cy="input-name"]').type(name);
    cy.get('[data-cy="input-email"]').type(email);
    cy.get('[data-cy="btn-save"]').click();
    cy.get('[data-cy="msg-flash"]', { timeout: 2000 })
      .should('contain', 'Usuário cadastrado com sucesso!');

    cy.get('[data-cy="input-name"]').clear();
    cy.get('[data-cy="input-email"]').clear();

    cy.get('[data-cy="input-name"]').type(name);
    cy.get('[data-cy="input-email"]').type(email);
    cy.get('[data-cy="btn-save"]').click();
    cy.get('[data-cy="msg-flash"]', { timeout: 2000 })
      .should('contain', 'email já cadastrado');
  });

  it('exclui usuário', () => {
    const name = 'Para Excluir';
    const email = `del_${Date.now()}@example.com`;

    // Cadastra
    cy.get('[data-cy="input-name"]').type(name);
    cy.get('[data-cy="input-email"]').type(email);
    cy.get('[data-cy="btn-save"]').click();
    cy.get('[data-cy="msg-flash"]', { timeout: 2000 })
      .should('contain', 'Usuário cadastrado com sucesso!');

    // === EXCLUSÃO COM DATA-CY (100% SEGURO) ===
    cy.contains('td', email)  // acha a célula com o email
      .parent('tr')           // vai pra linha
      .within(() => {
        cy.get('[data-cy="btn-delete"]').click();  // ← SÓ O BOTÃO!
      });

    cy.on('window:confirm', () => true);
    cy.get('[data-cy="msg-flash"]', { timeout: 2000 })
      .should('contain', 'Usuário excluído.');
    cy.get('[data-cy="table-body"]').should('not.contain', email);
    });
});