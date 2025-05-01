document.addEventListener('DOMContentLoaded', () => {
    const alignButton = document.getElementById('align-sequences');
    const resetButton = document.getElementById('reset-terminal');
    const sequenceAInput = document.getElementById('sequenceA');
    const sequenceBInput = document.getElementById('sequenceB');
    const matchScoreInput = document.getElementById('matchScore');
    const mismatchScoreInput = document.getElementById('mismatchScore');
    const gapScoreInput = document.getElementById('gapScore');
    
    // Validation helpers
    const validateSequence = (seq) => {
        const validSeqRegex = /^[a-zA-Z]+$/;
        return validSeqRegex.test(seq);
    };

    const validateScore = (score) => {
        return !isNaN(score) && score !== '';
    };

    const showToast = (message) => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    const validateForm = () => {
        const sequenceA = document.getElementById('sequenceA').value.trim();
        const sequenceB = document.getElementById('sequenceB').value.trim();
        const matchScore = document.getElementById('matchScore').value;
        const mismatchScore = document.getElementById('mismatchScore').value;
        const gapScore = document.getElementById('gapScore').value;
        const alignButton = document.getElementById('align-sequences');

        let isValid = true;
        let errorMessage = '';

        // Validate sequences
        if (!validateSequence(sequenceA)) {
            isValid = false;
            errorMessage = 'Sequence A must contain only letters';
        } else if (!validateSequence(sequenceB)) {
            isValid = false;
            errorMessage = 'Sequence B must contain only letters';
        }
        // Validate scores
        else if (!validateScore(matchScore)) {
            isValid = false;
            errorMessage = 'Match score must be a number';
        } else if (!validateScore(mismatchScore)) {
            isValid = false;
            errorMessage = 'Mismatch score must be a number';
        } else if (!validateScore(gapScore)) {
            isValid = false;
            errorMessage = 'Gap score must be a number';
        }

        // Update button state and show error if needed
        alignButton.disabled = !isValid;
        if (!isValid && errorMessage) {
            showToast(errorMessage);
        }

        return isValid;
    };

    // Handle align button click
    alignButton.addEventListener('click', () => {
        const sequenceA = sequenceAInput.value.toUpperCase();
        const sequenceB = sequenceBInput.value.toUpperCase();
        const matchScore = parseInt(matchScoreInput.value);
        const mismatchScore = parseInt(mismatchScoreInput.value);
        const gapScore = parseInt(gapScoreInput.value);

        // Validate inputs
        if (!validateForm()) {
            showToast('SYNTAX ERR :: INVALID SEQUENCE OR EMPTY SCORE');
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

    // Add event listeners for validation
    document.getElementById('sequenceA').addEventListener('input', validateForm);
    document.getElementById('sequenceB').addEventListener('input', validateForm);
    document.getElementById('matchScore').addEventListener('input', validateForm);
    document.getElementById('mismatchScore').addEventListener('input', validateForm);
    document.getElementById('gapScore').addEventListener('input', validateForm);

    // Initial validation
    validateForm();
}); 