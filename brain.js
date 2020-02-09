/******************************************************************************
Brain (Neural Network)
******************************************************************************/

const brainMutationRate = 0.075;
const brainMutationAmount = 0.05;
const startScore = 1;

class Brain {
	constructor(inputCount, hiddenCount, outputCount) {
		this.inputNodes = inputCount;
		this.hiddenNodes = hiddenCount;
		this.outputNodes = outputCount;
		this.weightsHidden = new Matrix(this.hiddenNodes, this.inputNodes);
		this.weightsOutput = new Matrix(this.outputNodes, this.hiddenNodes);
		this.biasHidden = new Matrix(this.hiddenNodes, 1);
		this.biasOutput = new Matrix(this.outputNodes, 1);
		this.score = startScore;
		this.fitness = 0;
	};
	predict(inputArray) {
		let inputMatrix = Matrix.fromArray(inputArray);
		let hidden = Matrix.product(this.weightsHidden, inputMatrix);
		hidden.add(this.biasHidden);
		hidden.map(Brain.sigmoid);
		let output = Matrix.product(this.weightsOutput, hidden);
		output.add(this.biasOutput);
		output.map(Brain.sigmoid);//remove this and outputs can be -1 to 1 (or more)
		return Matrix.toArray(output);
	};
	static sigmoid(x) {
		return 1 / (1 + Math.exp(-x));
	};
	// GA Functions
	static mutateLayer(layer) {
		for (let y = 0; y < layer.rows; y++) {
			for (let x = 0; x < layer.cols; x++) {
				let chance = Math.random();
				if (chance < brainMutationRate * 0.01) {
					//critical mutation
					layer.data[y][x] = (Math.random() * 2) - 1;
				} else if (Math.random() < brainMutationRate) {
					layer.data[y][x] += Math.random() > 0.5 ? brainMutationAmount : -brainMutationAmount;
					if (layer.data[y][x] < -1) {
						layer.data[y][x] = -1;
					} else if (layer.data[y][x] > 1) {
						layer.data[y][x] = 1;
					}
				}
			}
		}
	}
	static mutate(b) {
		Brain.mutateLayer(b.weightsHidden);
		Brain.mutateLayer(b.weightsOutput);
		Brain.mutateLayer(b.biasHidden);
		Brain.mutateLayer(b.biasOutput);
	};
	static clone(b) {
		let newBrain = new Brain(b.inputNodes, b.hiddenNodes, b.outputNodes);
		newBrain.weightsHidden = Matrix.copy(b.weightsHidden);
		newBrain.weightsOutput = Matrix.copy(b.weightsOutput);
		newBrain.biasHidden = Matrix.copy(b.biasHidden);
		newBrain.biasOutput = Matrix.copy(b.biasOutput);
		newBrain.score = b.score;
		return newBrain;
	};
	static crossover(brain1, brain2) {
		let childBrain = Brain.clone(brain1);
		//weightsHidden
		for (let y = 0; y < childBrain.weightsHidden.rows; y++) {
			for (let x = 0; x < childBrain.weightsHidden.cols; x++) {
				if (Math.floor(Math.random() * 2) == 0) {
					childBrain.weightsHidden.data[y][x] = brain2.weightsHidden.data[y][x];
				}
			}
		}
		//weightsOutput
		for (let y = 0; y < childBrain.weightsOutput.rows; y++) {
			for (let x = 0; x < childBrain.weightsOutput.cols; x++) {
				if (Math.floor(Math.random() * 2) == 0) {
					childBrain.weightsOutput.data[y][x] = brain2.weightsOutput.data[y][x];
				}
			}
		}
		//biasHidden
		for (let y = 0; y < childBrain.biasHidden.rows; y++) {
			for (let x = 0; x < childBrain.biasHidden.cols; x++) {
				if (Math.floor(Math.random() * 2) == 0) {
					childBrain.biasHidden.data[y][x] = brain2.biasHidden.data[y][x];
				}
			}
		}
		//biasOutput
		for (let y = 0; y < childBrain.biasOutput.rows; y++) {
			for (let x = 0; x < childBrain.biasOutput.cols; x++) {
				if (Math.floor(Math.random() * 2) == 0) {
					childBrain.biasOutput.data[y][x] = brain2.biasOutput.data[y][x];
				}
			}
		}
		return childBrain;
	};
	static reproduce(population) {
		Brain.calculateFitness(population);
		let first = Brain.pickOne(population);
		let second = first;
		while (second == first) {
			second = Brain.pickOne(population);
		}
		let newBrain = Brain.crossover(population[first], population[second]);
		Brain.mutate(newBrain);
		newBrain.score = startScore;
		return newBrain;
	};
	static sortPopulation(population) {
		let sorted = [];
		for (let i = 0; i < population.length; i++) {
			let found = false;
			for (let j = sorted.length - 1; j >= 0; j--) {
				if (population[i].score <= sorted[j].score) {
					sorted.splice(j + 1, 0, population[i]);
					found = true;
					break;
				}
			}
			if (!found) {
				sorted.unshift(population[i]);
			}
		}
		population = sorted;
	}
	static calculateFitness(population) {
		let sum = 0;
		for (let i = 0; i < population.length; i++) {
			sum += population[i].score;
		}
		for (let i = 0; i < population.length; i++) {
			population[i].fitness = population[i].score / sum;
		}
	};
	static pickOne(population) {
		let index = 0;
		let r = Math.random();
		while (r > 0) {
			r = r - population[index].fitness;
			index += 1;
		}
		index -= 1;
		// return population[index];
		return index;
	};
	static pickTop(pLength, percent) {
		return Math.floor(Math.random() * Math.floor(pLength * percent));
	};
};

/******************************************************************************
Matrix
******************************************************************************/

class Matrix {
	constructor(rows, cols) {
		this.rows = rows;
		this.cols = cols;
		this.data = [];
		for (let y = 0; y < this.rows; y++) {
			let row = [];
			for (let x = 0; x < this.cols; x++) {
				row.push((Math.random() * 2) - 1);
			}
			this.data.push(row);
		}
	};
	add(m) {
		if (m instanceof Matrix) {
			//Assumes this.cols === m.rows
			for (let y = 0; y < this.rows; y++) {
				for (let x = 0; x < this.cols; x++) {
					this.data[y][x] += m.data[y][x];
				}
			}
		} else {
			for (let y = 0; y < this.rows; y++) {
				for (let x = 0; x < this.cols; x++) {
					this.data[y][x] += m;
				}
			}
		}
	};
	map(fn) {
		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.cols; x++) {
				this.data[y][x] = fn(this.data[y][x]);
			}
		}
	};
	static product(m1, m2) {
		//Assumes m1.cols === m2.rows
		let result = new Matrix(m1.rows, m2.cols);
		for (let y = 0; y < result.rows; y++) {
			for (let x = 0; x < result.cols; x++) {
				let sum = 0;
				for (let z = 0; z < m1.cols; z++) {
					sum += m1.data[y][z] * m2.data[z][x];
				}
				result.data[y][x] = sum;
			}
		}
		return result;
	};
	static fromArray(arr) {
		let result = new Matrix(arr.length, 1);
		for (let i = 0; i < arr.length; i++) {
			result.data[i][0] = arr[i];
		}
		return result;
	};
	static toArray(m) {
		let arr = [];
		for (let y = 0; y < m.rows; y++) {
			for (let x = 0; x < m.cols; x++) {
				arr.push(m.data[y][x]);
			}
		}
		return arr;
	};
	static copy(m) {
		let nm = new Matrix(m.rows, m.cols);
		for (let y = 0; y < m.rows; y++) {
			for (let x = 0; x < m.cols; x++) {
				nm.data[y][x] = m.data[y][x];
			}
		}
		return nm;
	};
};