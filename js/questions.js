const getMethods = (obj) => {
    let properties = new Set()
    let currentObj = obj
    do {
        Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
    } while ((currentObj = Object.getPrototypeOf(currentObj)))
    return [...properties.keys()].filter(item => typeof obj[item] === 'function')
}
class Question {
    static cnt = 0;
    constructor(msg, rightAnswer, ...wrongAnswers) {
        this.msg = msg;
        this.rightAnswer = rightAnswer;
        this.userAnswer = null;
        this.wrongAnswers = [...wrongAnswers];
        this.completed = false;
        this.id = Question.cnt++;
    }
}
class QuestionModuleClass {
    questionInterval;
    asked = false;
    waitingForReset = false;
    questionArea;
    cnt = 0;
    questions = [];
    currentQuestion = null;
    currentAnswers = [];
    questionBottomBorder = 200; //test
    constructor() {

    }
    questionTest() {
        data.questions.forEach(q => self.addQuestion(q.msg, q.rightAnswer, ...q.wrongAnswers));
    }

    addQuestion(msg, rightAnswer, ...wrongAnswers) {
        self.questions.push(new Question(msg, rightAnswer, ...wrongAnswers));
    }
    getNextQuestion() {
        for (let i = 0; i < self.questions.length; i++) {
            let q = self.questions[i];
            if (!q.completed)
                return q;
        }
        return null;
    }
    questionStart() {
        self.questionArea = document.getElementById('questionArea');
        self.questionArea.style.width = gameBox.offsetWidth + 'px';
        self.questionBottomBorder = gameBox.getBoundingClientRect().bottom - 20;
        self.questionInterval = setInterval(self.questionEngine, self.gameSpeed);
    }
    questionPause() {
        clearInterval(self.questionInterval);
    }
    questionStop() {}
    questionEngine() {
        if (!self.asked) {
            let q = self.getNextQuestion();
            if (!q) {
                questionLabel.innerText = 'Сұрақтар тауысылды. ' +
                    'html, css, js-тен хабарыңыз болса сұрақтар қорын толтыруға көмектесіңізші. ' +
                    'Астында тиісті сілтемелер бар. Авторға хабарласыңыз '
                return;
            }
            self.showQuestion(q);
            self.asked = true;
        }
        self.moveAnswerDivs();
        self.chooseAnswer();
    }
    showQuestion(q) {
        self.questionArea.top = self.topBorder;
        self.questionArea.style.top = self.questionArea.top + 'px';

        function createDiv(txt, isTrue) {
            let d = document.createElement('div');
            d.className = 'answer';
            d.innerText = txt;
            d.isTrue = isTrue;
            return d;
        }
        self.currentQuestion = q;
        questionLabel.innerText = q.msg;
        let arr = [createDiv(q.rightAnswer, true)];

        for (let wa of q.wrongAnswers) {
            arr.push(createDiv(wa, false))
        }
        let r = 0;
        while (arr.length) {
            let rn = Math.random();
            if (rn < 0.9) {
                r++;
                continue;
            }
            r++;
            r = r % arr.length;
            self.currentAnswers.push(arr[r]);

            questionArea.appendChild(arr[r]);
            arr.splice(r, 1);
        }
    }
    moveAnswerDivs() {
        self.questionArea.top += 2;
        if (self.questionArea.top < self.questionBottomBorder)
            self.questionArea.style.top = self.questionArea.top + 'px';
        else {
            self.resetQuestionArea();
        }
    }
    chooseAnswer() {
        if (self.waitingForReset || !self.currentAnswers.length)
            return;
        let rr = self.rocket.getBoundingClientRect();

        for (let i = 0; i < self.currentAnswers.length; i++) {
            if (!self.currentAnswers[i]) {
                self.pause();
            }
            let e = self.currentAnswers[i].getBoundingClientRect();

            if (e.left <= rr.left && e.right >= rr.right && e.top >= rr.top && e.bottom < rr.bottom) {
                let isTrue = self.currentAnswers[i].isTrue;
                if (isTrue) {
                    self.currentAnswers[i].style.color = 'green';
                    self.currentAnswers[i].style.backgroundColor = 'green';
                } else {
                    self.currentAnswers[i].style.color = 'red';
                    self.currentAnswers[i].style.backgroundColor = 'red';
                }
                self.handleAnswer(isTrue);
                return;
            }
        }
    }
    handleAnswer(isTrue) {

        if (self.waitingForReset)
            return;
        self.waitingForReset = true;
        setTimeout(self.resetQuestionArea, 300);
        if (isTrue) {
            scoreDiv.innerText -= -100;
        }
        self.currentQuestion.completed = true;
    }
    resetQuestionArea() {
        self.currentQuestion.completed = true;
        self.currentAnswers.splice(0, 99);
        self.questionArea.innerHTML = '';
        questionLabel.innerText = '';
        self.questionArea.top = self.topBorder;
        self.questionArea.style.top = self.questionArea.top + 'px';
        self.waitingForReset = false;
        self.asked = false;
    }
};
window.questionsModule = {
    workWithGame(game) {
        let questionsModule = new QuestionModuleClass;
        getMethods(questionsModule).map(k => game[k] = questionsModule[k]);
        Object.assign(game, questionsModule);
    }
}