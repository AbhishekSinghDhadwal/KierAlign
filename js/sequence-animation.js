class SequenceAnimation {
    constructor(config) {
        this.containerId = config.containerId; // Store the ID instead of the element
        this.sequenceA = config.sequenceA;
        this.sequenceB = config.sequenceB;
        this.matchScore = config.matchScore || 1;
        this.mismatchScore = config.mismatchScore || -1;
        this.gapScore = config.gapScore || -2;
        
        this.currentStep = 0;
        this.steps = [];
        this.matrixVis = null;
        this.isPlaying = false;
        this.animationSpeed = config.animationSpeed || 1000;
        this.logStarted = false;
        this.blinkingInterval = null;
    }

    initialize() {
        // Create container layout
        const container = document.getElementById(this.containerId);
        container.style.display = 'flex';
        container.style.width = '100%';
        container.style.height = '100%';
        
        // Create matrix container
        const matrixContainer = document.createElement('div');
        matrixContainer.id = 'matrix-visualization';
        matrixContainer.style.width = '800px';
        matrixContainer.style.height = '600px';
        matrixContainer.style.flexShrink = '0';
        container.appendChild(matrixContainer);
        
        // Create log container
        const logContainer = document.createElement('div');
        logContainer.id = 'log-container';
        logContainer.style.flexGrow = '1';
        logContainer.style.height = '600px';
        logContainer.style.overflowY = 'auto';
        logContainer.style.padding = '20px';
        logContainer.style.color = '#6AD2A0';
        logContainer.style.fontFamily = '"IBM Plex Mono", monospace';
        logContainer.style.fontSize = '14px';
        logContainer.style.lineHeight = '1.5';
        logContainer.style.borderLeft = '1px solid #2A4A49';
        logContainer.style.marginLeft = '20px';
        
        // Add custom scrollbar styles
        logContainer.style.scrollbarWidth = 'thin';
        logContainer.style.scrollbarColor = '#6AD2A0 #02090C';
        
        // Add custom scrollbar styles for WebKit browsers
        const style = document.createElement('style');
        style.textContent = `
            #log-container::-webkit-scrollbar {
                width: 8px;
            }
            #log-container::-webkit-scrollbar-track {
                background: #02090C;
            }
            #log-container::-webkit-scrollbar-thumb {
                background-color: #6AD2A0;
                border-radius: 4px;
            }
            #log-container::-webkit-scrollbar-thumb:hover {
                background-color: #8ADDB0;
            }
        `;
        document.head.appendChild(style);
        
        container.appendChild(logContainer);
        
        // Create matrix visualization
        this.matrixVis = new MatrixVisualization({
            container: 'matrix-visualization',
            sequenceA: this.sequenceA,
            sequenceB: this.sequenceB,
            matchScore: this.matchScore,
            mismatchScore: this.mismatchScore,
            gapScore: this.gapScore,
            cellSize: 60,
            containerWidth: 800,
            containerHeight: 600,
            textColor: "#E0FBFF",
            matchColor: "#ff6b6b",
            strokeColor: "#E0FBFF"
        });

        this.matrixVis.initialize();
        this.generateSteps();

        // Build quick lookup: "i,j"  ->  {diagonal,up,left}
        this.scoreMap = {};
        this.steps.forEach(s => {
            if (s.position && s.scores) {
                const key = s.position.join(',');
                this.scoreMap[key] = s.scores;
            }
        });

        this.attachTooltipEvents();
        this.createControls();
        
        // Start with blinking ellipsis
        this.startBlinkingEllipsis();
    }

    generateSteps() {
        const m = this.sequenceA.length + 1;
        const n = this.sequenceB.length + 1;
        
        // Initialize matrix with zeros
        let matrix = Array(m).fill().map(() => Array(n).fill(0));
        
        // Step 1: Initialize first row and column
        this.steps.push({
            type: 'init',
            matrix: matrix.map(row => [...row]),
            message: 'Initializing matrix with zeros'
        });

        // Fill first row
        for (let j = 1; j < n; j++) {
            matrix[0][j] = this.gapScore * j;
            this.steps.push({
                type: 'gap',
                position: [0, j],
                matrix: matrix.map(row => [...row]),
                message: `Setting gap penalty in first row: ${matrix[0][j]}`
            });
        }

        // Fill first column
        for (let i = 1; i < m; i++) {
            matrix[i][0] = this.gapScore * i;
            this.steps.push({
                type: 'gap',
                position: [i, 0],
                matrix: matrix.map(row => [...row]),
                message: `Setting gap penalty in first column: ${matrix[i][0]}`
            });
        }

        // Fill rest of matrix
        for (let i = 1; i < m; i++) {
            for (let j = 1; j < n; j++) {
                const match = this.sequenceA[i-1] === this.sequenceB[j-1];
                const score = match ? this.matchScore : this.mismatchScore;
                
                const diagonal = matrix[i-1][j-1] + score;
                const up = matrix[i-1][j] + this.gapScore;
                const left = matrix[i][j-1] + this.gapScore;
                
                matrix[i][j] = Math.max(diagonal, up, left);
                
                this.steps.push({
                    type: match ? 'match' : 'mismatch',
                    position: [i, j],
                    scores: { diagonal, up, left },
                    matrix: matrix.map(row => [...row]),
                    message: `Calculating score for position [${i},${j}]: max(${diagonal}, ${up}, ${left}) = ${matrix[i][j]}`
                });
            }
        }
    }

    createControls() {
        // Remove stale control bar if it already exists
        document.querySelectorAll('.sequence-controls').forEach(el => el.remove());

        // Create controls container
        const controls = document.createElement('div');
        controls.className = 'sequence-controls';
        controls.style.cssText = 'display: flex; gap: 10px; align-items: center; margin-top: 20px; justify-content: center; position: absolute; bottom: 20px; left: 0; right: 0; z-index: 100;';
        
        // Create terminal-style play/pause button (left)
        const playBtn = document.createElement('button');
        playBtn.textContent = '[PLAY]';
        playBtn.onclick = () => this.togglePlay();
        playBtn.style.cssText = 'padding: 8px 16px; background: transparent; color: #6AD2A0; border: 1px solid #6AD2A0; border-radius: 0; cursor: pointer; font-family: "IBM Plex Mono", monospace; font-size: 14px; transition: all 0.3s ease;';
        playBtn.addEventListener('mouseover', () => {
            playBtn.style.backgroundColor = 'rgba(106, 210, 160, 0.1)';
            playBtn.style.boxShadow = '0 0 10px rgba(106, 210, 160, 0.5)';
        });
        playBtn.addEventListener('mouseout', () => {
            playBtn.style.backgroundColor = 'transparent';
            playBtn.style.boxShadow = 'none';
        });
        
        // Create Reset Terminal button (center)
        const resetBtn = document.createElement('button');
        resetBtn.textContent = '[RESET TERMINAL]';
        resetBtn.onclick = () => this.resetTerminal();
        resetBtn.style.cssText = 'padding: 8px 16px; background: transparent; color: #6AD2A0; border: 1px solid #6AD2A0; border-radius: 0; cursor: pointer; font-family: "IBM Plex Mono", monospace; font-size: 14px; transition: all 0.3s ease;';
        resetBtn.addEventListener('mouseover', () => {
            resetBtn.style.backgroundColor = 'rgba(106, 210, 160, 0.1)';
            resetBtn.style.boxShadow = '0 0 10px rgba(106, 210, 160, 0.5)';
        });
        resetBtn.addEventListener('mouseout', () => {
            resetBtn.style.backgroundColor = 'transparent';
            resetBtn.style.boxShadow = 'none';
        });
        
        // Speed control (right)
        const speedControl = document.createElement('select');
        speedControl.style.cssText = 'padding: 8px; background: transparent; color: #6AD2A0; border: 1px solid #6AD2A0; border-radius: 0; cursor: pointer; font-family: "IBM Plex Mono", monospace; font-size: 14px;';
        ['0.5x', '1x', '2x', '4x'].forEach(speed => {
            const option = document.createElement('option');
            option.value = speed;
            option.text = speed;
            if (speed === '1x') option.selected = true;
            speedControl.appendChild(option);
        });
        speedControl.onchange = (e) => {
            this.animationSpeed = 1000 / parseFloat(e.target.value);
        };
        
        controls.append(playBtn, resetBtn, speedControl);
        
        // Add controls to the document body
        document.body.appendChild(controls);
    }

    resetTerminal() {
        // Stop any ongoing animation
        this.isPlaying = false;
        const playBtn = document.querySelector('.sequence-controls button');
        playBtn.textContent = '[PLAY]';
        
        // Reset to initial state
        this.currentStep = 0;
        this.logStarted = false;
        
        // Clear the log container
        const logContainer = document.getElementById('log-container');
        if (logContainer) {
            logContainer.innerHTML = '';
        }
        
        // Remove any existing tooltip
        const tooltip = document.querySelector('.crt-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
        
        // Reset the matrix visualization
        this.matrixVis.initialize();
        
        // Rebuild score map and reattach tooltip events
        this.scoreMap = {};
        this.steps.forEach(s => {
            if (s.position && s.scores) {
                const key = s.position.join(',');
                this.scoreMap[key] = s.scores;
            }
        });
        this.attachTooltipEvents();
        
        // Start with blinking ellipsis
        this.startBlinkingEllipsis();
    }

    startBlinkingEllipsis() {
        const logContainer = document.getElementById('log-container');
        if (!logContainer) return;
        
        // Create blinking ellipsis element
        const ellipsisEntry = document.createElement('div');
        ellipsisEntry.className = 'log-entry';
        ellipsisEntry.style.marginBottom = '8px';
        
        // Add the "> " prefix
        const prefix = document.createElement('span');
        prefix.textContent = '> ';
        prefix.style.color = '#6AD2A0';
        ellipsisEntry.appendChild(prefix);
        
        // Add the ellipsis text
        const ellipsisText = document.createElement('span');
        ellipsisText.id = 'blinking-ellipsis';
        ellipsisText.textContent = '.';
        ellipsisEntry.appendChild(ellipsisText);
        
        // Add to log container
        logContainer.appendChild(ellipsisEntry);
        
        // Start blinking animation
        let dots = 0;
        this.blinkingInterval = setInterval(() => {
            dots = (dots + 1) % 4;
            ellipsisText.textContent = '.'.repeat(dots);
        }, 500);
    }

    stopBlinkingEllipsis() {
        if (this.blinkingInterval) {
            clearInterval(this.blinkingInterval);
            this.blinkingInterval = null;
            
            // Remove the blinking ellipsis element
            const ellipsisText = document.getElementById('blinking-ellipsis');
            if (ellipsisText) {
                const logEntry = ellipsisText.parentElement;
                if (logEntry) {
                    logEntry.remove();
                }
            }
        }
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        const playBtn = document.querySelector('.sequence-controls button');
        playBtn.textContent = this.isPlaying ? '[PAUSE]' : '[PLAY]';
        
        if (this.isPlaying) {
            // Start logging when play is pressed
            if (!this.logStarted) {
                this.logStarted = true;
                this.stopBlinkingEllipsis();
            }
            this.play();
        }
    }

    async play() {
        while (this.isPlaying && this.currentStep < this.steps.length - 1) {
            await this.nextStep();
            await new Promise(resolve => setTimeout(resolve, this.animationSpeed));
        }
        if (this.currentStep >= this.steps.length - 1) {
            this.isPlaying = false;
            const playBtn = document.querySelector('.sequence-controls button');
            playBtn.textContent = '[PLAY]';
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderStep();
        }
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.renderStep();
        }
    }

    renderStep() {
        const step = this.steps[this.currentStep];
        if (!step) return;
        
        // Update matrix visualization
        if (step.position) {
            const [i, j] = step.position;
            this.matrixVis.updateCell(i, j, step.matrix[i][j]);
            
            // Highlight current cell
            const cell = this.matrixVis.cells[i * (this.sequenceB.length + 1) + j];
            if (cell) {
                cell.rect.style('fill', step.type === 'match' ? 'rgba(255, 107, 107, 0.4)' : 'rgba(255, 107, 107, 0.2)');
            }
        }
        
        // Update message
        this.updateMessage(step.message);
    }

    updateMessage(message) {
        // Only show messages if logging has started
        if (!this.logStarted) return;
        
        const logContainer = document.getElementById('log-container');
        if (!logContainer) return;
        
        // Create a new log entry
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.style.marginBottom = '8px';
        
        // Add the "> " prefix
        const prefix = document.createElement('span');
        prefix.textContent = '> ';
        prefix.style.color = '#6AD2A0';
        logEntry.appendChild(prefix);
        
        // Add the message text container
        const messageText = document.createElement('span');
        logEntry.appendChild(messageText);
        
        // Add to log container
        logContainer.appendChild(logEntry);
        
        // Type out the message character by character
        let currentIndex = 0;
        const typeSpeed = 30; // milliseconds between each character
        
        const typeNextChar = () => {
            if (currentIndex < message.length) {
                messageText.textContent += message[currentIndex];
                currentIndex++;
                setTimeout(typeNextChar, typeSpeed);
            } else {
                // Scroll to the bottom after typing is complete
                logContainer.scrollTop = logContainer.scrollHeight;
            }
        };
        
        typeNextChar();
    }

    attachTooltipEvents() {
        // Remove any existing tooltip first
        const existingTip = document.querySelector('.crt-tooltip');
        if (existingTip) {
            existingTip.remove();
        }

        // Create new tooltip element
        const tip = document.createElement('div');
        tip.className = 'crt-tooltip';
        document.body.appendChild(tip);

        const cells = this.matrixVis.svg.selectAll('rect');

        const showTip = (event, d) => {
            const rect = d3.select(event.target);
            const i = rect.attr('data-i');
            const j = rect.attr('data-j');
            const key = `${i},${j}`;
            const scores = this.scoreMap[key];
            if (!scores) return;   // header cells, etc.

            tip.textContent =
                `diag: ${scores.diagonal}\nup:   ${scores.up}\nleft: ${scores.left}`;
            tip.style.left = event.clientX + 12 + 'px';
            tip.style.top  = event.clientY + 12 + 'px';
            tip.style.opacity = '1';
        };

        const hideTip = () => {
            tip.style.opacity = '0';
        };

        cells.on('mouseover', showTip)
             .on('mousemove', showTip)
             .on('mouseout',  hideTip);
    }
}

// Function to animate the sequences
function animateSequences(sequenceA, sequenceB, matchScore, mismatchScore, gapScore) {
    // Clear any existing content in the matrix container
    const container = document.getElementById('matrix-container');
    if (!container) {
        console.error('Matrix container not found');
        return;
    }
    
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.width = '800px';
    container.style.height = '600px';
    container.style.margin = '0 auto';
    container.style.backgroundColor = 'rgba(44, 62, 80, 0.1)';
    container.style.borderRadius = '8px';
    container.style.overflow = 'hidden';

    // Initialize the sequence animation
    const animation = new SequenceAnimation({
        containerId: 'matrix-container',
        sequenceA: sequenceA,
        sequenceB: sequenceB,
        matchScore: matchScore,
        mismatchScore: mismatchScore,
        gapScore: gapScore,
        animationSpeed: 1000
    });

    animation.initialize();
} 