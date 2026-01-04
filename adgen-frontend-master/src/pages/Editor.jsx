import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CanvasEditor from "../components/CanvasEditor";
import ChatInterface from "../components/ChatInterface";
import LayersPanel from "../components/LayersPanel";
import { generateAd, checkCompliance, chat } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Download,
  Sparkles,
  MessageSquare,
  CheckCircle,
  Loader2,
  ChevronLeft,
  Palette,
  Type,
  Image,
  X,
  Save,
  Trash2,
  Undo,
  Redo,
  Square,
  Circle,
  Triangle,
  Minus,
  Shapes,
  FileImage,
  FileCode,
  ZoomIn,
  ZoomOut,
  Layers
} from "lucide-react";

export default function Editor() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const savedCanvasJSONRef = useRef(null); // For loading saved canvas state
  const isInitializedRef = useRef(false); // Prevents auto-save until load is complete
  const [showChat, setShowChat] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);
  const [complianceScore, setComplianceScore] = useState(null);
  const [showComplianceDetails, setShowComplianceDetails] = useState(false);
  const [activePanel, setActivePanel] = useState(null); // 'image' | 'text' | 'palette' | 'layers'
  const [fabricCanvas, setFabricCanvas] = useState(null); // Live canvas reference for LayersPanel
  const [showTemplates, setShowTemplates] = useState(() => {
    const show = sessionStorage.getItem('showTemplates') === 'true';
    sessionStorage.removeItem('showTemplates');
    return show;
  });

  // Pre-built ad templates
  const AD_TEMPLATES = [
    {
      id: 'sale',
      name: 'Flash Sale',
      preview: '🔥',
      colors: { background: '#FF4444', primary: '#FFFFFF', text: '#FFFFFF' },
      elements: [
        { id: 'headline', type: 'headline', x: 0.1, y: 0.35, width: 0.8, height: 0.15, text: 'FLASH SALE!' },
        { id: 'subtext', type: 'subtext', x: 0.15, y: 0.52, width: 0.7, height: 0.1, text: 'Up to 50% OFF' },
        { id: 'cta', type: 'cta', x: 0.25, y: 0.7, width: 0.5, height: 0.1, text: 'Shop Now' }
      ]
    },
    {
      id: 'product',
      name: 'Product Hero',
      preview: '📦',
      colors: { background: '#FFFFFF', primary: '#3B82F6', text: '#1F2937' },
      elements: [
        { id: 'logo', type: 'logo', x: 0.05, y: 0.03, width: 0.15, height: 0.08 },
        { id: 'packshot', type: 'packshot', x: 0.2, y: 0.15, width: 0.6, height: 0.45 },
        { id: 'headline', type: 'headline', x: 0.1, y: 0.65, width: 0.8, height: 0.1, text: 'Premium Quality' },
        { id: 'cta', type: 'cta', x: 0.3, y: 0.8, width: 0.4, height: 0.08, text: 'Buy Now' }
      ]
    },
    {
      id: 'minimal',
      name: 'Minimal Clean',
      preview: '✨',
      colors: { background: '#F9FAFB', primary: '#111827', text: '#374151' },
      elements: [
        { id: 'headline', type: 'headline', x: 0.1, y: 0.4, width: 0.8, height: 0.1, text: 'Less is More' },
        { id: 'subtext', type: 'subtext', x: 0.2, y: 0.55, width: 0.6, height: 0.08, text: 'Discover simplicity' },
        { id: 'cta', type: 'cta', x: 0.35, y: 0.75, width: 0.3, height: 0.08, text: 'Explore' }
      ]
    },
    {
      id: 'grocery',
      name: 'Grocery Store',
      preview: '🛒',
      colors: { background: '#E41C2A', primary: '#FFFFFF', text: '#FFFFFF' },
      elements: [
        { id: 'logo', type: 'logo', x: 0.35, y: 0.02, width: 0.3, height: 0.1 },
        { id: 'headline', type: 'headline', x: 0.1, y: 0.2, width: 0.8, height: 0.12, text: 'Weekly Deals!' },
        { id: 'packshot', type: 'packshot', x: 0.15, y: 0.35, width: 0.7, height: 0.35 },
        { id: 'cta', type: 'cta', x: 0.25, y: 0.78, width: 0.5, height: 0.1, text: 'Shop Deals' }
      ]
    },
    {
      id: 'fashion',
      name: 'Fashion Style',
      preview: '👗',
      colors: { background: '#FDF2F8', primary: '#DB2777', text: '#831843' },
      elements: [
        { id: 'headline', type: 'headline', x: 0.1, y: 0.1, width: 0.8, height: 0.1, text: 'New Collection' },
        { id: 'packshot', type: 'packshot', x: 0.1, y: 0.25, width: 0.8, height: 0.45 },
        { id: 'subtext', type: 'subtext', x: 0.15, y: 0.72, width: 0.7, height: 0.08, text: 'Spring 2024' },
        { id: 'cta', type: 'cta', x: 0.3, y: 0.85, width: 0.4, height: 0.08, text: 'Shop Now' }
      ]
    },
    {
      id: 'tech',
      name: 'Tech Launch',
      preview: '📱',
      colors: { background: '#0F172A', primary: '#3B82F6', text: '#F8FAFC' },
      elements: [
        { id: 'headline', type: 'headline', x: 0.1, y: 0.15, width: 0.8, height: 0.12, text: 'Next Level Innovation' },
        { id: 'packshot', type: 'packshot', x: 0.2, y: 0.3, width: 0.6, height: 0.4 },
        { id: 'subtext', type: 'subtext', x: 0.15, y: 0.73, width: 0.7, height: 0.08, text: 'The future is here' },
        { id: 'cta', type: 'cta', x: 0.3, y: 0.85, width: 0.4, height: 0.08, text: 'Pre-order' }
      ]
    }
  ];

  // Apply template to canvas
  const applyTemplate = (template) => {
    setElements(template.elements);
    setPalette({
      background: template.colors.background,
      primary: template.colors.primary,
      secondary: template.colors.primary,
      text: template.colors.text
    });

    // Clear canvas and reload with template
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
      canvasRef.current.setBackgroundColor(template.colors.background);
      canvasRef.current.setElementsFromState(template.elements);
    }

    setShowTemplates(false);
  };

  // Read saved state once during initialization
  const [savedState] = useState(() => {
    try {
      const saved = localStorage.getItem('adgen_editor_state');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  // Helper to get responsive layout based on aspect ratio
  const getResponsiveLayout = (width, height) => {
    const isLandscape = width > height * 1.2; // Significantly wider than tall

    if (isLandscape) {
      // Landscape Layout (Centered with Logo Left)
      return [
        { id: 'logo', type: 'logo', x: 0.05, y: 0.1, width: 0.15, height: 0.15 }, // Top Left
        { id: 'headline', type: 'headline', x: 0.25, y: 0.1, width: 0.5, height: 0.15, text: 'Your Headline Here' }, // Top Center
        { id: 'packshot', type: 'packshot', x: 0.35, y: 0.3, width: 0.3, height: 0.4 }, // Center Middle
        { id: 'cta', type: 'cta', x: 0.35, y: 0.75, width: 0.3, height: 0.15, text: 'Shop Now' } // Bottom Center
      ];
    } else {
      // Portrait/Square Layout (Stacked)
      return [
        { id: 'logo', type: 'logo', x: 0.05, y: 0.05, width: 0.2, height: 0.08 },
        { id: 'packshot', type: 'packshot', x: 0.15, y: 0.25, width: 0.7, height: 0.4 },
        { id: 'headline', type: 'headline', x: 0.1, y: 0.7, width: 0.8, height: 0.1, text: 'Your Headline Here' },
        { id: 'cta', type: 'cta', x: 0.25, y: 0.85, width: 0.5, height: 0.08, text: 'Shop Now' }
      ];
    }
  };

  // Default elements - initialized using the helper 
  const DEFAULT_ELEMENTS = getResponsiveLayout(400, 400);

  const DEFAULT_PALETTE = {
    primary: '#E41C2A',
    secondary: '#00539F',
    background: '#ffffff',
    text: '#333333'
  };

  // Initialize savedCanvasJSONRef synchronously
  if (!isInitializedRef.current && savedState?.canvasJSON && !savedCanvasJSONRef.current) {
    savedCanvasJSONRef.current = savedState.canvasJSON;
  }

  // Canvas state
  const [elements, setElements] = useState(() => savedState?.elements || DEFAULT_ELEMENTS);
  const [palette, setPalette] = useState(() => savedState?.palette || DEFAULT_PALETTE);

  // Aspect ratio presets with platform labels
  const ASPECT_RATIOS = [
    // Social Media - Square
    { id: '1:1', label: 'Square', platform: 'Instagram Post', width: 400, height: 400, icon: '📷' },
    // Social Media - Portrait
    { id: '4:5', label: 'Portrait', platform: 'Instagram Feed', width: 400, height: 500, icon: '📱' },
    { id: '9:16', label: 'Story', platform: 'Instagram/TikTok', width: 360, height: 640, icon: '📲' },
    // Social Media - Landscape
    { id: '16:9', label: 'Landscape', platform: 'YouTube/Twitter', width: 480, height: 270, icon: '🖥️' },
    { id: '1.91:1', label: 'Wide', platform: 'Facebook/LinkedIn', width: 500, height: 262, icon: '🌐' },
    // Print Posters
    { id: 'A4', label: 'A4 Poster', platform: 'Print (210×297mm)', width: 420, height: 594, icon: '📄' },
    { id: 'Letter', label: 'US Letter', platform: 'Print (8.5×11in)', width: 408, height: 528, icon: '📃' },
    { id: 'A3', label: 'A3 Poster', platform: 'Large Print', width: 400, height: 566, icon: '🖼️' },
    // Social Banners
    { id: 'fb-cover', label: 'Cover Photo', platform: 'Facebook Cover', width: 500, height: 185, icon: '🏞️' },
    { id: 'twitter-header', label: 'Header', platform: 'Twitter/X', width: 500, height: 167, icon: '🐦' },
    { id: 'linkedin-banner', label: 'Banner', platform: 'LinkedIn', width: 500, height: 128, icon: '💼' },
    // Special
    { id: 'pinterest', label: 'Pin', platform: 'Pinterest', width: 400, height: 600, icon: '📌' },
  ];

  // Current selected ratio
  const [selectedRatio, setSelectedRatio] = useState(() => savedState?.selectedRatio || '1:1');

  // Canvas size based on aspect ratio
  const [canvasSize, setCanvasSize] = useState(() => {
    if (savedState?.selectedRatio) {
      const ratio = ASPECT_RATIOS.find(r => r.id === savedState.selectedRatio);
      if (ratio) return { width: ratio.width, height: ratio.height };
    }
    return { width: 400, height: 400 };
  });

  // Key to force canvas re-render when AI generates new layout
  const [canvasKey, setCanvasKey] = useState(0);

  // Current project being edited (if opened from Files panel)
  const [currentProject, setCurrentProject] = useState(() => {
    const opened = sessionStorage.getItem('openedProject');
    if (opened) {
      sessionStorage.removeItem('openedProject');
      return JSON.parse(opened);
    }
    return null;
  });

  // Project name for saving (initialize from currentProject or default)
  const [projectName, setProjectName] = useState(() => {
    const opened = sessionStorage.getItem('openedProject');
    if (opened) {
      try {
        return JSON.parse(opened).name || 'Untitled Project';
      } catch { return 'Untitled Project'; }
    }
    return 'Untitled Project';
  });
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Zoom level for canvas display (doesn't affect export)
  const [zoomLevel, setZoomLevel] = useState(() => savedState?.zoomLevel || 1);
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2;
  const ZOOM_STEP = 0.1;

  // Stable callback for canvas ready - prevents infinite re-renders
  const handleCanvasReady = useCallback((canvas) => {
    setFabricCanvas(canvas);
  }, []);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SMART LAYOUT ALGORITHM - Intelligently repositions elements like a designer
  // ═══════════════════════════════════════════════════════════════════════════

  // Classify element by its role based on id, type, or content
  const classifyElement = (obj) => {
    const id = (obj.id || '').toLowerCase();
    const type = (obj.type || '').toLowerCase();
    const text = (obj.text || '').toLowerCase();

    // Logo elements
    if (id.includes('logo') || text.includes('logo') || text.includes('🏪')) {
      return 'logo';
    }
    // CTA buttons
    if (id.includes('cta') || text.includes('shop') || text.includes('buy') ||
      text.includes('order') || text.includes('get') || text.includes('learn')) {
      return 'cta';
    }
    // Headlines (large text, titles)
    if (id.includes('headline') || id.includes('title') ||
      (type === 'i-text' && (obj.fontSize || 20) >= 20)) {
      return 'headline';
    }
    // Product/packshot images
    if (id.includes('packshot') || id.includes('product') ||
      text.includes('product') || text.includes('📦')) {
      return 'packshot';
    }
    // Images
    if (type === 'image' || type === 'fabricimage') {
      return 'image';
    }
    // Subtext
    if (id.includes('subtext') || (type === 'i-text' && (obj.fontSize || 20) < 20)) {
      return 'subtext';
    }
    // Shapes (decorative)
    if (type === 'rect' || type === 'circle' || type === 'triangle' || type === 'line') {
      return 'shape';
    }
    return 'other';
  };

  // Get target zone for each element role
  const getZoneForRole = (role) => {
    const zoneMap = {
      'logo': 'header',
      'headline': 'content',
      'subtext': 'content',
      'cta': 'cta',
      'packshot': 'hero',
      'image': 'hero',
      'shape': 'background',
      'other': 'content'
    };
    return zoneMap[role] || 'content';
  };

  // Handle ratio change - SMART LAYOUT ALGORITHM
  const handleRatioChange = async (ratio) => {
    try {
      const oldWidth = canvasSize.width;
      const oldHeight = canvasSize.height;
      const newWidth = ratio.width;
      const newHeight = ratio.height;

      if (ratio.id === selectedRatio) return;

      const canvas = canvasRef.current?.getCanvas();
      if (!canvas) {
        setSelectedRatio(ratio.id);
        setCanvasSize({ width: newWidth, height: newHeight });
        setZoomLevel(1);
        return;
      }

      const currentJSON = canvas.toJSON();
      const currentBackground = canvas.backgroundColor || '#ffffff';

      // Determine layout type
      const aspectRatio = newWidth / newHeight;
      const isPortrait = aspectRatio < 0.9;    // Taller than wide
      const isLandscape = aspectRatio > 1.2;   // Wider than tall
      const isSquare = !isPortrait && !isLandscape;

      // Define semantic zones based on aspect ratio
      const zones = isPortrait ? {
        header: { top: 0, height: newHeight * 0.12, centerY: newHeight * 0.06 },
        hero: { top: newHeight * 0.12, height: newHeight * 0.40, centerY: newHeight * 0.32 },
        content: { top: newHeight * 0.52, height: newHeight * 0.28, centerY: newHeight * 0.66 },
        cta: { top: newHeight * 0.80, height: newHeight * 0.18, centerY: newHeight * 0.89 },
        background: { top: 0, height: newHeight, centerY: newHeight * 0.5 }
      } : isLandscape ? {
        header: { top: 0, height: newHeight * 0.18, centerY: newHeight * 0.09 },
        hero: { top: newHeight * 0.15, height: newHeight * 0.50, centerY: newHeight * 0.40 },
        content: { top: newHeight * 0.45, height: newHeight * 0.30, centerY: newHeight * 0.60 },
        cta: { top: newHeight * 0.75, height: newHeight * 0.22, centerY: newHeight * 0.86 },
        background: { top: 0, height: newHeight, centerY: newHeight * 0.5 }
      } : {
        // Square - balanced layout
        header: { top: 0, height: newHeight * 0.15, centerY: newHeight * 0.075 },
        hero: { top: newHeight * 0.15, height: newHeight * 0.40, centerY: newHeight * 0.35 },
        content: { top: newHeight * 0.55, height: newHeight * 0.25, centerY: newHeight * 0.675 },
        cta: { top: newHeight * 0.80, height: newHeight * 0.18, centerY: newHeight * 0.89 },
        background: { top: 0, height: newHeight, centerY: newHeight * 0.5 }
      };

      // Calculate scale factors (for proportional fallback)
      const scaleX = newWidth / oldWidth;
      const scaleY = newHeight / oldHeight;

      // SMART LAYOUT: Classify and reposition each element
      if (currentJSON.objects && currentJSON.objects.length > 0) {
        // Group elements by their role
        const classified = currentJSON.objects.map(obj => ({
          obj,
          role: classifyElement(obj),
          zone: getZoneForRole(classifyElement(obj)),
          width: (obj.width || 100) * (obj.scaleX || 1),
          height: (obj.height || 50) * (obj.scaleY || 1)
        }));

        // Track vertical positions within each zone
        const zoneOffsets = {
          header: zones.header.top + 10,
          hero: zones.hero.top + 10,
          content: zones.content.top + 10,
          cta: zones.cta.top + 10,
          background: 0
        };

        // Reposition each element smartly
        currentJSON.objects = classified.map(({ obj, role, zone, width, height }) => {
          const targetZone = zones[zone];

          // CENTER HORIZONTALLY (all elements)
          if (obj.left !== undefined) {
            // Calculate relative horizontal position (0 = left edge, 1 = right edge)
            const relativeX = (obj.left + width / 2) / oldWidth;
            // Apply to new width, keeping relative position
            obj.left = (relativeX * newWidth) - width / 2;

            // Ensure within bounds
            obj.left = Math.max(10, Math.min(newWidth - width - 10, obj.left));
          }

          // SMART VERTICAL POSITIONING based on role
          if (obj.top !== undefined) {
            if (role === 'logo') {
              // Logo: Always at top center of header zone
              obj.top = targetZone.centerY - height / 2;
            } else if (role === 'cta') {
              // CTA: Always at bottom, centered in CTA zone
              obj.top = targetZone.centerY - height / 2;
            } else if (role === 'packshot' || role === 'image') {
              // Images: Center of hero zone, scale if needed
              obj.top = targetZone.centerY - height / 2;

              // Scale image to fit zone if too large
              if (width > newWidth * 0.8) {
                const scaleFactor = (newWidth * 0.7) / width;
                obj.scaleX = (obj.scaleX || 1) * scaleFactor;
                obj.scaleY = (obj.scaleY || 1) * scaleFactor;
              }
            } else if (role === 'headline') {
              // Headlines: Top of content zone
              obj.top = targetZone.top + 15;
            } else if (role === 'subtext') {
              // Subtext: Below headline in content zone
              obj.top = targetZone.centerY;
            } else if (role === 'shape') {
              // Shapes: Scale position proportionally
              obj.top = obj.top * scaleY;
              obj.left = obj.left * scaleX;
            } else {
              // Other: proportional scaling
              obj.top = obj.top * scaleY;
            }

            // Ensure within canvas bounds
            obj.top = Math.max(5, Math.min(newHeight - height - 5, obj.top));
          }

          // Handle line coordinates
          if (obj.x1 !== undefined) {
            obj.x1 = obj.x1 * scaleX;
            obj.y1 = obj.y1 * scaleY;
            obj.x2 = obj.x2 * scaleX;
            obj.y2 = obj.y2 * scaleY;
          }

          return obj;
        });
      }

      // Apply changes to canvas
      canvas.setDimensions({ width: newWidth, height: newHeight });
      canvas.set('backgroundColor', currentBackground);

      try {
        canvas.clear();
        canvas.set('backgroundColor', currentBackground);
        await canvas.loadFromJSON(currentJSON);
        canvas.renderAll();
        console.log('Smart Layout applied:', currentJSON.objects?.length, 'objects repositioned for',
          isPortrait ? 'PORTRAIT' : isLandscape ? 'LANDSCAPE' : 'SQUARE');
      } catch (e) {
        console.error('Failed to apply smart layout:', e);
      }

      savedCanvasJSONRef.current = canvas.toJSON();
      setSelectedRatio(ratio.id);
      setCanvasSize({ width: newWidth, height: newHeight });
      setZoomLevel(1);
    } catch (error) {
      console.error('handleRatioChange error:', error);
    }
  };

  // Load generated content from session (templates)
  useEffect(() => {
    const saved = sessionStorage.getItem('generatedAd');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.layout?.elements) setElements(data.layout.elements);
        if (data.layout?.palette) setPalette(data.layout.palette);

        // Clear the saved canvas JSON so template takes priority over localStorage
        savedCanvasJSONRef.current = null;
        localStorage.removeItem('adgen_canvas_json');

        // Apply aspect ratio from saved data
        if (data.aspectRatio) {
          const foundRatio = ASPECT_RATIOS.find(r => r.id === data.aspectRatio);
          if (foundRatio) {
            setSelectedRatio(foundRatio.id);
            setCanvasSize({ width: foundRatio.width, height: foundRatio.height });
          } else {
            // Fallback for old format ratios
            setSelectedRatio(data.aspectRatio);
            switch (data.aspectRatio) {
              case '1:1':
                setCanvasSize({ width: 400, height: 400 });
                break;
              case '16:9':
                setCanvasSize({ width: 480, height: 270 });
                break;
              case '9:16':
                setCanvasSize({ width: 360, height: 640 });
                break;
              default:
                setCanvasSize({ width: 400, height: 400 });
            }
          }
        }

        // Update canvas imperatively after a delay to ensure canvas is mounted
        setTimeout(() => {
          if (canvasRef.current && data.layout?.elements) {
            canvasRef.current.setBackgroundColor(data.layout.palette?.background || '#ffffff');
            canvasRef.current.setElementsFromState(data.layout.elements);
          }
        }, 300);

        // Remove from session once loaded
        sessionStorage.removeItem('generatedAd');
      } catch (e) {
        console.error("Failed to load generated ad:", e);
      }
    }
  }, []);

  // Load external image from AI Image Studio
  useEffect(() => {
    const externalImage = sessionStorage.getItem('editor_external_image');
    if (externalImage) {
      setTimeout(() => {
        if (canvasRef.current) {
          canvasRef.current.addImage(externalImage);
          sessionStorage.removeItem('editor_external_image');
        }
      }, 500); // Small delay to ensure canvas is ready
    }
  }, []);

  // Load saved canvas JSON after canvas is mounted
  useEffect(() => {
    const loadSavedCanvas = async () => {
      if (savedCanvasJSONRef.current && canvasRef.current) {
        // Small delay to ensure canvas is fully ready
        await new Promise(resolve => setTimeout(resolve, 500));
        await canvasRef.current.loadFromJSON(savedCanvasJSONRef.current);
        savedCanvasJSONRef.current = null; // Clear after loading
        console.log('Loaded saved canvas from localStorage');
      }
      // Mark as initialized so auto-save can start
      isInitializedRef.current = true;
    };
    loadSavedCanvas();
  }, [canvasKey]); // Re-run when canvas key changes

  // Load opened project canvas data
  useEffect(() => {
    if (currentProject?.canvasData && canvasRef.current) {
      setTimeout(async () => {
        try {
          await canvasRef.current.loadFromJSON(currentProject.canvasData);
          console.log('Loaded project:', currentProject.name);
        } catch (e) {
          console.error('Failed to load project canvas:', e);
        }
      }, 400);
    }
  }, [currentProject]);

  // Save current work to project
  const handleSaveProject = useCallback(() => {
    if (!canvasRef.current) return;

    const canvasData = canvasRef.current.toJSON();
    const thumbnail = canvasRef.current.exportPNG();

    // Get existing projects
    const projects = JSON.parse(localStorage.getItem('adgen_projects') || '[]');

    if (currentProject) {
      // Update existing project
      const index = projects.findIndex(p => p.id === currentProject.id);
      if (index !== -1) {
        projects[index] = {
          ...projects[index],
          name: projectName,
          canvasData,
          thumbnail,
          date: 'Just now',
          aspectRatio: selectedRatio
        };
        setCurrentProject(projects[index]);
      }
    } else {
      // Create new project
      const newProject = {
        id: Date.now(),
        name: projectName,
        date: 'Just now',
        thumbnail,
        canvasData,
        aspectRatio: selectedRatio
      };
      projects.unshift(newProject);
      setCurrentProject(newProject);
    }

    localStorage.setItem('adgen_projects', JSON.stringify(projects));

    // Clear redo stack after save
    if (canvasRef.current) {
      canvasRef.current.markSaved();
    }

    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  }, [currentProject, selectedRatio, projectName]);

  // Auto-save editor state to localStorage (runs every 3 seconds)
  useEffect(() => {
    const saveState = () => {
      // Don't save until initialization is complete
      if (!isInitializedRef.current) {
        console.log('Skipping auto-save - not initialized yet');
        return;
      }

      const canvasJSON = canvasRef.current?.toJSON?.() || canvasRef.current?.getCanvas()?.toJSON();
      const state = {
        elements,
        palette,
        selectedRatio,
        zoomLevel,
        canvasJSON: canvasJSON,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('adgen_editor_state', JSON.stringify(state));
      console.log('Auto-saved editor state');
    };

    // Delay initial save to allow load to complete first
    const initialTimeout = setTimeout(saveState, 1000);

    // Also set up interval for periodic saves (catches canvas-only changes)
    const intervalId = setInterval(saveState, 3000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [elements, palette, selectedRatio, zoomLevel]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Z = Undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        canvasRef.current?.undo();
      }
      // Ctrl+Y or Ctrl+Shift+Z = Redo
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        canvasRef.current?.redo();
      }
      // Ctrl+S = Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSaveProject();
      }
      // Delete or Backspace = Delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Only if not typing in an input
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          canvasRef.current?.deleteSelected();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleActionsReceived = (actions) => {
    console.log('Applying actions:', actions);

    let needsRerender = false;

    actions.forEach(action => {
      if (action.type === 'layout' && action.changes) {
        setElements(prev => prev.map(el => {
          if (el.id === action.target || el.type === action.target) {
            return { ...el, ...action.changes };
          }
          return el;
        }));

        if (canvasRef.current) {
          canvasRef.current.updateElement(action.target, action.changes);
        }
        needsRerender = true;
      }

      if (action.type === 'color' && action.changes) {
        setPalette(prev => ({ ...prev, ...action.changes }));

        if (action.changes.background && canvasRef.current) {
          canvasRef.current.setBackgroundColor(action.changes.background);
        }
        needsRerender = true;
      }

      if (action.type === 'copy' && action.changes) {
        setElements(prev => prev.map(el => {
          if (el.id === action.target || el.type === action.target) {
            return { ...el, text: action.changes.text };
          }
          return el;
        }));

        // Also update text directly on canvas
        if (canvasRef.current && action.changes.text) {
          const canvas = canvasRef.current.getCanvas();
          if (canvas) {
            const objects = canvas.getObjects();
            const textObj = objects.find(obj => obj.id === action.target || obj.type?.includes('text'));
            if (textObj) {
              textObj.set('text', action.changes.text);
              canvas.renderAll();
            }
          }
        }
        needsRerender = true;
      }

      // Handle adding new text
      if (action.type === 'addText' && action.changes?.text) {
        if (canvasRef.current) {
          canvasRef.current.addText(action.changes.text, action.changes);
        }
      }
    });

    // Note: We intentionally DO NOT increment canvasKey here.
    // Incrementing key forces a remount which clears the undo history.
    // The canvas is updated imperatively via canvasRef, so visual changes show immediately.
  };

  const handleAIMagic = async () => {
    setIsGenerating(true);
    try {
      // If we have content, ask AI to enhance it
      if (elements.length > 0) {
        const result = await chat({
          message: "Enhance this design layout to look more professional and visually appealing. Keep the text content but improve positioning, colors, and sizing.",
          canvasState: { elements, palette },
          brand: 'Tesco', // TODO: Make dynamic
          platform: 'instagram_story', // Using default for now
          chatHistory: []
        });

        if (result.actions) {
          handleActionsReceived(result.actions);
        }
      } else {
        // Empty canvas - generate fresh ad
        const result = await generateAd({
          brand: 'Tesco',
          product: 'Summer Sale',
          platform: 'instagram_story'
        });

        if (result.layout?.elements && canvasRef.current) {
          // Use our new method that preserves history
          setElements(result.layout.elements);
          if (result.layout.palette) setPalette(result.layout.palette);

          canvasRef.current.setElementsFromState(result.layout.elements);
        }
      }

      // Removed setCanvasKey here to preserve history
    } catch (error) {
      console.error('AI Magic failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckCompliance = async () => {
    setIsCheckingCompliance(true);
    try {
      const result = await checkCompliance({
        canvasData: { elements, palette },
        brand: 'Tesco' // Default to Tesco for demo
      });
      setComplianceScore(result);
      if (result.status !== 'PASS') {
        setShowComplianceDetails(true);
      }
    } catch (error) {
      console.error('Compliance check failed:', error);
    } finally {
      setIsCheckingCompliance(false);
    }
  };

  const handleExport = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.exportPNG();
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = 'adgen-poster.png';
        link.href = dataUrl;
        link.click();
      }
    }
  };

  // Sidebar tool functions
  const handleAddText = () => {
    if (canvasRef.current) {
      canvasRef.current.addText('New Text', { x: 150, y: 200, fontSize: 24 });
    }
    setActivePanel(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && canvasRef.current) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (dataUrl) {
          canvasRef.current.addImage(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
    setActivePanel(null);
  };

  const handleColorChange = (colorType, color) => {
    setPalette(prev => ({ ...prev, [colorType]: color }));
    if (colorType === 'background' && canvasRef.current) {
      canvasRef.current.setBackgroundColor(color);
    }
  };

  // Project Management
  const { incrementStat } = useAuth();

  const handleDeleteSelected = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current.getCanvas();
      if (canvas) {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          canvas.remove(activeObject);
          canvas.renderAll();
        }
      }
    }
  };

  const handleExportWithTracking = () => {
    handleExport();
    incrementStat('exports');
  };

  const handleUndo = () => {
    if (canvasRef.current) {
      canvasRef.current.undo();
    }
  };

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-16 bg-blue-700 flex flex-col items-center py-4 gap-4">
        <button onClick={() => navigate("/")} className="p-3 bg-white rounded-xl text-blue-700">
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Image Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 bg-white/20 rounded-xl text-white hover:bg-white/30"
          title="Add Image"
        >
          <Image className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Text Button */}
        <button
          onClick={handleAddText}
          className="p-3 bg-white/20 rounded-xl text-white hover:bg-white/30"
          title="Add Text"
        >
          <Type className="w-5 h-5" />
        </button>

        {/* Palette Button */}
        <button
          onClick={() => setActivePanel(activePanel === 'palette' ? null : 'palette')}
          className={`p-3 rounded-xl ${activePanel === 'palette' ? 'bg-white text-blue-700' : 'bg-white/20 text-white hover:bg-white/30'}`}
          title="Color Palette"
        >
          <Palette className="w-5 h-5" />
        </button>

        {/* Shapes Button */}
        <button
          onClick={() => setActivePanel(activePanel === 'shapes' ? null : 'shapes')}
          className={`p-3 rounded-xl ${activePanel === 'shapes' ? 'bg-white text-blue-700' : 'bg-white/20 text-white hover:bg-white/30'}`}
          title="Add Shapes"
        >
          <Shapes className="w-5 h-5" />
        </button>

        {/* Layers Button */}
        <button
          onClick={() => setActivePanel(activePanel === 'layers' ? null : 'layers')}
          className={`p-3 rounded-xl ${activePanel === 'layers' ? 'bg-white text-blue-700' : 'bg-white/20 text-white hover:bg-white/30'}`}
          title="Layers"
        >
          <Layers className="w-5 h-5" />
        </button>

        {/* Save Project */}
        <button
          onClick={handleSaveProject}
          className="p-3 bg-white/20 rounded-xl text-white hover:bg-green-500 transition"
          title="Save Project (Ctrl+S)"
        >
          <Save className="w-5 h-5" />
        </button>

        <div className="flex-1" />

        {/* Chat Toggle */}
        <button
          onClick={() => setShowChat(!showChat)}
          className={`p-3 rounded-xl ${showChat ? 'bg-white text-blue-700' : 'bg-white/20 text-white'}`}
          title="Toggle Chat"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </aside>

      {/* Color Palette Panel */}
      {activePanel === 'palette' && (
        <div className="w-64 bg-white border-r shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Color Palette</h3>
            <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Background</label>
              <input
                type="color"
                value={palette.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Primary</label>
              <input
                type="color"
                value={palette.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Secondary</label>
              <input
                type="color"
                value={palette.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Text</label>
              <input
                type="color"
                value={palette.text}
                onChange={(e) => handleColorChange('text', e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Shapes Panel */}
      {activePanel === 'shapes' && (
        <div className="w-64 bg-white border-r shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Shapes</h3>
            <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { canvasRef.current?.addRectangle(); setActivePanel(null); }}
              className="p-4 bg-gray-50 rounded-xl hover:bg-blue-50 hover:border-blue-300 border-2 border-transparent transition flex flex-col items-center gap-2"
            >
              <Square className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-gray-600">Rectangle</span>
            </button>
            <button
              onClick={() => { canvasRef.current?.addCircle(); setActivePanel(null); }}
              className="p-4 bg-gray-50 rounded-xl hover:bg-purple-50 hover:border-purple-300 border-2 border-transparent transition flex flex-col items-center gap-2"
            >
              <Circle className="w-8 h-8 text-purple-600" />
              <span className="text-sm text-gray-600">Circle</span>
            </button>
            <button
              onClick={() => { canvasRef.current?.addTriangle(); setActivePanel(null); }}
              className="p-4 bg-gray-50 rounded-xl hover:bg-green-50 hover:border-green-300 border-2 border-transparent transition flex flex-col items-center gap-2"
            >
              <Triangle className="w-8 h-8 text-green-600" />
              <span className="text-sm text-gray-600">Triangle</span>
            </button>
            <button
              onClick={() => { canvasRef.current?.addLine(); setActivePanel(null); }}
              className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:border-gray-400 border-2 border-transparent transition flex flex-col items-center gap-2"
            >
              <Minus className="w-8 h-8 text-gray-600" />
              <span className="text-sm text-gray-600">Line</span>
            </button>
          </div>
        </div>
      )}

      {/* Layers Panel */}
      {activePanel === 'layers' && (
        <div className="w-64 bg-white border-r shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Layers</h3>
            <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <LayersPanel
            canvas={fabricCanvas}
            onUpdate={() => setFabricCanvas(fabricCanvas)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800">AdGen Editor</h1>

            <button
              onClick={handleAIMagic}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full font-medium hover:shadow-lg transition"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              AI Magic
            </button>

            <button
              onClick={handleCheckCompliance}
              disabled={isCheckingCompliance}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition ${isCheckingCompliance ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
            >
              {isCheckingCompliance ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {isCheckingCompliance ? 'Checking...' : 'Check Compliance'}
            </button>

            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-full font-medium hover:bg-pink-200 transition"
            >
              📋 Templates
            </button>
          </div>

          <div className="flex items-center gap-3">
            {complianceScore && (
              <button
                onClick={() => setShowComplianceDetails(true)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95 ${complianceScore.score >= 80 ? 'bg-green-100 text-green-700' :
                  complianceScore.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}
              >
                {complianceScore.score}% Compliant ℹ️
              </button>
            )}

            {/* Export Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-full font-medium hover:bg-gray-700 transition"
              >
                <Download className="w-4 h-4" />
                Export ▾
              </button>
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[160px]">
                <button
                  onClick={() => {
                    handleExportWithTracking();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                >
                  <FileImage className="w-4 h-4 text-blue-600" />
                  <span>PNG (High Quality)</span>
                </button>
                <button
                  onClick={() => {
                    if (canvasRef.current) {
                      const dataUrl = canvasRef.current.exportJPEG();
                      if (dataUrl) {
                        const link = document.createElement('a');
                        link.download = 'adgen-poster.jpg';
                        link.href = dataUrl;
                        link.click();
                        incrementStat('exports');
                      }
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                >
                  <FileImage className="w-4 h-4 text-orange-600" />
                  <span>JPEG (Compressed)</span>
                </button>
                <button
                  onClick={() => {
                    if (canvasRef.current) {
                      const svg = canvasRef.current.exportSVG();
                      if (svg) {
                        const blob = new Blob([svg], { type: 'image/svg+xml' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.download = 'adgen-poster.svg';
                        link.href = url;
                        link.click();
                        URL.revokeObjectURL(url);
                        incrementStat('exports');
                      }
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left rounded-b-xl"
                >
                  <FileCode className="w-4 h-4 text-green-600" />
                  <span>SVG (Vector)</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Canvas Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-1 min-h-0">
            <div className="flex-1 flex flex-col items-center justify-start p-4 overflow-auto">

              {/* Aspect Ratio Selector */}
              <div className="mb-4 w-full max-w-4xl">
                <h3 className="text-sm font-medium text-gray-600 mb-2">📐 Canvas Size & Platform</h3>
                <div className="flex flex-wrap gap-2 bg-white p-3 rounded-xl shadow-sm border">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => handleRatioChange(ratio)}
                      className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all text-xs ${selectedRatio === ratio.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      title={ratio.platform}
                    >
                      <span className="text-lg mb-1">{ratio.icon}</span>
                      <span className="font-medium">{ratio.label}</span>
                      <span className={`text-[10px] ${selectedRatio === ratio.id ? 'text-blue-100' : 'text-gray-500'}`}>
                        {ratio.id.includes(':') ? ratio.id : ratio.platform.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Selected: <strong>{ASPECT_RATIOS.find(r => r.id === selectedRatio)?.platform}</strong> ({canvasSize.width}×{canvasSize.height}px)
                </p>
              </div>

              {/* Canvas with zoom transform */}
              <div
                className="bg-white rounded-lg shadow-lg p-2"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s ease-out',
                  marginTop: zoomLevel > 1 ? '20px' : '0'
                }}
              >
                <CanvasEditor
                  key={canvasKey}
                  ref={canvasRef}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  elements={elements}
                  palette={palette}
                  skipInitialElements={!!savedCanvasJSONRef.current}
                  onCanvasReady={handleCanvasReady}
                />
              </div>

              {/* Control Buttons - Pushed to Bottom */}
              <div className="flex items-center gap-3 mt-auto pt-4 flex-wrap justify-center">
                {/* Undo/Redo */}
                <button
                  onClick={() => canvasRef.current?.undo()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-yellow-100 transition"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="w-4 h-4" />
                  Undo
                </button>
                <button
                  onClick={() => canvasRef.current?.redo()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-green-100 transition"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="w-4 h-4" />
                  Redo
                </button>

                {/* Divider */}
                <div className="w-px h-8 bg-gray-300" />

                {/* Zoom Controls */}
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= MIN_ZOOM}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleZoomReset}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition min-w-[60px] text-sm font-medium"
                  title="Reset Zoom (Click to reset)"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= MAX_ZOOM}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                {/* Divider */}
                <div className="w-px h-8 bg-gray-300" />

                {/* Delete */}
                <button
                  onClick={() => canvasRef.current?.deleteSelected()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-red-100 transition"
                  title="Delete Selected"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>

            {/* Chat Sidebar */}
            {showChat && (
              <div className="w-96 bg-white border-l shadow-lg flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
                  <h3 className="font-semibold">💬 AI Assistant</h3>
                  <button onClick={() => setShowChat(false)} className="text-white/70 hover:text-white">
                    ✕
                  </button>
                </div>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ChatInterface
                    onActionsReceived={handleActionsReceived}
                    canvasState={{ elements, palette }}
                    height={window.innerHeight - 180}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Save Toast */}
      {showSaveToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
          <Save className="w-5 h-5" />
          Project saved successfully!
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-8">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-8 py-5 border-b bg-rose-500 text-white">
              <div>
                <h2 className="text-2xl font-bold">📋 Choose a Template</h2>
                <p className="text-white/80 text-sm">Start with a pre-designed layout and customize it</p>
              </div>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-white/80 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-8 overflow-auto" style={{ maxHeight: 'calc(85vh - 100px)' }}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {AD_TEMPLATES.map(template => (
                  <div
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-pink-400"
                  >
                    <div
                      className="aspect-square flex items-center justify-center text-6xl"
                      style={{ backgroundColor: template.colors.background }}
                    >
                      <div className="text-center">
                        <div className="text-5xl mb-2">{template.preview}</div>
                        <div
                          className="text-lg font-bold px-4"
                          style={{ color: template.colors.text }}
                        >
                          {template.elements.find(e => e.type === 'headline')?.text || template.name}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white">
                      <h3 className="font-bold text-gray-800">{template.name}</h3>
                      <p className="text-sm text-gray-500">{template.elements.length} elements</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowTemplates(false)}
                  className="px-8 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition"
                >
                  Start from Blank Canvas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Details Modal */}
      {showComplianceDetails && complianceScore && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-8">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className={`px-8 py-6 text-white flex items-center justify-between ${complianceScore.score >= 80 ? 'bg-green-600' :
              complianceScore.score >= 60 ? 'bg-yellow-600' :
                'bg-red-600'
              }`}>
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Compliance Report: {complianceScore.status}
                </h2>
                <p className="text-white/80">Score: {complianceScore.score}% - {complianceScore.message}</p>
              </div>
              <button
                onClick={() => setShowComplianceDetails(false)}
                className="text-white/80 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-8 overflow-auto flex-1">
              {/* Failed Issues */}
              {complianceScore.issues && complianceScore.issues.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                    <X className="w-5 h-5" />
                    Improvements Needed
                  </h3>
                  <div className="space-y-3">
                    {complianceScore.issues.map((issue, i) => (
                      <div key={i} className="p-4 bg-red-50 border border-red-100 rounded-xl">
                        <p className="font-bold text-red-800">{issue.rule}</p>
                        <p className="text-sm text-red-700">{issue.issue}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Passed Checks */}
              {complianceScore.passed && complianceScore.passed.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-green-600 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Passed Guidelines
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {complianceScore.passed.map((rule, i) => (
                      <div key={i} className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!complianceScore.issues?.length && !complianceScore.passed?.length && (
                <div className="text-center py-12 text-gray-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Check complete. No detailed data available.</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowComplianceDetails(false)}
                className="px-6 py-2 bg-gray-800 text-white rounded-full font-medium hover:bg-gray-700 transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
