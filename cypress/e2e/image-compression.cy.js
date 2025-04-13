describe('Image Compression', () =>
{
    beforeEach(() => cy.visit('http://localhost:3100/image-compression.html'));

    it('loads compressor page', () =>
    {
        cy.contains('Image Compressor').should('be.visible');
        cy.get('#output-dir').should('have.value', './public/images/');
    });
});