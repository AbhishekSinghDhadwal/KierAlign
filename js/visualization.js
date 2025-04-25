window.initializeVisualization = function() {
    const { sequenceA, sequenceB, matchScore, mismatchScore, gapScore } = window.alignmentData;
    const nw = new NeedlemanWunsch(sequenceA, sequenceB, matchScore, mismatchScore, gapScore);
    const result = nw.calculate();

    const matrixContainer = d3.select('#matrix-container');
    matrixContainer.html('');

    // Add audio context for subtle beeps
    if (!window.audioContext) {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const playBeep = () => {
        if (!window.audioContext) return;
        const oscillator = window.audioContext.createOscillator();
        const gainNode = window.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(window.audioContext.destination);
        oscillator.frequency.value = 440;
        gainNode.gain.value = 0.1;
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, window.audioContext.currentTime + 0.1);
        oscillator.stop(window.audioContext.currentTime + 0.1);
    };

    const margin = { top: 80, right: 50, bottom: 50, left: 80 };
    const cellSize = 60; // Increased cell size
    const width = (sequenceB.length + 2) * cellSize + margin.left + margin.right;
    const height = (sequenceA.length + 2) * cellSize + margin.top + margin.bottom;

    const svg = matrixContainer
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
        .domain([...Array(sequenceB.length + 2).keys()])
        .range([0, (sequenceB.length + 2) * cellSize]);

    const y = d3.scaleBand()
        .domain([...Array(sequenceA.length + 2).keys()])
        .range([0, (sequenceA.length + 2) * cellSize]);

    // Add sequence labels with larger font
    svg.selectAll('.sequence-label-x')
        .data(['', '', ...sequenceB])
        .enter()
        .append('text')
        .text(d => d)
        .attr('x', (d, i) => x(i) + cellSize / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('fill', '#6AD2A0')
        .style('font-size', '24px');

    svg.selectAll('.sequence-label-y')
        .data(['', '', ...sequenceA])
        .enter()
        .append('text')
        .text(d => d)
        .attr('x', -20)
        .attr('y', (d, i) => y(i) + cellSize / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('fill', '#6AD2A0')
        .style('font-size', '24px');

    // Create cells with animation
    const cells = [];
    for(let i = 0; i <= sequenceA.length; i++) {
        for(let j = 0; j <= sequenceB.length; j++) {
            cells.push({
                row: i,
                col: j,
                value: result.matrix[i][j],
                direction: result.traceback[i][j],
                state: 'hidden' // hidden, calculating, or shown
            });
        }
    }

    const cellGroups = svg.selectAll('.cell')
        .data(cells)
        .enter()
        .append('g')
        .attr('class', 'cell')
        .attr('transform', d => `translate(${x(d.col)},${y(d.row)})`)
        .style('opacity', 0);

    // Add cell rectangles
    cellGroups.append('rect')
        .attr('width', cellSize - 2)
        .attr('height', cellSize - 2)
        .attr('fill', '#063F3E')
        .attr('stroke', '#6AD2A0')
        .attr('stroke-width', 1);

    // Add cell values
    cellGroups.append('text')
        .attr('class', 'cell-value')
        .text(d => d.value)
        .attr('x', cellSize / 2)
        .attr('y', cellSize / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('fill', d => d.value >= 0 ? '#6AD2A0' : '#F3AE49')
        .style('font-size', '20px');

    // Add direction indicators
    cellGroups.append('path')
        .attr('class', 'direction')
        .attr('d', d => {
            if (!d.direction) return '';
            const size = cellSize * 0.2;
            switch(d.direction) {
                case 'diagonal':
                    return `M ${cellSize * 0.2} ${cellSize * 0.2} L ${cellSize * 0.8} ${cellSize * 0.8}`;
                case 'up':
                    return `M ${cellSize/2} ${cellSize * 0.2} L ${cellSize/2} ${cellSize * 0.8}`;
                case 'left':
                    return `M ${cellSize * 0.2} ${cellSize/2} L ${cellSize * 0.8} ${cellSize/2}`;
            }
        })
        .attr('stroke', '#F3AE49')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrowhead)')
        .style('opacity', 0);

    // Add arrowhead marker
    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#F3AE49');

    // Animate matrix filling
    let delay = 0;
    const animationStep = 300;

    // Initialize first row and column
    for(let i = 0; i <= sequenceA.length; i++) {
        animateCell(i, 0, delay);
        delay += animationStep/2;
    }
    for(let j = 1; j <= sequenceB.length; j++) {
        animateCell(0, j, delay);
        delay += animationStep/2;
    }

    // Fill rest of matrix
    for(let i = 1; i <= sequenceA.length; i++) {
        for(let j = 1; j <= sequenceB.length; j++) {
            delay += animationStep;
            animateCell(i, j, delay);
        }
    }

    function animateCell(i, j, delay) {
        const cell = cellGroups.filter(d => d.row === i && d.col === j);
        
        // Highlight dependent cells
        if (i > 0 && j > 0) {
            // Highlight diagonal, up, and left cells
            cellGroups.filter(d => 
                (d.row === i-1 && d.col === j-1) ||
                (d.row === i-1 && d.col === j) ||
                (d.row === i && d.col === j-1)
            ).select('rect')
            .transition()
            .duration(animationStep/2)
            .delay(delay)
            .attr('fill', '#2A4A49');
        }

        // Show current cell
        cell.transition()
            .duration(animationStep/2)
            .delay(delay)
            .style('opacity', 1)
            .on('start', () => {
                playBeep();
            });

        // Show direction after cell appears
        cell.select('.direction')
            .transition()
            .duration(animationStep/2)
            .delay(delay + animationStep/2)
            .style('opacity', 1);

        // Reset dependent cells highlight
        if (i > 0 && j > 0) {
            cellGroups.filter(d => 
                (d.row === i-1 && d.col === j-1) ||
                (d.row === i-1 && d.col === j) ||
                (d.row === i && d.col === j-1)
            ).select('rect')
            .transition()
            .duration(animationStep/2)
            .delay(delay + animationStep)
            .attr('fill', '#063F3E');
        }
    }

    // Display alignments
    const alignmentResult = d3.select('#alignment-result');
    alignmentResult.html('');

    result.alignments.forEach((alignment, index) => {
        const alignmentDiv = alignmentResult
            .append('div')
            .style('margin-top', '20px')
            .style('font-family', 'IBM Plex Mono')
            .style('color', '#6AD2A0');

        alignmentDiv.append('div')
            .text(`Alignment ${index + 1}:`)
            .style('margin-bottom', '10px')
            .style('font-size', '18px');

        alignmentDiv.append('div')
            .text(alignment.sequenceA)
            .style('letter-spacing', '4px')
            .style('font-size', '24px');

        alignmentDiv.append('div')
            .text(alignment.sequenceB)
            .style('letter-spacing', '4px')
            .style('font-size', '24px');
    });
}; 