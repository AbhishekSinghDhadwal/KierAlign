class NeedlemanWunsch {
    constructor(sequenceA, sequenceB, matchScore, mismatchScore, gapScore) {
        this.sequenceA = sequenceA;
        this.sequenceB = sequenceB;
        this.matchScore = matchScore;
        this.mismatchScore = mismatchScore;
        this.gapScore = gapScore;
        this.matrix = [];
        this.traceback = [];
    }

    initializeMatrix() {
        const rows = this.sequenceA.length + 1;
        const cols = this.sequenceB.length + 1;

        // Initialize matrix with zeros
        this.matrix = Array(rows).fill().map(() => Array(cols).fill(0));
        this.traceback = Array(rows).fill().map(() => Array(cols).fill(null));

        // Fill first row and column with gap penalties
        for (let i = 1; i < rows; i++) {
            this.matrix[i][0] = this.gapScore * i;
            this.traceback[i][0] = 'up';
        }
        for (let j = 1; j < cols; j++) {
            this.matrix[0][j] = this.gapScore * j;
            this.traceback[0][j] = 'left';
        }
    }

    fillMatrix() {
        const rows = this.sequenceA.length + 1;
        const cols = this.sequenceB.length + 1;

        for (let i = 1; i < rows; i++) {
            for (let j = 1; j < cols; j++) {
                const match = this.sequenceA[i-1] === this.sequenceB[j-1] ? 
                    this.matchScore : this.mismatchScore;

                const diagonal = this.matrix[i-1][j-1] + match;
                const up = this.matrix[i-1][j] + this.gapScore;
                const left = this.matrix[i][j-1] + this.gapScore;

                const max = Math.max(diagonal, up, left);
                this.matrix[i][j] = max;

                // Set traceback direction
                if (max === diagonal) {
                    this.traceback[i][j] = 'diagonal';
                } else if (max === up) {
                    this.traceback[i][j] = 'up';
                } else {
                    this.traceback[i][j] = 'left';
                }
            }
        }
    }

    getAlignments() {
        const alignments = [];
        const tracePath = (i, j, alignmentA = '', alignmentB = '') => {
            if (i === 0 && j === 0) {
                alignments.push({
                    sequenceA: alignmentA.split('').reverse().join(''),
                    sequenceB: alignmentB.split('').reverse().join('')
                });
                return;
            }

            const direction = this.traceback[i][j];
            if (direction === 'diagonal') {
                tracePath(i-1, j-1, 
                    alignmentA + this.sequenceA[i-1],
                    alignmentB + this.sequenceB[j-1]
                );
            } else if (direction === 'up') {
                tracePath(i-1, j,
                    alignmentA + this.sequenceA[i-1],
                    alignmentB + '-'
                );
            } else if (direction === 'left') {
                tracePath(i, j-1,
                    alignmentA + '-',
                    alignmentB + this.sequenceB[j-1]
                );
            }
        };

        tracePath(this.sequenceA.length, this.sequenceB.length);
        return alignments;
    }

    calculate() {
        this.initializeMatrix();
        this.fillMatrix();
        return {
            matrix: this.matrix,
            traceback: this.traceback,
            alignments: this.getAlignments()
        };
    }
} 