document.addEventListener('DOMContentLoaded', () => {
    const alignButton = document.getElementById('align-sequences');
    const resetButton = document.getElementById('reset-terminal');
    
    // Handle align button click
    alignButton.addEventListener('click', () => {
        const sequenceA = document.getElementById('sequenceA').value.toUpperCase();
        const sequenceB = document.getElementById('sequenceB').value.toUpperCase();
        const matchScore = parseInt(document.getElementById('matchScore').value);
        const mismatchScore = parseInt(document.getElementById('mismatchScore').value);
        const gapScore = parseInt(document.getElementById('gapScore').value);

        // Validate inputs
        if (!sequenceA || !sequenceB) {
            alert('Please enter both sequences');
            return;
        }

        if (!/^[ACGT]+$/.test(sequenceA) || !/^[ACGT]+$/.test(sequenceB)) {
            alert('Sequences can only contain A, C, G, or T');
            return;
        }

        // Store the input values
        window.alignmentData = {
            sequenceA,
            sequenceB,
            matchScore,
            mismatchScore,
            gapScore
        };

        // Switch to visualization page
        document.getElementById('input-page').classList.remove('active');
        document.getElementById('visualization-page').classList.add('active');

        // Initialize visualization
        if (window.initializeVisualization) {
            window.initializeVisualization();
        }
    });

    // Handle reset button click
    resetButton.addEventListener('click', () => {
        // Clear all inputs
        document.getElementById('sequenceA').value = '';
        document.getElementById('sequenceB').value = '';
        document.getElementById('matchScore').value = '1';
        document.getElementById('mismatchScore').value = '-1';
        document.getElementById('gapScore').value = '-2';

        // Clear visualization
        const matrixContainer = document.getElementById('matrix-container');
        matrixContainer.innerHTML = '';
        const alignmentResult = document.getElementById('alignment-result');
        alignmentResult.innerHTML = '';

        // Switch back to input page
        document.getElementById('visualization-page').classList.remove('active');
        document.getElementById('input-page').classList.add('active');
    });

    // Add input validation
    const sequenceInputs = document.querySelectorAll('#sequenceA, #sequenceB');
    sequenceInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^ACGT]/g, '');
        });
    });
}); 