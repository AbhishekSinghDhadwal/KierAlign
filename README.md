# KierAlign

KierAlign is an interactive, web-based educational visualization tool designed to teach and demonstrate the Needleman-Wunsch algorithm, a foundational sequence alignment method widely used in bioinformatics. The application features a visually engaging interface inspired by the "Lumon Terminal Pro" from the Apple TV+ show Severance.

## Features

- Interactive sequence alignment visualization
- Dynamic matrix filling animation
- Traceback path visualization
- Multiple optimal alignment display
- Lumon Terminal Pro-inspired UI
- Real-time feedback and results

## Usage

1. Open `index.html` in your web browser
2. On the landing page, click the "[ENTER ALIGNMENT CHAMBER]" button
3. Enter your sequences and scoring parameters:
   - Sequence A: First biological sequence (e.g, A/C/G/T)
   - Sequence B: Second biological sequence (e.g, A/C/G/T)
   - Match Score: Score for matching characters (default: +1)
   - Mismatch Score: Penalty for mismatches (default: -1)
   - Gap Score: Penalty for gaps (default: -2)
4. Click "[ALIGN SEQUENCES]" to see the visualization
5. View the alignment matrix and results
6. Use the "[RESET TERMINAL]" button to start over

## Technical Details

- Built with HTML5, CSS3, and JavaScript
- Uses D3.js for visualizations and animations
- Completely client-side implementation
- No external dependencies except D3.js
- Responsive design for various screen sizes

## Color Scheme

- Primary Background: Dark teal (#063F3E)
- Highlights: Soft green (#6AD2A0), Amber (#F3AE49)
- Terminal Border: Darker teal (#2A4A49)
- Text: Light gray (#E0E0E0)

## Development

To run the project locally:

1. Clone the repository
2. Open `index.html` in your web browser
3. No build step or server required

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Inspired by the Needleman-Wunsch algorithm
- UI design inspired by the "Lumon Terminal Pro" from Severance
- Uses IBM Plex Mono font for the terminal aesthetic