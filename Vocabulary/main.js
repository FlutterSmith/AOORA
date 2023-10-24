class VocabularySystem{
	constructor(){
		this.words = [];
		this.wordIndex = 0;
	}
	
	isCompleted(){
		return this.wordIndex >= this.getLength();
	}
	
	getAmountCorrectWords(){
		let counter = 0;
		for (let wordPair of this.words){
			if (wordPair[2]){
				counter++;
			}
		}
		return counter;
	}
	
	getLength(){
		return this.words.length;
	}
	
	getErrorWords(){
		let errorWords = [];
		for (let wordPair of this.words){
			if (!wordPair[2]){
				errorWords.push(wordPair.slice(0, 2));
			}
		}
		return errorWords;
	}
	
	checkEnd(){
		if (this.isCompleted()){
			throw new Error("No words are selected");
		}
	}
	
	getPair(){
		this.checkEnd();
		return this.words[this.wordIndex];
	}
	
	getQuestion(){
		return this.getPair()[0];
	}
	
	checkAnswer(userAnswer){
		this.checkEnd();
		let pair = this.getPair();
		let correctAnswer = pair[1];
		let isCorrect = userAnswer === correctAnswer;
		pair[2] = isCorrect;
		this.wordIndex++;
		return [isCorrect, correctAnswer];
	}
	
	restart(wordMap){
		this.words = [];
		this.wordIndex = 0;
		for (let word of wordMap){
			this.words.push(word.concat(false));
		}
	}
}

class VocabularyApp{
    constructor(){
		this.question = document.getElementById("question");
        this.textInput = document.getElementById('textInput');
        this.result = document.getElementById("result");
		this.statusList = document.getElementById("statusList");
		this.startOverBtn = document.getElementById("startOver");
		this.startErrorBtn = document.getElementById("startError");
		this.resultTable = document.getElementById("resultTable");
		this.vocabularySys = new VocabularySystem();
    }
	
	handleEnd(){
		this.question.innerHTML = "";
		this.resultTable.innerHTML = "";
		this.result.innerHTML = `COMPLETED ${this.vocabularySys.getAmountCorrectWords()} of ${this.vocabularySys.getLength()}`;
		for (let wordPair of this.vocabularySys.words){
			let row = this.resultTable.insertRow(-1);
			for (let wordData of wordPair){
				row.insertCell(-1).innerHTML = wordData;
			}
		}
	}
	
	feedNext(){
		this.textInput.value = "";
		this.result.innerHTML = "";
		if (this.vocabularySys.isCompleted()){
			this.handleEnd();
		}
		else{
			this.question.innerHTML = this.vocabularySys.getQuestion();
		}
	}
	
	checkAnswer(userInput){
		let [isCorrect, answer] = this.vocabularySys.checkAnswer(userInput);
		if (isCorrect){
			this.result.innerHTML = "CORRECT!";
		}
		else{
			this.result.innerHTML = `INCORRECT! ${answer}`;
		}
	}
    
    handleKey(event){
		if (event.key !== "Enter"){
			return;
		}
		if (this.vocabularySys.isCompleted()){
			return;
		}
		this.checkAnswer(this.textInput.value);
		window.setTimeout(this.feedNext.bind(this), 1000);
    }
	
	startOver(){
		this.resultTable.innerHTML = "";
		this.vocabularySys.restart(vocabulary);
		this.question.innerHTML = this.vocabularySys.getQuestion();
		this.result.innerHTML = "";
	}
	
	startError(){
		this.resultTable.innerHTML = "";
		this.vocabularySys.restart(this.vocabularySys.getErrorWords());
		this.result.innerHTML = "";
		if (!this.vocabularySys.isCompleted()){
			this.question.innerHTML = this.vocabularySys.getQuestion();
		}
	}
    
    run(){
		this.startOver();
        this.textInput.addEventListener('keydown', this.handleKey.bind(this));
        this.startOverBtn.addEventListener('click', this.startOver.bind(this));
        this.startErrorBtn.addEventListener('click', this.startError.bind(this));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let v = new VocabularyApp()
	v.run();
	window.v = v;
});