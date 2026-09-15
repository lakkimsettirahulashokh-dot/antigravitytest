/**
 * Verification of Supabase Client Singleton Concurrency
 */
const assert = require('assert');

// Simulate browser global window environment
let createClientCallCount = 0;
const mockSupabase = {
  createClient: (url, key, opts) => {
    createClientCallCount++;
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      }
    };
  }
};

global.window = {
  supabase: mockSupabase,
  location: { origin: 'http://localhost:8080' },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    length: 0
  }
};
global.fetch = async () => ({
  ok: true,
  json: async () => ({
    supabaseUrl: 'https://kkdqahqcochicfvkfyan.supabase.co',
    supabaseAnonKey: 'sample_anon_key'
  })
});
global.document = {
  readyState: 'complete',
  addEventListener: () => {}
};

// Require our modified supabase-client.js
delete require.cache[require.resolve('../js/supabase-client.js')];
const SupabaseBridge = require('../js/supabase-client.js');

async function testConcurrency() {
  console.log('Testing 50 concurrent SupabaseBridge.init() calls...');
  const promises = [];
  for (let i = 0; i < 50; i++) {
    promises.push(SupabaseBridge.init());
  }

  const clients = await Promise.all(promises);

  // Assert all 50 returned the identical instance
  const first = clients[0];
  assert(first !== null, 'Client must not be null');
  for (let i = 1; i < clients.length; i++) {
    assert.strictEqual(clients[i], first, `Client instance ${i} must be identical to first`);
  }

  // Assert createClient was called EXACTLY ONCE
  assert.strictEqual(createClientCallCount, 1, `createClient must be called exactly 1 time, got ${createClientCallCount}`);

  console.log('✅ PASS: Exactly ONE client instance created across 50 concurrent initializations.');
}

testConcurrency().catch(err => {
  console.error(err);
  process.exit(1);
});
