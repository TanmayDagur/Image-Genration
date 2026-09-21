import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function run() {
  try {
    const result = streamText({
      model: openai("gpt-4o"),
      messages: [{ role: 'user', content: 'Say hello' }],
    });
    
    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
    console.log('\nDone!');
  } catch (e) {
    console.error("ERROR:", e);
  }
}

run();
