document.addEventListener('DOMContentLoaded', () => {
    console.log('Terminal controls script loaded');
    
    // Get the back buttons
    const backToMain = document.getElementById('back-to-main');
    const backToMainViz = document.getElementById('back-to-main-viz');
    
    console.log('Back buttons:', backToMain, backToMainViz);
    
    // Function to return to main screen
    const returnToMain = () => {
        console.log('Returning to main screen');
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show landing page
        const landingPage = document.getElementById('landing-page');
        landingPage.classList.add('active');
        
        console.log('Landing page active:', landingPage.classList.contains('active'));
    };
    
    // Add click handlers
    if (backToMain) {
        backToMain.addEventListener('click', (e) => {
            console.log('Back to main clicked');
            e.preventDefault();
            returnToMain();
        });
    }
    
    if (backToMainViz) {
        backToMainViz.addEventListener('click', (e) => {
            console.log('Back to main viz clicked');
            e.preventDefault();
            returnToMain();
        });
    }
}); 