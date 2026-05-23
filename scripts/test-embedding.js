
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

async function listModels() {
      console.log('\nListing models...');
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
      try {
            const response = await fetch(url);
            if (!response.ok) {
                  console.error('List failed:', response.status, await response.text());
                  return;
            }
            const data = await response.json();

            console.log('Available embedding models:');
            if (data.models) {
                  data.models.forEach(m => {
                        if (m.name.includes('embedding') || m.supportedGenerationMethods.includes('embedContent')) {
                              console.log(`- ${m.name}`);
                              console.log(`  Methods: ${m.supportedGenerationMethods.join(', ')}`);
                        }
                  });
            }
      } catch (err) {
            console.error('List error:', err.message);
      }
}

async function run() {
      await listModels();
}

run();
