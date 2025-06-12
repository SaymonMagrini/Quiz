(() => {
  const quizData = [
    { question: "Qual é o símbolo químico do ouro?", answer: "Au" },
    { question: "Quem foi o primeiro homem a pisar na Lua?", answer: "Neil Armstrong" },
    { question: "Qual país tem a maior população do mundo?", answer: "China" },
    { question: "Em que ano ocorreu a queda do muro de Berlim?", answer: "1989" },
    { question: "Qual a capital da Austrália?", answer: "Canberra" },
    { question: "Quem escreveu 'A Odisséia'?", answer: "Homero" },
    { question: "Qual é a fórmula química do sal de cozinha?", answer: "NaCl" },
    { question: "Qual é a maior montanha do mundo?", answer: "Everest" },
    { question: "Quem pintou 'O Grito'?", answer: "Edvard Munch" },
    { question: "Qual é o maior oceano da Terra?", answer: "Oceano Pacífico" },
    { question: "Qual é a velocidade da luz no vácuo (em km/s)?", answer: "299792" },
    { question: "Qual planeta é conhecido como o Planeta Vermelho?", answer: "Marte" },
    { question: "Quem descobriu a penicilina?", answer: "Alexander Fleming" },
    { question: "Qual é o idioma oficial do Brasil?", answer: "Português" },
    { question: "Qual animal é conhecido como o rei da selva?", answer: "Leão" }
  ];

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  let questions = shuffleArray([...quizData]); // todas as perguntas embaralhadas
  let currentIndex = 0;
  let score = 0;

  const quiz = document.getElementById('quiz');
  let questionNumber = document.getElementById('questionNumber');
  let questionText = document.getElementById('questionText');
  let answerInput = document.getElementById('answerInput');
  let feedback = document.getElementById('feedback');
  let actionButton = document.getElementById('actionButton');

  function normalizeText(text) {
    return text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

window.normalizeText = normalizeText //Globalizando a função

  function isAnswerClose(userAnswer, correctAnswer, question) {
    const normalizedUser = normalizeText(userAnswer);
    const normalizedCorrect = normalizeText(correctAnswer);

    // Bloqueia respostas muito curtas
    if (normalizedUser.length < 2) return false;

    const stopWords = ['oceano', 'planeta', 'monte', 'monte', 'rio', 'lago', 'mar', 'o', 'a', 'de', 'do', 'da', 'dos', 'das', 'e', 'em'];

    function cleanStopWords(text) {
      return text.split(' ').filter(w => !stopWords.includes(w)).join(' ');
    }

    const cleanedUser = cleanStopWords(normalizedUser);
    const cleanedCorrect = cleanStopWords(normalizedCorrect);

    if (cleanedUser.includes(cleanedCorrect) || cleanedCorrect.includes(cleanedUser)) {
      return true;
    }

    // Tratamento especial para números (velocidade da luz)
    if (question.toLowerCase().includes("velocidade da luz")) {
      const numUser = parseFloat(normalizedUser.replace(/[^\d\.]/g, ''));
      const numCorrect = parseFloat(normalizedCorrect.replace(/[^\d\.]/g, ''));
      if (!isNaN(numUser) && !isNaN(numCorrect)) {
        return Math.abs(numUser - numCorrect) < 1000;
      }
    }

    return false;
  }

window.isAnswerClose = isAnswerClose //Globalizando a função

  let awaitingConfirmation = true;

  function loadQuestion() {
    awaitingConfirmation = true;
    actionButton.disabled = true;
    feedback.textContent = "";
    feedback.className = "feedback";
    answerInput.disabled = false;
    answerInput.value = "";
    answerInput.className = "";
    questionNumber.textContent = `Pergunta ${currentIndex + 1} / ${questions.length}`;
    questionText.textContent = questions[currentIndex].question;
    actionButton.textContent = "Confirmar";
    answerInput.focus();
  }

  function checkInput() {
    actionButton.disabled = answerInput.value.trim().length < 1;
  }

  function confirmOrNext() {
    const userAnswer = answerInput.value.trim();
    const correctAnswer = questions[currentIndex].answer;
    const question = questions[currentIndex].question;

    if (awaitingConfirmation) {
      if (isAnswerClose(userAnswer, correctAnswer, question)) {
        score++;
        feedback.textContent = "Resposta correta! 🎉";
        feedback.classList.add('correct');
        answerInput.classList.add('correct');
      } else {
        feedback.textContent = `Resposta incorreta. A resposta correta é: "${correctAnswer}".`;
        feedback.classList.add('incorrect');
        answerInput.classList.add('incorrect');
        // Debug no console para falhas
        console.log(`Pergunta: "${question}"`);
        console.log(`Resposta correta: "${correctAnswer}"`);
        console.log(`Sua resposta: "${userAnswer}"`);
      }
      actionButton.textContent = currentIndex === questions.length - 1 ? "Ver Resultado" : "Próxima Pergunta";
      awaitingConfirmation = false;
      answerInput.disabled = true;
      actionButton.disabled = false;
    } else {
      currentIndex++;
      if (currentIndex < questions.length) {
        loadQuestion();
      } else {
        showResult();
      }
    }
  }

  actionButton.addEventListener('click', confirmOrNext);
  answerInput.addEventListener('input', checkInput);
  answerInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !actionButton.disabled) {
      e.preventDefault();
      confirmOrNext();
    }
  });

  function showResult() {
    const totalQuestions = questions.length;
    const finalScore = ((score / totalQuestions) * 10).toFixed(2);

    quiz.innerHTML = `
      <div class="result">
        <h2>Quiz finalizado!</h2>
        <p>Sua pontuação: ${finalScore} / 10</p>
        <button id="restartButton">Recomeçar</button>
      </div>
    `;

    document.getElementById('restartButton').addEventListener('click', () => {
      questions = shuffleArray([...quizData]);
      currentIndex = 0;
      score = 0;
      quiz.innerHTML = `
        <div class="question-number" id="questionNumber">Pergunta 1 / ${questions.length}</div>
        <h1 class="question" id="questionText">Carregando...</h1>
        <label for="answerInput">Sua resposta:</label>
        <input type="text" id="answerInput" autocomplete="off" spellcheck="false" />
        <div class="feedback" id="feedback"></div>
        <button id="actionButton" disabled>Confirmar</button>
      `;

      // Rebind elements
      questionNumber = document.getElementById('questionNumber');
      questionText = document.getElementById('questionText');
      answerInput = document.getElementById('answerInput');
      feedback = document.getElementById('feedback');
      actionButton = document.getElementById('actionButton');

      actionButton.addEventListener('click', confirmOrNext);
      answerInput.addEventListener('input', checkInput);
      answerInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !actionButton.disabled) {
          e.preventDefault();
          confirmOrNext();
        }
      });

      loadQuestion();
    });
  }

  loadQuestion();
})();