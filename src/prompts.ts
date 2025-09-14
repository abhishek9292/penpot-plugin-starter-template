 

const mistralModel = "mistral-7b-instruct-v0.1"
const qwen = "qwen/qwen3-4b-thinking-2507"
 
import basicPrompt from './prompts/basic_.txt?raw';
import claudePrompt from './prompts/claude_.txt?raw';
import circle_ from './prompts/circle_.txt?raw';

// export as a plain string (sync)
export const ActivePrompt = circle_;
 //
export const ActiveModel = mistralModel
export const ActiveModelIP ='http://172.30.48.1:9000'
