function initializeMatrixVisualization(containerId, sequenceA, sequenceB, matchScore, mismatchScore, gapScore) {
    // Create a new instance of MatrixVisualization
    const visualization = new MatrixVisualization({
        container: containerId,
        sequenceA: sequenceA,
        sequenceB: sequenceB,
        matchScore: matchScore,
        mismatchScore: mismatchScore,
        gapScore: gapScore,
        cellSize: 80,
        containerWidth: 1200,
        containerHeight: 1000,
        textColor: "#E0FBFF",
        matchColor: "#ff6b6b",
        strokeColor: "#E0FBFF"
    });

    // Initialize and render the visualization
    visualization.initialize();
    visualization.render();

    return visualization;
} 