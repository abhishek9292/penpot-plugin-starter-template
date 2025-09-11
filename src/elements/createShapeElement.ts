import type { PathCommand } from "@penpot/plugin-types";

export function createShapeElement(penpot: any ,shapeData: any) {
   let shape: any;
    // Helper to provide defaults
  const sx = shapeData.x ?? 100;
  const sy = shapeData.y ?? 100;
  const sw = shapeData.width ?? 100;
  const sh = shapeData.height ?? 100;

  switch (shapeData.type) {
    case "rectangle":
      shape = penpot.createRectangle();
      break;
    case "circle":
      shape = penpot.createEllipse();
      break;
    case "triangle":
      // Create a path for triangle
      shape = penpot.createPath();
      if (shape) {
        // Simple triangle path
        const commands: PathCommand[] = [
          { command: "M", args: [sx, sy + sh] },        // move to bottom-left
          { command: "L", args: [sx + sw / 2, sy] },    // line to top-center
          { command: "L", args: [sx + sw, sy + sh] },   // line to bottom-right
          { command: "Z" }                              // close path (no args)
        ] as unknown as PathCommand[];

        shape.content = commands;
        // Only set position - dimensions are determined by the path content
        shape.x = sx;
        shape.y = sy;
        // DO NOT set width/height - they are read-only
      }
      break;
    default:
      shape = penpot.createRectangle();
  }

  if (shape && shapeData.type !== "triangle") {
    shape.x = shapeData.x || 100;
    shape.y = shapeData.y || 100;
    // DO NOT set width/height - they are read-only properties
    // Shapes will use their default dimensions
  }

  if (shape && shapeData.fill) {
    shape.fills = [{ fillColor: shapeData.fill, fillOpacity: 1 }];
  }

  if (shape) {
    penpot.selection = [shape];
  }
}
