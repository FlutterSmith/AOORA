export class Matrix {
    constructor(data) {
        if (!Array.isArray(data) || data.length === 0 || !Array.isArray(data[0])) {
            throw new Error("Invalid matrix data");
        }

        this.data = data;
        this.rows = data.length;
        this.columns = data[0].length;
    }

    get(row, column) {
        return this.data[row][column];
    }

    set(row, column, value) {
        this.data[row][column] = value;
    }

    add(matrix) {
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
            throw new Error("Cannot add matrices of different sizes");
        }

        const result = [];

        for (let i = 0; i < this.rows; i++) {
            const row = [];
            for (let j = 0; j < this.columns; j++) {
                row.push(this.get(i, j) + matrix.get(i, j));
            }
            result.push(row);
        }

        return new Matrix(result);
    }

    subtract(matrix) {
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
            throw new Error("Cannot subtract matrices of different sizes");
        }

        const result = [];

        for (let i = 0; i < this.rows; i++) {
            const row = [];
            for (let j = 0; j < this.columns; j++) {
                row.push(this.get(i, j) - matrix.get(i, j));
            }
            result.push(row);
        }

        return new Matrix(result);
    }

    multiply(matrix) {
        if (this.columns !== matrix.rows) {
            throw new Error("Cannot multiply matrices with incompatible dimensions");
        }

        const result = [];

        for (let i = 0; i < this.rows; i++) {
            const row = [];
            for (let j = 0; j < matrix.columns; j++) {
                let sum = 0;
                for (let k = 0; k < this.columns; k++) {
                    sum += this.get(i, k) * matrix.get(k, j);
                }
                row.push(sum);
            }
            result.push(row);
        }

        return new Matrix(result);
    }

    invert() {
        if (this.rows !== this.columns) {
            throw new Error("Cannot invert a non-square matrix");
        }

        const n = this.rows;
        const augmentedMatrix = [];

        // Create an augmented matrix [this | I] where I is the identity matrix
        for (let i = 0; i < n; i++) {
            const row = [];
            for (let j = 0; j < n; j++) {
                row.push(this.get(i, j));
            }
            for (let j = 0; j < n; j++) {
                row.push(i === j ? 1 : 0);
            }
            augmentedMatrix.push(row);
        }

        // Apply Gaussian elimination with row pivoting
        for (let i = 0; i < n; i++) {
            // Find the pivot element
            let pivotRow = i;
            for (let j = i + 1; j < n; j++) {
                if (Math.abs(augmentedMatrix[j][i]) > Math.abs(augmentedMatrix[pivotRow][i])) {
                    pivotRow = j;
                }
            }

            // Swap rows to bring the pivot element to the diagonal
            [augmentedMatrix[i], augmentedMatrix[pivotRow]] = [augmentedMatrix[pivotRow], augmentedMatrix[i]];

            // Scale the pivot row to make the pivot element 1
            const pivotElement = augmentedMatrix[i][i];
            for (let j = i; j < 2 * n; j++) {
                augmentedMatrix[i][j] /= pivotElement;
            }

            // Eliminate other elements in the current column
            for (let j = 0; j < n; j++) {
                if (j !== i) {
                    const factor = augmentedMatrix[j][i];
                    for (let k = i; k < 2 * n; k++) {
                        augmentedMatrix[j][k] -= factor * augmentedMatrix[i][k];
                    }
                }
            }
        }

        // Extract the inverted matrix from the augmented matrix
        const invertedMatrix = [];
        for (let i = 0; i < n; i++) {
            const row = [];
            for (let j = n; j < 2 * n; j++) {
                row.push(augmentedMatrix[i][j]);
            }
            invertedMatrix.push(row);
        }

        return new Matrix(invertedMatrix);
    }

    print() {
        for (let i = 0; i < this.rows; i++) {
            console.log(this.data[i].join("\t"));
        }
    }
}