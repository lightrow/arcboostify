export const createInverseSepiaFilter = (sepiaAmount) => {
  // Create SVG filter to inverse sepia effect
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.style.position = 'absolute';
  svg.style.width = '0';
  svg.style.height = '0';
  svg.id = 'arcboostify-svg-filters';

  const defs = document.createElementNS(svgNS, 'defs');

  // sepia filter
  const filter = document.createElementNS(svgNS, 'filter');
  filter.id = 'arc-sepia';

  const feColorMatrix = document.createElementNS(svgNS, 'feColorMatrix');

  const s = sepiaAmount;

  /*

  sepia 100% filter:
  <svg xmlns="http://www.w3.org/2000/svg">
  <filter id="filter" color-interpolation-filters="sRGB">
    <feColorMatrix
      type="matrix"
      values=" 0.393  0.769  0.189  0.000  0.000 
               0.349  0.686  0.168  0.000  0.000 
               0.272  0.534  0.131  0.000  0.000 
               0.000  0.000  0.000  1.000  0.000">
    </feColorMatrix>
  </filter>
</svg>

   */

  // Standard sepia matrix interpolated with identity matrix
  // prettier-ignore
  const matrix = [
    1 - s * (1 - 0.393),    s * 0.769,              s * 0.189,              0, 0, // red
    s * 0.349,              1 - s * (1 - 0.686),    s * 0.168,              0, 0, // green
    s * 0.272,              s * 0.534,              1 - s * (1 - 0.131),    0, 0, // blue
    0, 0, 0, 1, 0, // alpha
  ];

  feColorMatrix.setAttribute('type', 'matrix');
  feColorMatrix.setAttribute('values', matrix.join(' '));
  filter.appendChild(feColorMatrix);
  defs.appendChild(filter);
  svg.appendChild(defs);

  // inverse sepia filter
  const filterInverse = document.createElementNS(svgNS, 'filter');
  filterInverse.id = 'arc-inverse-sepia';
  const feColorMatrixInverse = document.createElementNS(svgNS, 'feColorMatrix');

  // Calculate inverse sepia matrix
  // Standard sepia matrix: [0.393, 0.769, 0.189; 0.349, 0.686, 0.168; 0.272, 0.534, 0.131]
  // Inverse matrix calculated using matrix inversion

  // For partial sepia (0-1), we interpolate between identity and full inverse

  // prettier-ignore
  const fullInverseMatrix = [
    2.023554, -1.621092, -0.402462,
    -1.029568, 2.248103, -0.218535,
    -0.993962, -0.627004, 2.620966
  ];

  // prettier-ignore
  const invMatrix = [
    1 + s * (fullInverseMatrix[0] - 1), s * fullInverseMatrix[1], s * fullInverseMatrix[2], 0, 0, // red
    s * fullInverseMatrix[3], 1 + s * (fullInverseMatrix[4] - 1), s * fullInverseMatrix[5], 0, 0, // green  
    s * fullInverseMatrix[6], s * fullInverseMatrix[7], 1 + s * (fullInverseMatrix[8] - 1), 0, 0, // blue
    0, 0, 0, 1, 0, // alpha
  ];
  feColorMatrixInverse.setAttribute('type', 'matrix');
  feColorMatrixInverse.setAttribute('values', invMatrix.join(' '));

  filterInverse.appendChild(feColorMatrixInverse);

  defs.appendChild(filterInverse);
  svg.appendChild(defs);

  return svg;
};
