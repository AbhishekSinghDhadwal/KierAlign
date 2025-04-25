document.addEventListener('DOMContentLoaded', () => {
    const alignButton = document.getElementById('align-sequences');
    const resetButton = document.getElementById('reset-terminal');
    const sequenceAInput = document.getElementById('sequenceA');
    const sequenceBInput = document.getElementById('sequenceB');
    const matchScoreInput = document.getElementById('matchScore');
    const mismatchScoreInput = document.getElementById('mismatchScore');
    const gapScoreInput = document.getElementById('gapScore');
    
    // Handle align button click
    alignButton.addEventListener('click', () => {
        const sequenceA = sequenceAInput.value.toUpperCase();
        const sequenceB = sequenceBInput.value.toUpperCase();
        const matchScore = parseInt(matchScoreInput.value);
        const mismatchScore = parseInt(mismatchScoreInput.value);
        const gapScore = parseInt(gapScoreInput.value);

        // Validate inputs
        if (!sequenceA || !sequenceB) {
            alert('Please enter both sequences');
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

        // Clear floating numbers
        const floatingNumbers = document.getElementById('floating-numbers');
        if (floatingNumbers) {
            floatingNumbers.innerHTML = '';
        }

        // Hide input page and show visualization page
        document.getElementById('input-page').classList.remove('active');
        document.getElementById('visualization-page').classList.add('active');

        // Animate the sequences
        animateSequences(sequenceA, sequenceB, matchScore, mismatchScore, gapScore);

        // TODO: Add matrix calculation and visualization after sequence animation
    });

    // Handle reset button click
    resetButton.addEventListener('click', () => {
        // Clear all inputs
        sequenceAInput.value = '';
        sequenceBInput.value = '';
        matchScoreInput.value = '1';
        mismatchScoreInput.value = '-1';
        gapScoreInput.value = '-2';

        // Clear visualization
        const matrixContainer = document.getElementById('matrix-container');
        matrixContainer.innerHTML = '';
        const alignmentResult = document.getElementById('alignment-result');
        alignmentResult.innerHTML = '';

        // Switch back to input page
        document.getElementById('visualization-page').classList.remove('active');
        document.getElementById('input-page').classList.add('active');
    });

    // Add input formatting (just uppercase conversion)
    const sequenceInputs = document.querySelectorAll('#sequenceA, #sequenceB');
    sequenceInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    });
}); 