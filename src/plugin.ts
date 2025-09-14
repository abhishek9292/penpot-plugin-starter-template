// plugin.ts - Main plugin file
 
import { createTextElement } from "./elements/createTextElement";
import { createShapeElement } from "./elements/createShapeElement";
import { createLayoutFromData } from "./elements/createLayoutFromData";
import {getModelsList,callLMStudio} from "./elements/lmModels";
 



// Plugin initialization
penpot.ui.open("AI Design Generator", `?theme=${penpot.theme}`);
 
// type PathCommand = { type: string; x?: number; y?: number }; 
// Listen for messages from the UI
penpot.ui.onMessage<any>((message) => {
  console.log("From Plugin : ",message)
  if (message.type === "generate-design") {
    generateDesignFromPrompt(message.prompt, message.designType);
  } else if (message.type === "get-models") { 
    getModelsList(penpot);
  }else if(message.scope==="penpot/rasterizer"){ //
     
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
        source: "penpot",
        type: "design-generated",
        success: true,
        message: "Design generated successfully!"
      });
    }
  } catch (error) {
    console.error("Error generating design:", error);
    penpot.ui.sendMessage({
      source: "penpot",
      type: "design-generated",
      success: false,
      message: "Failed to generate design. Check console for details."
    });
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