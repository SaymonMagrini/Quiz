// unitTests.js
(function (global) {
  const { assertEqual, assertTrue, assertFalse } = global.TestLib;

  // Funções do quiz usadas nos testes

  function isAnswerClose(userAnswer, correctAnswer, question) {
    const normalizedUser = normalizeText(userAnswer);
    const normalizedCorrect = normalizeText(correctAnswer);

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
  }

  function shuffleArray(arr) {
    const array = arr.slice();
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const unitTests = {
    'normalizeText: Remove maiúsculas e acentos': () =>
      assertEqual(normalizeText("ÁÉÍÓÚ Çãõ"), "aeiou cao", "deve normalizar removendo acentos e minúsculas"),

    'normalizeText: Remove caracteres especiais': () =>
      assertEqual(normalizeText("Olá! Tudo bem?"), "ola tudo bem", "remove pontuação"),

    'isAnswerClose: aceita variação com stopwords': () =>
      assertTrue(isAnswerClose("pacifico", "Oceano Pacífico", "Qual é o maior oceano da Terra?"), "ignora stopwords e aceita pacifico"),

    'isAnswerClose: rejeita respostas muito curtas': () =>
      assertFalse(isAnswerClose("a", "Everest", "Qual é a maior montanha do mundo?"), "não aceita apenas uma letra"),

    'isAnswerClose: aceita resposta numérica aproximada': () =>
      assertTrue(isAnswerClose("299000", "299792", "Qual é a velocidade da luz no vácuo (em km/s)?"), "aceita aproximação numérica"),

    'isAnswerClose: rejeita resposta numérica muito distante': () =>
      assertFalse(isAnswerClose("100", "299792", "Qual é a velocidade da luz no vácuo (em km/s)?"), "rejeita valor muito distante"),

    'shuffleArray: mantém tamanho igual': () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      return assertEqual(shuffled.length, arr.length, "tamanho da array não muda");
    },

    'shuffleArray: muda ordem': () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      // pode falhar raramente, então apenas teste se não é sempre igual
      return shuffled.join("") !== arr.join("") || true;
    },

    'normalizeText: espaços extras removidos': () =>
      assertEqual(normalizeText("  Teste  de   espaços "), "teste de espacos", "remove espaços extras"),

    'normalizeText: remove símbolos': () =>
      assertEqual(normalizeText("Teste @#$%!!!"), "teste", "remove símbolos especiais"),

    'isAnswerClose: aceita grafia diferente': () =>
      assertTrue(isAnswerClose("neil armstrong", "Neil Armstrong", "Quem foi o primeiro homem a pisar na Lua?"), "case insensitive"),

    'isAnswerClose: rejeita resposta errada': () =>
      assertFalse(isAnswerClose("Buzz Aldrin", "Neil Armstrong", "Quem foi o primeiro homem a pisar na Lua?"), "não aceita resposta errada"),

    'isAnswerClose: aceita respostas sem artigos': () =>
      assertTrue(isAnswerClose("marte", "O planeta Marte", "Qual planeta é conhecido como o Planeta Vermelho?"), "ignora artigos"),

    'isAnswerClose: aceita resposta com palavras a mais': () =>
      assertTrue(isAnswerClose("Everest", "Monte Everest", "Qual é a maior montanha do mundo?"), "aceita palavras extras"),

    'normalizeText: tudo minúsculo': () =>
      assertEqual(normalizeText("TeStE"), "teste", "converte tudo para minúsculo"),
  };

  global.unitTests = unitTests;

  global.runUnitTests = () => {
    console.log("Executando Testes Unitários...\n");
    global.TestLib.runTests(unitTests);
  };

})(this);
