import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as fabric from 'fabric';

// Make fabric available globally for RibbonToolbar
if (typeof window !== 'undefined') {
  window.fabric = fabric;
}

const CanvasEditor = forwardRef(({
  width = 500,
  height = 500,
  backgroundColor = '#ffffff',
  elements = [],
  palette = {},
  skipInitialElements = false,
  onCanvasReady
}, ref) => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const historyRef = useRef([]);
  const redoRef = useRef([]);

  const saveHistory = () => {
    if (fabricRef.current) {
      const json = JSON.stringify(fabricRef.current.toJSON());
      historyRef.current.push(json);
      redoRef.current = [];
      if (historyRef.current.length > 20) {
        historyRef.current.shift();
      }
    }
  };

  useImperativeHandle(ref, () => ({
    getCanvas: () => fabricRef.current,
    exportPNG: () => {
      if (!fabricRef.current) return null;
      return fabricRef.current.toDataURL({ format: 'png', quality: 1 });
    },
    exportJPEG: () => {
      if (!fabricRef.current) return null;
      return fabricRef.current.toDataURL({ format: 'jpeg', quality: 0.8 });
    },
    exportSVG: () => {
      if (!fabricRef.current) return null;
      return fabricRef.current.toSVG();
    },
    addText: (text, options = {}) => {
      if (!fabricRef.current) return;
      saveHistory();
      const textObj = new fabric.IText(text, {
        left: options.x || 100,
        top: options.y || 100,
        fontSize: options.fontSize || 24,
        fill: options.fill || palette.text || '#333333',
        fontFamily: 'Arial',
        originX: 'left',
        originY: 'top',
        ...options
      });
      fabricRef.current.add(textObj);
      fabricRef.current.setActiveObject(textObj);
      fabricRef.current.renderAll();
    },
    addImage: (url, options = {}) => {
      if (!fabricRef.current) return;
      saveHistory();

      // Handle external URLs with CORS
      fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
        // Scale image if width specified, otherwise default to 200
        const targetWidth = options.scaleToWidth || 200;
        img.scaleToWidth(Math.min(targetWidth, width * 0.8));

        img.set({
          left: options.left || options.top || 100,
          top: options.top || 100,
          ...options
        });

        fabricRef.current.add(img);
        fabricRef.current.setActiveObject(img);
        fabricRef.current.renderAll();
        console.log('Image added to canvas:', url.substring(0, 50) + '...');
      }).catch(err => {
        console.error('Failed to load image:', err);
        // Fallback: add a placeholder rectangle
        const placeholder = new fabric.Rect({
          left: options.left || 100,
          top: options.top || 100,
          width: 150,
          height: 150,
          fill: '#f0f0f0',
          stroke: '#ccc',
          strokeWidth: 2
        });
        fabricRef.current.add(placeholder);
        fabricRef.current.renderAll();
      });
    },

    addRectangle: () => {
      if (!fabricRef.current) return;
      saveHistory();
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        width: 100,
        height: 80,
        fill: palette.primary || '#3B82F6',
        rx: 8,
        ry: 8,
        originX: 'left',
        originY: 'top'
      });
      fabricRef.current.add(rect);
      fabricRef.current.setActiveObject(rect);
      fabricRef.current.renderAll();
    },
    addCircle: () => {
      if (!fabricRef.current) return;
      saveHistory();
      const circle = new fabric.Circle({
        left: 100,
        top: 100,
        radius: 50,
        fill: palette.secondary || '#8B5CF6',
        originX: 'left',
        originY: 'top'
      });
      fabricRef.current.add(circle);
      fabricRef.current.setActiveObject(circle);
      fabricRef.current.renderAll();
    },
    addTriangle: () => {
      if (!fabricRef.current) return;
      saveHistory();
      const triangle = new fabric.Triangle({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill: palette.primary || '#10B981',
        originX: 'left',
        originY: 'top'
      });
      fabricRef.current.add(triangle);
      fabricRef.current.setActiveObject(triangle);
      fabricRef.current.renderAll();
    },
    addLine: () => {
      if (!fabricRef.current) return;
      saveHistory();
      const line = new fabric.Line([50, 100, 200, 100], {
        stroke: palette.text || '#333333',
        strokeWidth: 3,
        originX: 'left',
        originY: 'top'
      });
      fabricRef.current.add(line);
      fabricRef.current.setActiveObject(line);
      fabricRef.current.renderAll();
    },
    setBackgroundColor: (color) => {
      if (!fabricRef.current) return;
      saveHistory();
      fabricRef.current.set('backgroundColor', color);
      fabricRef.current.renderAll();
    },
    updateElement: (id, changes) => {
      if (!fabricRef.current) return;
      saveHistory();
      const objects = fabricRef.current.getObjects();
      const obj = objects.find(o => o.id === id);
      if (obj) {
        obj.set(changes);
        fabricRef.current.renderAll();
      }
    },
    undo: () => {
      if (!fabricRef.current || historyRef.current.length === 0) return;
      const currentState = JSON.stringify(fabricRef.current.toJSON());
      redoRef.current.push(currentState);
      const lastState = historyRef.current.pop();
      fabricRef.current.clear();
      fabricRef.current.loadFromJSON(JSON.parse(lastState)).then(() => {
        fabricRef.current.renderAll();
      });
    },
    redo: () => {
      if (!fabricRef.current || redoRef.current.length === 0) return;
      const currentState = JSON.stringify(fabricRef.current.toJSON());
      historyRef.current.push(currentState);
      const redoState = redoRef.current.pop();
      fabricRef.current.clear();
      fabricRef.current.loadFromJSON(JSON.parse(redoState)).then(() => {
        fabricRef.current.renderAll();
      });
    },
    clearCanvas: () => {
      if (!fabricRef.current) return;
      saveHistory();
      fabricRef.current.clear();
      fabricRef.current.set('backgroundColor', palette.background || '#ffffff');
      fabricRef.current.renderAll();
    },
    deleteSelected: () => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        saveHistory();
        canvas.remove(activeObject);
        canvas.renderAll();
      }
    },
    clearRedoStack: () => {
      redoRef.current = [];
    },
    markSaved: () => {
      redoRef.current = [];
    },
    getHistoryStatus: () => ({
      canUndo: historyRef.current.length > 0,
      canRedo: redoRef.current.length > 0
    }),
    toJSON: () => {
      if (!fabricRef.current) return null;
      return fabricRef.current.toJSON();
    },
    loadFromJSON: async (json) => {
      if (!fabricRef.current || !json) return;
      try {
        await fabricRef.current.loadFromJSON(json);
        fabricRef.current.renderAll();
      } catch (e) {
        console.error('Failed to load canvas from JSON:', e);
      }
    },
    setElementsFromState: (newElements) => {
      if (!fabricRef.current) return;
      saveHistory();
      const canvas = fabricRef.current;
      canvas.clear();
      canvas.set('backgroundColor', palette.background || backgroundColor);
      renderElements(canvas, newElements);
      canvas.renderAll();
    }
  }));

  // Helper function to render elements on canvas
  // ALL elements use originX: 'left', originY: 'top' for predictable positioning
  const renderElements = (canvas, elementsList) => {
    elementsList.forEach(element => {
      // Calculate absolute positions from relative (0-1) coordinates
      const x = element.x * width;
      const y = element.y * height;
      const w = element.width * width;
      const h = element.height * height;

      if (element.id === 'logo' || element.type === 'logo') {
        // Logo: Single rect with text overlay
        const rect = new fabric.Rect({
          left: x,
          top: y,
          width: w,
          height: h,
          fill: palette.primary || '#E41C2A',
          rx: 8,
          ry: 8,
          originX: 'left',
          originY: 'top',
          id: 'logo-bg'
        });
        const text = new fabric.Text('🏪 Logo', {
          left: x + w / 2,
          top: y + h / 2,
          fontSize: Math.max(12, Math.min(14, h * 0.4)),
          fill: '#ffffff',
          originX: 'center',
          originY: 'center',
          id: 'logo-text'
        });
        canvas.add(rect, text);
      } else if (element.id === 'headline' || element.type === 'headline') {
        // Headline text - positioned at TOP-LEFT
        const text = new fabric.IText(element.text || 'Your Headline Here', {
          left: x,
          top: y,
          fontSize: Math.max(16, Math.min(28, h * 0.8)),
          fill: palette.text || '#333333',
          fontFamily: 'Arial',
          fontWeight: 'bold',
          originX: 'left',
          originY: 'top',
          id: 'headline',
          width: w,
          textAlign: 'center'
        });
        canvas.add(text);
      } else if (element.id === 'subtext' || element.type === 'subtext') {
        const text = new fabric.IText(element.text || 'Subtext here', {
          left: x,
          top: y,
          fontSize: Math.max(12, Math.min(20, h * 0.8)),
          fill: palette.text || '#666666',
          fontFamily: 'Arial',
          originX: 'left',
          originY: 'top',
          id: 'subtext',
          width: w,
          textAlign: 'center'
        });
        canvas.add(text);
      } else if (element.id === 'cta' || element.type === 'cta') {
        // CTA: Rect + centered text
        const ctaText = element.text || 'Shop Now';
        const rect = new fabric.Rect({
          left: x,
          top: y,
          width: w,
          height: h,
          fill: palette.primary || '#E41C2A',
          rx: Math.min(20, h / 2),
          ry: Math.min(20, h / 2),
          originX: 'left',
          originY: 'top',
          id: 'cta-bg'
        });
        const text = new fabric.Text(ctaText, {
          left: x + w / 2,
          top: y + h / 2,
          fontSize: Math.max(12, Math.min(16, h * 0.5)),
          fill: '#ffffff',
          fontWeight: 'bold',
          originX: 'center',
          originY: 'center',
          id: 'cta-text'
        });
        canvas.add(rect, text);
      } else if (element.id === 'packshot' || element.type === 'packshot') {
        // Packshot: Box + centered label
        const rect = new fabric.Rect({
          left: x,
          top: y,
          width: w,
          height: h,
          fill: '#f0f0f0',
          stroke: '#cccccc',
          strokeWidth: 2,
          rx: 8,
          ry: 8,
          originX: 'left',
          originY: 'top',
          id: 'packshot-bg'
        });
        const text = new fabric.Text('📦 Product', {
          left: x + w / 2,
          top: y + h / 2,
          fontSize: Math.max(12, Math.min(16, h * 0.1)),
          fill: '#888888',
          originX: 'center',
          originY: 'center',
          id: 'packshot-text'
        });
        canvas.add(rect, text);
      }
    });
  };

  // Track if canvas has been initialized
  const isInitializedRef = useRef(false);
  const prevDimensionsRef = useRef({ width, height });

  // Initialize canvas ONCE on mount - empty dependency array!
  useEffect(() => {
    if (isInitializedRef.current) return; // Safety check

    // Initialize Fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: palette.background || backgroundColor,
    });

    fabricRef.current = canvas;
    isInitializedRef.current = true;
    prevDimensionsRef.current = { width, height };

    if (onCanvasReady) {
      onCanvasReady(canvas);
    }

    // Render elements if provided (skip if we're going to load from JSON)
    if (elements.length > 0 && !skipInitialElements) {
      renderElements(canvas, elements);
    }

    canvas.renderAll();

    // Track object modifications for undo/redo
    let isModifying = false;

    canvas.on('mouse:down', () => {
      if (canvas.getActiveObject()) {
        const json = JSON.stringify(canvas.toJSON());
        if (!isModifying) {
          isModifying = true;
          historyRef.current.push(json);
          redoRef.current = [];
          if (historyRef.current.length > 20) {
            historyRef.current.shift();
          }
        }
      }
    });

    canvas.on('mouse:up', () => {
      isModifying = false;
    });

    // Cleanup only on unmount
    return () => {
      canvas.dispose();
      isInitializedRef.current = false;
    };
  }, []); // EMPTY dependency array - initialize ONCE only!

  // Handle dimension changes separately (resize in-place without reinitializing)
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !isInitializedRef.current) return;

    // Only resize if dimensions actually changed
    if (prevDimensionsRef.current.width === width && prevDimensionsRef.current.height === height) {
      return;
    }

    // Resize canvas in place
    canvas.setDimensions({ width, height });
    canvas.renderAll();
    prevDimensionsRef.current = { width, height };
    console.log('CanvasEditor: dimensions updated to', width, height);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px'
      }}
    />
  );
});

CanvasEditor.displayName = 'CanvasEditor';

export default CanvasEditor;
