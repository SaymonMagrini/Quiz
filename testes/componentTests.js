// componentTests.js
(function (global) {
  const { assertEqual, assertTrue, assertFalse } = global.TestLib;

  // Funções do quiz usadas nos testes
  function normalizeText(text) {
    return text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  // Simulação básica do quiz
  function QuizSimulator(questions) {
    this.questions = questions;
    this.currentIndex = 0;
    this.score = 0;
    this.awaitingConfirmation = true;
  }

  QuizSimulator.prototype.isAnswerClose = function (userAnswer, correctAnswer, question) {
    const normalizedUser = normalizeText(userAnswer);
    const normalizedCorrect = normalizeText(correctAnswer);

    if (normalizedUser === normalizedCorrect) return true;  // aceita igualdade exata

    if (normalizedUser.length < 2) return false;

    const stopWords = ['oceano', 'planeta', 'monte', 'rio', 'lago', 'mar', 'o', 'a', 'de', 'do', 'da', 'dos', 'das', 'e', 'em'];

    function cleanStopWords(text) {
      return text.split(' ').filter(w => !stopWords.includes(w)).join(' ');
    }

    const cleanedUser = cleanStopWords(normalizedUser);
    const cleanedCorrect = cleanStopWords(normalizedCorrect);

    if (cleanedUser.includes(cleanedCorrect) || cleanedCorrect.includes(cleanedUser)) {
      return true;
    }

    if (question.toLowerCase().includes("velocidade da luz")) {
      const numUser = parseFloat(normalizedUser.replace(/[^\d\.]/g, ''));
      const numCorrect = parseFloat(normalizedCorrect.replace(/[^\d\.]/g, ''));
      if (!isNaN(numUser) && !isNaN(numCorrect)) {
        return Math.abs(numUser - numCorrect) < 1000;
      }
    }

    return false;
  };

  QuizSimulator.prototype.confirmAnswer = function (userAnswer) {
    if (!this.awaitingConfirmation) return null;

    const q = this.questions[this.currentIndex];
    const isCorrect = this.isAnswerClose(userAnswer, q.answer, q.question);
    if (isCorrect) this.score++;
    this.awaitingConfirmation = false;
    return isCorrect;
  };

  QuizSimulator.prototype.nextQuestion = function () {
    if (this.awaitingConfirmation) return false; // retorne false quando não confirmado
    if (this.currentIndex + 1 >= this.questions.length) return false; // não avança além do limite
    this.currentIndex++;
    this.awaitingConfirmation = true;
    return true;
  };

  QuizSimulator.prototype.getScoreBase10 = function () {
    return parseFloat(((this.score / this.questions.length) * 10).toFixed(2));
  };

  QuizSimulator.prototype.reset = function () {
    this.currentIndex = 0;
    this.score = 0;
    this.awaitingConfirmation = true;
  };

  // Testes de componente
  const componentTests = {
    'Confirmar resposta correta incrementa score': () => {
      const quiz = new QuizSimulator([{ question: "Q1", answer: "resp" }]);
      const result = quiz.confirmAnswer("resp");
      return assertTrue(result, "resposta correta retorna true") && assertEqual(quiz.score, 1, "score incrementado");
    },

    'Confirmar resposta incorreta não incrementa score': () => {
      const quiz = new QuizSimulator([{ question: "Q1", answer: "resp" }]);
      const result = quiz.confirmAnswer("errado");
      return assertFalse(result, "resposta incorreta retorna false") && assertEqual(quiz.score, 0, "score não incrementado");
    },

    'Não permite avançar se resposta não confirmada': () => {
      const quiz = new QuizSimulator([{ question: "Q1", answer: "resp" }]);
      const advanced = quiz.nextQuestion();
      return assertFalse(advanced, "não avança sem confirmação");
    },

    'Avança para próxima pergunta após confirmação': () => {
      const quiz = new QuizSimulator([{ question: "Q1", answer: "resp" }, { question: "Q2", answer: "resp2" }]);
      quiz.confirmAnswer("resp");
      const advanced = quiz.nextQuestion();
      return assertTrue(advanced, "avançou para próxima pergunta") && assertEqual(quiz.currentIndex, 1, "index incrementado");
    },

    'Retorna false ao avançar depois da última pergunta': () => {
      const quiz = new QuizSimulator([{ question: "Q1", answer: "resp" }]);
      quiz.confirmAnswer("resp");
      quiz.nextQuestion();
      const advanced = quiz.nextQuestion();
      return assertFalse(advanced, "não avança além do limite");
    },

    'getScoreBase10 retorna pontuação correta arredondada': () => {
      const quiz = new QuizSimulator([{ question: "Q1", answer: "resp" }, { question: "Q2", answer: "resp2" }]);
      quiz.score = 1;
      return assertEqual(quiz.getScoreBase10(), 5.00, "pontuação base 10 correta");
    },

    'reset zera estado do quiz': () => {
      const quiz = new QuizSimulator([{ question: "Q1", answer: "resp" }]);
      quiz.confirmAnswer("resp");
      quiz.nextQuestion();
      quiz.reset();
      return assertEqual(quiz.currentIndex, 0, "index resetado") && assertEqual(quiz.score, 0, "score resetado") && assertTrue(quiz.awaitingConfirmation, "awaitingConfirmation resetado");
    },

    'isAnswerClose aceita variações': () => {
      const quiz = new QuizSimulator([{ question: "Q1", answer: "Oceano Pacífico" }]);
      return assertTrue(quiz.isAnswerClose("pacifico", "Oceano Pacífico", "Q1"), "aceita pacifico");
    },

    'isAnswerClose rejeita respostas curtas': () => {
      const quiz = new QuizSimulator([{ question: "Q1", answer: "Everest" }]);
      return assertFalse(quiz.isAnswerClose("a", "Everest", "Q1"), "rejeita respostas curtas");
    },

    'confirmAnswer só pode confirmar uma vez por pergunta': () => {
      const quiz = new QuizSimulator([{ question: "Q1", answer: "resp" }]);
      quiz.confirmAnswer("resp");
      const secondConfirm = quiz.confirmAnswer("resp");
      return assertEqual(secondConfirm, null, "não permite confirmar novamente");
    },

    'nextQuestion só avança se resposta confirmada': () => {
      const quiz = new QuizSimulator([{ question: "Q1", answer: "resp" }, { question: "Q2", answer: "resp2" }]);
      const advancedBefore = quiz.nextQuestion();
      quiz.confirmAnswer("resp");
      const advancedAfter = quiz.nextQuestion();
      return assertFalse(advancedBefore, "não avança antes da confirmação") && assertTrue(advancedAfter, "avança depois da confirmação");
    },

    'pontuação correta para múltiplas perguntas': () => {
      const quiz = new QuizSimulator([
        { question: "Q1", answer: "a" },
        { question: "Q2", answer: "b" },
        { question: "Q3", answer: "c" }
      ]);
      quiz.confirmAnswer("a"); quiz.nextQuestion();
      quiz.confirmAnswer("errado"); quiz.nextQuestion();
      quiz.confirmAnswer("c");
      return assertEqual(quiz.score, 2, "score calculado corretamente");
    },

    'não avança após última pergunta': () => {
      const quiz = new QuizSimulator([{ question: "Q1", answer: "a" }]);
      quiz.confirmAnswer("a");
      const advance1 = quiz.nextQuestion();
      const advance2 = quiz.nextQuestion();
      return assertFalse(advance1, "não avança além do fim") && assertFalse(advance2, "não avança após o fim");
    },
  };

  global.componentTests = componentTests;

  global.runComponentTests = () => {
    console.log("Executando Testes de Componentes...\n");
    global.TestLib.runTests(componentTests);
  };

})(this);