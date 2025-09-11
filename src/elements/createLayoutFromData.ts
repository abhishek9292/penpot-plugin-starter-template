 



// Function to create layout from AI-generated data
export function createLayoutFromData(penpot: any ,layoutData: any) {
  const elements: any[] = [];

  layoutData.elements.forEach((elementData: any) => {
    let element;

    switch (elementData.type) {
      case "text":
        element = penpot.createText(elementData.content|| "Text");
        if (element) {
          element.x = elementData.x || 0;
          element.y = elementData.y || 0;

          // Set font properties in correct order (fontId first!)
          if (elementData.fontFamily) {
            // Map common font families to Penpot font IDs
            const fontMap: { [key: string]: string } = {
              "Arial": "gfont-arial",
              "Work Sans": "gfont-work-sans", 
              "Roboto": "gfont-roboto",
              "Open Sans": "gfont-open-sans"
            };
            const fontId = fontMap[elementData.fontFamily] || "gfont-work-sans";
            element.fontId = fontId;
            element.fontFamily = elementData.fontFamily;
          }

          // Set font size as string
          if (elementData.fontSize) {
            element.fontSize = elementData.fontSize.toString();
          }

          if (elementData.color) {
            element.fills = [{ fillColor: elementData.color, fillOpacity: 1 }];
          }
          // Set text properties
          element.growType = "auto-width"; // Let text size itself
        }
        break;
      
      case "rectangle":
        element = penpot.createRectangle();
        if (element) {
          element.x = elementData.x || 0;
          element.y = elementData.y || 0;
        }
        break;
      
      case "circle":
        element = penpot.createEllipse();
        if (element) {
          element.x = elementData.x || 0;
          element.y = elementData.y || 0;
        }
        break;

      case "button":
          // Create button as a rectangle with text
          const buttonRect = penpot.createRectangle();
          if (buttonRect) {
            buttonRect.x = elementData.x || 0;
            buttonRect.y = elementData.y || 0;
            
            // Set button background color
            const buttonColor = elementData.backgroundColor || "#007bff";
            buttonRect.fills = [{ fillColor: buttonColor, fillOpacity: 1 }];
            elements.push(buttonRect);

            // Create text on top of button
            if (elementData.content) {
                const buttonText = penpot.createText(elementData.content);
                if (buttonText) {
                // Position text slightly offset from button
                buttonText.x = (elementData.x || 0) + 20;
                buttonText.y = (elementData.y || 0) + 15;
                
                // Set font properties in correct order
                buttonText.fontId = "gfont-work-sans";
                if (elementData.fontSize) {
                    buttonText.fontSize = elementData.fontSize.toString();
                } else {
                    buttonText.fontSize = "16";
                }
                
                // Set text color
                const textColor = elementData.color || "#ffffff";
                buttonText.fills = [{ fillColor: textColor, fillOpacity: 1 }];
                
                buttonText.growType = "auto-width";
                
                elements.push(buttonText);
                }
            } 
        } 
 
        return; // Skip the normal element processing
      
      case "image":
        element = penpot.createRectangle();
        if (element) {
           element.x = elementData.x || 0;
            element.y = elementData.y || 0;
            element.fills = [{ fillColor: "#f0f0f0", fillOpacity: 1 }];
          
             elements.push(element);
          // Add a text label to indicate it's an image placeholder
          const imageLabel = penpot.createText("📷 " + (elementData.content || "Image"));
          if (imageLabel) {
            imageLabel.x = (elementData.x || 0) + 10;
            imageLabel.y = (elementData.y || 0) + 25;
            imageLabel.fontId = "gfont-work-sans";
            imageLabel.fontSize = "14";
            imageLabel.fills = [{ fillColor: "#666666", fillOpacity: 1 }];
            imageLabel.growType = "auto-width";
            
            elements.push(imageLabel);
          }
        }
        break;

      default:
        console.warn(`Unsupported element type: ${elementData.type}`);
        // Create a rectangle as fallback
        element = penpot.createRectangle();
        if (element) {
          element.x = elementData.x || 0;
          element.y = elementData.y || 0;
          element.fills = [{ fillColor: "#dddddd", fillOpacity: 1 }];
        }
        break;
    }

    if (element) {
      // Apply background color if specified (for shapes)
      if (elementData.backgroundColor && element.fills && elementData.type !== "text") {
        element.fills = [{ fillColor: elementData.backgroundColor, fillOpacity: 1 }];
      }

      elements.push(element);
    }
  });

  console.log(`Created ${elements.length} elements from layout data`);


  if (elements.length > 0) {
    // Try to create a container (board or group)
    console.log(`Created ${elements.length} elements`);
    let container;
    
    try {
      // Try to create a board first
      container = penpot.createBoard();
      if (container) {
        container.name = layoutData.name || "AI Generated Design";
        try {
          container.x = penpot.viewport?.center?.x - 400 || 0;
          container.y = penpot.viewport?.center?.y - 300 || 0;
        } catch (e) {
          container.x = 0;
          container.y = 0;
        }
      }
    } catch (error) {
      console.warn("createBoard not available:", error);
      // If board creation fails, just select all elements
      penpot.selection = elements;
      return;
    }

    if (container) {
      // Add all elements to the container
      elements.forEach((element, index) => {
        try {
          container.appendChild(element);
          console.log(`Added element ${index + 1} to container`);
        } catch (error) {
          console.warn(`Cannot append element ${index + 1} to container:`, error);
        }
      });

      penpot.selection = [container];
      console.log("Created board with all elements");
    } else {
      // If no container could be created, just select all elements
      penpot.selection = elements;
      console.log("Selected all elements directly");
    }
  } else {
    console.error("No elements were created!");
  }
}
