/**
 * Verification of Single onAuthStateChange listener
 */
const assert = require('assert');

let listenerCount = 0;
const mockClient = {
  auth: {
    onAuthStateChange: (cb) => {
      listenerCount++;
      return { data: { subscription: { unsubscribe: () => { listenerCount--; } } } };
    },
    getSession: async () => ({ data: { session: null }, error: null })
  }
};

global.window = {
  location: { pathname: '/dashboard.html', search: '', origin: 'http://localhost:8080' },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {}, length: 0 },
  sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  addEventListener: () => {}
};
global.document = {
  getElementById: () => null,
  createElement: () => ({ classList: { add: () => {}, remove: () => {} }, style: {}, appendChild: () => {} }),
  body: { appendChild: () => {} },
  readyState: 'complete'
};
global.SupabaseBridge = {
  getClient: () => mockClient,
  init: async () => mockClient,
  isInitialized: true
};

delete require.cache[require.resolve('../js/auth.js')];
const AuthManager = require('../js/auth.js');

async function testListenerDedupe() {
  console.log('Testing setupAuthListener deduplication...');
  AuthManager.setupAuthListener();
  AuthManager.setupAuthListener();
  AuthManager.setupAuthListener();

  assert.strictEqual(listenerCount, 1, `Expected exactly 1 listener, got ${listenerCount}`);
  console.log('✅ PASS: Exactly ONE onAuthStateChange listener attached despite multiple calls.');
}

testListenerDedupe().catch(err => {
  console.error(err);
  process.exit(1);
});
