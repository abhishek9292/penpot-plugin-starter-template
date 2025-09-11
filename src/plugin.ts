// plugin.ts - Main plugin file
import "./style.css";
import { createTextElement } from "./elements/createTextElement";
import { createShapeElement } from "./elements/createShapeElement";
import { createLayoutFromData } from "./elements/createLayoutFromData";

// Plugin initialization
penpot.ui.open("AI Design Generator", `?theme=${penpot.theme}`);

// type PathCommand = { type: string; x?: number; y?: number }; 
// Listen for messages from the UI
penpot.ui.onMessage<any>((message) => {
  if (message.type === "generate-design") {
    generateDesignFromPrompt(message.prompt, message.designType);
  } else if (message.type === "create-text") {
    createTextElement(penpot, message.text, message.x, message.y);
  } else if (message.type === "create-shape") {
    createShapeElement(penpot  ,message.shapeData);
  } else if (message.type === "create-layout") {
    createLayoutFromData(penpot  ,message.layoutData);
  }
});
  

// Main function to generate design from prompt
async function generateDesignFromPrompt(prompt: string, designType: string) {
  try {
    // Send prompt to LM Studio
    const aiResponse = await callLMStudio(prompt, designType);
    
    if (aiResponse) {
      // Parse the AI response and create design elements
      createLayoutFromData(penpot  ,aiResponse);
      
      // Send success message back to UI
      penpot.ui.sendMessage({
        type: "design-generated",
        success: true,
        message: "Design generated successfully!"
      });
    }
  } catch (error) {
    console.error("Error generating design:", error);
    penpot.ui.sendMessage({
      type: "design-generated",
      success: false,
      message: "Failed to generate design. Check console for details."
    });
  }
}

// Function to call LM Studio API
async function callLMStudio(prompt: string, designType: string): Promise<any> {
  const systemPrompt = `You are a UI/UX design assistant. Generate a JSON structure for a ${designType} design based on the user's prompt. 

  `;
  
  const response = await fetch('http://localhost:9000/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "mistral-7b-instruct-v0.1", // Adjust based on your LM Studio model
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
    
    // Fallback: create a simple design
    return {
      name: "Product Detail Screen",
      width: 800,
      height: 600,
      elements: [
        {
          type: "text",
          content: "Product Title",
          x: 20,
          y: 20,
          fontSize: 24,
          fontFamily: "Work Sans",
          color: "#333333"
        },
        {
          type: "image",
          content: "product image",
          x: 20,
          y: 60,
          backgroundColor: "#f0f0f0"
        },
        {
          type: "text",
          content: "Product description goes here...",
          x: 20,
          y: 160,
          fontSize: 14,
          fontFamily: "Work Sans",
          color: "#666666"
        },
        {
          type: "button",
          content: "Add to Cart",
          x: 20,
          y: 200,
          fontSize: 16,
          backgroundColor: "#007bff",
          color: "#ffffff"
        }
      ]
    };
  }
}

// Update theme when changed
penpot.on("themechange", (theme) => {
  penpot.ui.sendMessage({
    source: "penpot",
    type: "themechange",
    theme,
  });
});

console.log("AI Design Generator Plugin loaded!");