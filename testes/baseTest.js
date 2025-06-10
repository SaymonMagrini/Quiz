// baseTest.js
(function(global){
  function assertEqual(actual, expected, message) {
    if (actual === expected) {
      console.log(`✔️  PASS: ${message}`);
      return true;
    } else {
      console.error(`❌ FAIL: ${message}\n    Esperado: ${expected}\n    Recebido: ${actual}`);
      return false;
    }
  }

  function assertTrue(value, message) {
    return assertEqual(value, true, message);
  }

  function assertFalse(value, message) {
    return assertEqual(value, false, message);
  }

  // Runner genérico
  function runTests(tests) {
    let passed = 0;
    let failed = 0;
    for (const [name, fn] of Object.entries(tests)) {
      try {
        const result = fn();
        if (result === true) passed++;
        else failed++;
      } catch (e) {
        failed++;
        console.error(`❌ ERROR in ${name}:`, e);
      }
    }
    console.log(`\nTestes executados: ${passed + failed} | Passaram: ${passed} | Falharam: ${failed}\n`);
  }

  global.TestLib = {
    assertEqual,
    assertTrue,
    assertFalse,
    runTests,
  };

})(this);