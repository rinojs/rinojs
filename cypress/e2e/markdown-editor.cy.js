let createdFilePath = '';

describe('Backoffice Editor', () =>
{
    beforeEach(() =>
    {
        cy.visit('http://localhost:3100');
    });

    it('loads UI elements', () =>
    {
        cy.contains('Markdown Editor').should('be.visible');
        cy.get('#category-select').should('exist');
    });

    it('generates description', () =>
    {
        cy.get('#editor textarea').type('# This is a description test post', { force: true });
        cy.contains('✨ Generate Description').click();
        cy.get('#description').should('contain.value', 'This is a description test post');
    });

    it('can fill and save a new file, then delete it', () =>
    {
        cy.get('#title').clear().type('Cypress Test Post');
        cy.contains('🛠️ Generate File Path').click();
        cy.get('#markdown-path').invoke('val').then((filePath) =>
        {
            createdFilePath = filePath;

            cy.get('#description').clear().type('This is a test created by Cypress.');
            cy.get('#time').invoke('val', '2025-04-13T12:00');
            cy.get('#editor textarea').type('# Hello from Cypress', { force: true });
            cy.contains('Save').click();
            cy.contains('Saved!').should('be.visible');
            cy.request('DELETE', `/api/delete-markdown?path=${encodeURIComponent(createdFilePath)}`).then((res) =>
            {
                expect(res.status).to.eq(200);
            });
        });
    });
});