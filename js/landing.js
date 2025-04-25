//---------------------------------------------------------------------------
/**
 * Draws / re-draws the floating-number backdrop and button behaviour
 * for the KierAlign landing screen.
 * Can be called multiple times (after page reset) without side-effects.
 */
function initLandingPage() {
    // Stop the old animation loop, if one exists
    if (window._floatingNumbersRAF) {
        cancelAnimationFrame(window._floatingNumbersRAF);
        window._floatingNumbersRAF = null;
    }

    const floatingNumbersSel = d3.select('#floating-numbers');

    // wipe any previous run
    floatingNumbersSel.selectAll('*').remove();

    const enterButton   = document.getElementById('enter-chamber');
    const width  = window.innerWidth;
    const height = window.innerHeight;
    const buttonArea = enterButton.getBoundingClientRect();

    // ---------- number grid setup (original code, unmodified) ------------
    const gridSize = 110;
    const columns  = Math.ceil(width / gridSize);
    const rows     = Math.ceil(height / gridSize);

    const numbers = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const x = col * gridSize + gridSize / 2;
            const y = row * gridSize + gridSize / 2;
            if (
                !(y > buttonArea.top - 50 && y < buttonArea.bottom + 50 &&
                  x > buttonArea.left - 50 && x < buttonArea.right + 50)
            ) {
                numbers.push({
                    value : Math.floor(Math.random() * 10),
                    x, y,
                    baseX : x,
                    baseY : y,
                    angle : Math.random() * Math.PI * 2,
                    speed : 0.02 + Math.random() * 0.02,
                    radius: 2 + Math.random() * 2
                });
            }
        }
    }

    const svg = floatingNumbersSel
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    // ---- defs, glow, number <text> elements  (original code) -----------
    const defs   = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '2').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const numberElements = svg.selectAll('text')
        .data(numbers)
        .enter()
        .append('text')
        .text(d => d.value)
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#EAFEFC')
        .style('font-family', 'IBM Plex Mono')
        .style('font-size', '24px')
        .style('opacity', 0.7)
        .style('filter', 'url(#glow)')
        .style('cursor', 'pointer')
        .style('transition', 'all 0.3s ease');

    // ---------------- hover / shift-key scaling (original code) ----------
    let isShiftPressed = false;
    window.addEventListener('keydown', (e) => { if (e.key === 'Shift') isShiftPressed = true; });
    window.addEventListener('keyup',   (e) => {
        if (e.key === 'Shift') {
            isShiftPressed = false;
            numberElements.style('font-size', '24px').style('opacity', 0.7);
        }
    });

    function scaleNumbersByDistance(mouseX, mouseY) {
        const maxDistance = 300;
        numberElements.each(function(d) {
            const element  = d3.select(this);
            const distance = Math.hypot(d.x - mouseX, d.y - mouseY);
            if (distance < maxDistance) {
                const scale    = 1 + (1 - distance / maxDistance) * 0.5;
                const fontSize = Math.floor(24 * scale);
                element.style('font-size', `${fontSize}px`)
                       .style('opacity', 0.7 + (1 - distance / maxDistance) * 0.3);
            } else {
                element.style('font-size', '24px').style('opacity', 0.7);
            }
        });
    }

    numberElements.each(function() {
        d3.select(this)
            .on('mouseover', function(event) {
                if (isShiftPressed) {
                    scaleNumbersByDistance(event.clientX, event.clientY);
                } else {
                    d3.select(this).style('font-size', '50px').style('opacity', 1);
                }
            })
            .on('mousemove', function(event) {
                if (isShiftPressed) scaleNumbersByDistance(event.clientX, event.clientY);
            })
            .on('mouseout', function() {
                if (!isShiftPressed) d3.select(this).style('font-size', '24px').style('opacity', 0.7);
            });
    });

    // ---------------- subtle motion animation (original code) -----------
    function animate() {
        numbers.forEach(d => {
            d.angle += d.speed;
            d.x = d.baseX + Math.cos(d.angle) * d.radius;
            d.y = d.baseY + Math.sin(d.angle) * d.radius;
        });
        numberElements.attr('x', d => d.x).attr('y', d => d.y);
        window._floatingNumbersRAF = requestAnimationFrame(animate);
    }
    animate();

    // ------------- landing → input page transition ----------------------
    enterButton.addEventListener('click', () => {
        document.getElementById('landing-page').classList.remove('active');
        document.getElementById('input-page').classList.add('active');
    });
}

// Expose for re-use elsewhere
window.initLandingPage = initLandingPage;

// Initialise immediately (first visit)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLandingPage);
} else {
    initLandingPage();
}

// Add global resize handler (only once)
if (!window._kieralignResizeHandler) {
    window.addEventListener('resize', () => {
        // Only rebuild if we're *currently* on the landing page
        const landing = document.getElementById('landing-page');
        if (landing && landing.classList.contains('active')) {
            window.initLandingPage();
        }
    });
    window._kieralignResizeHandler = true;
}
//--------------------------------------------------------------------------- 