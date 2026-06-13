// test_textbelt.js
(async () => {
  const phone = '+15146387890';
  const message = 'Test SMS from Yasir Gangat platform';
  const apiKey = process.env.TEXTBELT_API_KEY;
  if (!apiKey) {
    console.error('TEXTBELT_API_KEY not set');
    process.exit(1);
  }
  try {
    const res = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message, key: apiKey })
    });
    const data = await res.json();
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
  }
})();
