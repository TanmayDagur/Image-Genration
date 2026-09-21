import fetch from 'node-fetch'; // Next.js has fetch natively if we run via node? Node 18+ has fetch.

async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', parts: [{ type: 'text', text: 'Hello' }] }]
      })
    });
    
    console.log('Status:', res.status);
    console.log('Headers:', res.headers.raw());
    
    const text = await res.text();
    console.log('Body:', text);
  } catch (e) {
    console.error(e);
  }
}

run();
