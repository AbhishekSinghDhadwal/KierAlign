document.addEventListener('DOMContentLoaded', () => {
    console.log('Terminal controls script loaded');
    
    // Get the back buttons
    const backToMain = document.getElementById('back-to-main');
    const backToMainViz = document.getElementById('back-to-main-viz');
    
    console.log('Back buttons:', backToMain, backToMainViz);
    
    // Function to clean up visualization
    const cleanupVisualization = () => {
        console.log('Cleaning up visualization');
        
        // Clear the matrix container
        const matrixContainer = document.getElementById('matrix-container');
        if (matrixContainer) {
            matrixContainer.innerHTML = '';
        }
        
        // Clear the alignment result
        const alignmentResult = document.getElementById('alignment-result');
        if (alignmentResult) {
            alignmentResult.innerHTML = '';
        }
        
        // Remove any D3 transitions in progress
        if (window.d3) {
            d3.selectAll('*').interrupt();
        }
        
        // Close audio context if it exists
        if (window.audioContext) {
            window.audioContext.close();
            window.audioContext = null;
        }
        
        // Clear any remaining timers
        const highestTimeoutId = setTimeout(";");
        for (let i = 0; i < highestTimeoutId; i++) {
            clearTimeout(i);
        }

        // Remove any control buttons that might have been added
        // Remove individual buttons (legacy) *and* the bar container
        document.querySelectorAll('.control-button, .speed-control, .reset-button, .sequence-controls')
            .forEach(el => el.remove());

        // Reset any global variables
        window.alignmentData = null;
        window.animationSpeed = null;
    };
    
    // Function to return to main screen
    const returnToMain = () => {
        console.log('Returning to main screen');
        
        // Clean up visualization first
        cleanupVisualization();
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show landing page
        const landingPage = document.getElementById('landing-page');
        landingPage.classList.add('active');
        
        // Re-draw the floating numbers grid
        const floatingNumbers = document.getElementById('floating-numbers');
        if (floatingNumbers) {
            floatingNumbers.innerHTML = '';
            if (window.initLandingPage) {
                window.initLandingPage();
            }
        }
        
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