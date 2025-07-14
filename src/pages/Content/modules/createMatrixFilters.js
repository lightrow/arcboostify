// Matrix operations for 5x5 color transform matrices
const Matrix = {
  identity() {
    return [
      [1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1],
    ];
  },

  multiply(m1, m2) {
    const result = [];
    for (let i = 0; i < 5; i++) {
      result[i] = [];
      for (let j = 0; j < 5; j++) {
        let sum = 0;
        for (let k = 0; k < 5; k++) {
          sum += m1[i][k] * m2[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  },

  add(m1, m2) {
    const result = [];
    for (let i = 0; i < 5; i++) {
      result[i] = [];
      for (let j = 0; j < 5; j++) {
        result[i][j] = m1[i][j] + m2[i][j];
      }
    }
    return result;
  },

  // Calculate matrix inverse using Gaussian elimination
  inverse(matrix) {
    const n = 5;
    const augmented = [];

    // Create augmented matrix [A|I]
    for (let i = 0; i < n; i++) {
      augmented[i] = [];
      for (let j = 0; j < n; j++) {
        augmented[i][j] = matrix[i][j];
      }
      for (let j = n; j < 2 * n; j++) {
        augmented[i][j] = j - n === i ? 1 : 0;
      }
    }

    // Gaussian elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }

      // Swap rows
      if (maxRow !== i) {
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      }

      // Check if matrix is singular
      if (Math.abs(augmented[i][i]) < 1e-10) {
        console.warn('Matrix is singular, using identity matrix');
        return this.identity();
      }

      // Scale row to make pivot 1
      const pivot = augmented[i][i];
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot;
      }

      // Eliminate column
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i];
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
      }
    }

    // Extract inverse matrix
    const inverse = [];
    for (let i = 0; i < n; i++) {
      inverse[i] = [];
      for (let j = 0; j < n; j++) {
        inverse[i][j] = augmented[i][j + n];
      }
    }

    return inverse;
  },

  // Filter matrices
  brightness(v) {
    v = Number(v);
    return [
      [v, 0, 0, 0, 0],
      [0, v, 0, 0, 0],
      [0, 0, v, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1],
    ];
  },

  contrast(v) {
    v = Number(v);
    const t = (1 - v) / 2;
    return [
      [v, 0, 0, 0, t],
      [0, v, 0, 0, t],
      [0, 0, v, 0, t],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1],
    ];
  },

  saturation(v) {
    v = Number(v);

    if (Math.abs(v - 1) < 1e-6) {
      return this.identity();
    }

    const lumR = 1 / 3;
    const lumG = 1 / 3;
    const lumB = 1 / 3;

    const sr = (1 - v) * lumR;
    const sg = (1 - v) * lumG;
    const sb = (1 - v) * lumB;

    return [
      [sr + v, sr, sr, 0, 0],
      [sg, sg + v, sg, 0, 0],
      [sb, sb, sb + v, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1],
    ];
  },

  hueRotate(angle) {
    angle = Number(angle);

    // Handle edge case: when angle is 0, return identity matrix
    if (Math.abs(angle) < 1e-6) {
      return this.identity();
    }

    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Hue rotation matrix that preserves neutral colors
    // This ensures whites, grays, and blacks stay neutral
    return [
      [
        cos + (1 - cos) / 3,
        (1 - cos) / 3 - sin / Math.sqrt(3),
        (1 - cos) / 3 + sin / Math.sqrt(3),
        0,
        0,
      ],
      [
        (1 - cos) / 3 + sin / Math.sqrt(3),
        cos + (1 - cos) / 3,
        (1 - cos) / 3 - sin / Math.sqrt(3),
        0,
        0,
      ],
      [
        (1 - cos) / 3 - sin / Math.sqrt(3),
        (1 - cos) / 3 + sin / Math.sqrt(3),
        cos + (1 - cos) / 3,
        0,
        0,
      ],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1],
    ];
  },

  tint(tint) {
    // Parse the tint color (supports hex, rgb, rgba)
    let { r, g, b, a: intensity } = tint;
    // normalize to 0-1
    r = r / 255;
    g = g / 255;
    b = b / 255;

    // Create a saturation-aware tint matrix that preserves neutral colors
    // This reduces tint intensity to preserve neutrals without adding brightness
    const neutralPreservation = 1; // How much to preserve neutrals (0-1)

    // Adjust intensity based on neutral preservation
    const adjustedIntensity = intensity * (1 - neutralPreservation * 0.3);

    const result = [];
    for (let i = 0; i < 5; i++) {
      result[i] = [];
      for (let j = 0; j < 5; j++) {
        if (i < 3 && j < 3) {
          if (i === j) {
            // Diagonal elements: blend between identity and tint color
            const tintColor = i === 0 ? r : i === 1 ? g : b;
            result[i][j] =
              1 - adjustedIntensity + adjustedIntensity * tintColor;
          } else {
            // Off-diagonal elements: very minimal cross-channel mixing
            result[i][j] = 0;
          }
        } else {
          // For alpha and offset channels, keep identity values
          result[i][j] = i === j ? 1 : 0;
        }
      }
    }

    return result;
  },
};

export const createMatrixFilters = (stateForDomain) => {
  // Start with identity matrix

  let combinedMatrix = Matrix.identity();

  // Apply each filter by multiplying matrices in REVERSE order
  // This ensures transformations are applied in the correct sequence]

  const hueMatrix = Matrix.hueRotate(stateForDomain.hue);
  const tintMatrix = Matrix.tint(stateForDomain.tint);
  const contrastMatrix = Matrix.contrast(stateForDomain.contrast);
  const brightnessMatrix = Matrix.brightness(stateForDomain.brightness);
  const saturationMatrix = Matrix.saturation(stateForDomain.saturation);

  // Add a brightness boost specifically for tint compensation
  const tintBrightnessBoost = Matrix.brightness(
    1 + stateForDomain.tint.a * 0.5
  ); // Adjust this value as needed

  combinedMatrix = Matrix.multiply(saturationMatrix, combinedMatrix);
  combinedMatrix = Matrix.multiply(brightnessMatrix, combinedMatrix);
  combinedMatrix = Matrix.multiply(contrastMatrix, combinedMatrix);
  combinedMatrix = Matrix.multiply(hueMatrix, combinedMatrix);
  combinedMatrix = Matrix.multiply(tintMatrix, combinedMatrix);
  combinedMatrix = Matrix.multiply(tintBrightnessBoost, combinedMatrix); // Add boost after tint

  // Convert matrices to SVG filter format (4x5 matrix = 20 values)
  const matrixToSVG = (matrix) => {
    return [
      matrix[0][0],
      matrix[0][1],
      matrix[0][2],
      matrix[0][3],
      matrix[0][4],
      matrix[1][0],
      matrix[1][1],
      matrix[1][2],
      matrix[1][3],
      matrix[1][4],
      matrix[2][0],
      matrix[2][1],
      matrix[2][2],
      matrix[2][3],
      matrix[2][4],
      matrix[3][0],
      matrix[3][1],
      matrix[3][2],
      matrix[3][3],
      matrix[3][4],
    ].join(' ');
  };

  // Create SVG filter
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.style.position = 'absolute';
  svg.style.width = '0';
  svg.style.height = '0';
  svg.id = 'arcboostify-svg-filters';

  const defs = document.createElementNS(svgNS, 'defs');

  defs.innerHTML = `
  <filter id="arc-combined-filter" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values="${matrixToSVG(combinedMatrix)}" />
  </filter>
  <filter id="arc-inverse-combined-filter" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values="${matrixToSVG(
        Matrix.inverse(combinedMatrix)
      )}" />
  </filter>
  `;

  svg.appendChild(defs);

  return svg;
};
