import { runTranslatorTests } from './test/translator.test.js';
import { runAntiBotTests } from './test/anti-bot.test.js';
import { runConfigTests } from './test/config.test.js';
import { runProxyTests } from './test/proxy.test.js';

async function runAll() {
  console.log('🚀 Running Hydrogen Enterprise Comprehensive Test Suite...\n');
  try {
    runTranslatorTests();
    runAntiBotTests();
    runConfigTests();
    await runProxyTests();

    console.log('\n🎉 All Hydrogen enterprise tests passed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
  }
}

runAll();
