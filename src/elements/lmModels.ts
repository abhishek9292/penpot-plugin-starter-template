 import {ActivePrompt,ActiveModel,ActiveModelIP} from "../prompts";
 

// file: plugin.ts

export async function getModelsList(penpot: any , timeoutMs = 3000) {
  console.log("getModelsList");
  const url = `${ActiveModelIP.replace(/\/+$/, '')}/v1/models`;

  // helper: fetch with manual timeout
  function fetchWithTimeout(resource: string, options: any, ms: number) {
    return new Promise<Response>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), ms);
      fetch(resource, options)
        .then(res => {
          clearTimeout(timer);
          resolve(res);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  try {
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }, timeoutMs);

    if (!res.ok) {
      const text = await res.text().catch(() => undefined);
      const payload = {
        status: false,
        httpStatus: res.status,
        error: text ?? `Unexpected status ${res.status}`,
      };
      console.log('returning models answers !res.ok ', payload);
      penpot.ui.sendMessage({
        source: 'penpot',
        type: 'lmconnection',
        data: payload,
      });
      return payload;
    }

    // parse JSON (models list)
    const json = await res.json().catch(() => null);
    const payload = {
      status: true,
      httpStatus: res.status,
      models: json ?? null,
    };
    console.log('returning models answers', payload);
    penpot.ui.sendMessage({
      source: 'penpot',
      type: 'lmconnection',
      data: payload,
    });
    return payload;

  } catch (err: any) {
    const payload = {
      status: false,
      error: err?.message === 'timeout' ? 'timeout' : err?.message ?? String(err),
    };
    console.log('returning models err', payload);
    penpot.ui.sendMessage({
      source: 'penpot',
      type: 'lmconnection',
      data: payload,
    });
    return payload;
  }
}




// Function to call LM Studio API
export async function callLMStudio(prompt: string, designType: string): Promise<any> {
  const systemPrompt = ActivePrompt;
  
  const response = await fetch(ActiveModelIP+'/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: ActiveModel,  
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0]?.message?.content;
  console.log("aiResponse",aiResponse)
  if (!aiResponse) {
    throw new Error("No response from AI model");
  }

  // Try to parse JSON from AI response
  try {
    // Clean the response - remove any markdown formatting
    const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanedResponse);
    console.log("Parsed AI response:", parsed);
    return parsed;
  } catch (parseError) {
    console.error("Failed to parse AI response:", aiResponse);
     throw new Error(`Failed to parse AI response `)
  }
}