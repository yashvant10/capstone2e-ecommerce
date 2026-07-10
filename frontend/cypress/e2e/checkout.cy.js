describe('Checkout Flow', () => {
  it('allows user to login, add to cart, and proceed to checkout', () => {
    // Visit login
    cy.visit('http://localhost:5173/login');
    
    // Login as Customer
    cy.get('input[type="email"]').type('customer@stockroom.com');
    cy.get('input[type="password"]').type('Customer@123');
    cy.get('button[type="submit"]').click();
    
    // Wait for redirect to products
    cy.url().should('include', '/products');
    
    // Verify products are loaded
    cy.contains('The Stockroom Collection').should('be.visible');
    
    // Add first item to cart
    cy.get('button').contains('Add').first().click();
    
    // Go to cart
    cy.visit('http://localhost:5173/cart');
    
    // Verify item is in cart
    cy.contains('Order Summary').should('be.visible');
    
    // Proceed to checkout button exists (won't actually click to avoid real Razorpay trigger in automated tests without mocks, but we verify it's there)
    cy.get('button').contains('Pay with Razorpay').should('be.visible');
  });
});
