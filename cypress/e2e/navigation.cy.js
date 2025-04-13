describe('Navigation', () =>
{
    beforeEach(() => cy.visit('/'));

    it('navigates to image compression page', () =>
    {
        cy.contains('Image Compression').click();
        cy.url().should('include', '/image-compression.html');
        cy.contains('Image Compressor').should('be.visible');
    });
});