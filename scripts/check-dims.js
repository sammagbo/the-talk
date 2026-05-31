
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

async function checkDimensions() {
      const model = 'models/gemini-embedding-001';
      console.log(`Checking dimensions for ${model}...`);

      const url = `https://generativelanguage.googleapis.com/v1beta/${model}:embedContent?key=${API_KEY}`;

      try {
            const response = await fetch(url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                        model: model,
                        content: { parts: [{ text: "Hello world" }] }
                  })
            });

            if (!response.ok) {
                  console.error('Error:', await response.text());
                  return;
            }

            const data = await response.json();
            const dim = data.embedding.values.length;
            console.log(`✅ Model ${model} returns ${dim} dimensions.`);
      } catch (err) {
            console.error('Exception:', err);
      }
}

checkDimensions();
