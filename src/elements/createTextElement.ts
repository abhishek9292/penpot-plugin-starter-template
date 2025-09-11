// src/elements/createTextElement.ts 
 
export function createTextElement(penpot: any  , text: string, x = 100, y = 100) {
  const textElement = penpot.createText(text);
  if (textElement) {
    textElement.x = x;
    textElement.y = y;
    
    // Set font properties in correct order
    textElement.fontId = "gfont-work-sans";
    textElement.fontSize = "16";
    textElement.growType = "auto-width";
    
    penpot.selection = [textElement];
  }
}
