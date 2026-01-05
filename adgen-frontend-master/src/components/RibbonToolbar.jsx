/**
 * RibbonToolbar - Full PowerPoint-Style Tabbed Toolbar
 * 
 * Complete design toolbar with all editing features organized into tabs.
 */

import { useState, useEffect } from 'react';
import {
    // Home tab icons
    Undo, Redo, Copy, Clipboard, Trash2, MousePointer, Scissors,
    // Insert tab icons
    Type, Square, Circle, Triangle, Minus, Image, Star, Heart,
    ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Hexagon, Pentagon, Octagon,
    MessageSquare as Callout, Cloud, RectangleHorizontal,
    // Design tab icons
    LayoutGrid, Palette, Paintbrush,
    // Format tab icons
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Strikethrough, Subscript, Superscript, CaseSensitive,
    // Arrange tab icons
    Layers, MoveHorizontal, MoveVertical, FlipHorizontal, FlipVertical,
    Group, Ungroup, BringToFront, SendToBack, RotateCw, RotateCcw,
    Lock, Unlock,
    // Effects icons
    Droplet, Sun, Moon, Sparkle, CircleDot,
    // AI tab icons
    Sparkles, Wand2, Brain,
    // Compliance tab icons
    CheckCircle, Shield, FileCheck,
    // Export tab icons
    Download, FileImage, FileCode, Share2,
    // Other
    ChevronDown, Plus, Minus as MinusIcon, Eye, EyeOff
} from 'lucide-react';

// Available fonts
const FONTS = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
    'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Palatino',
    'Garamond', 'Bookman', 'Avant Garde', 'Inter', 'Roboto'
];

// Font sizes
const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72, 96];

// Preset colors
const COLOR_PALETTE = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FF6600', '#6600FF', '#00FF66', '#FF0066',
    '#333333', '#666666', '#999999', '#CCCCCC', '#E41C2A', '#00539F'
];

const TABS = [
    { id: 'home', label: 'Home' },
    { id: 'insert', label: 'Insert' },
    { id: 'format', label: 'Format' },
    { id: 'arrange', label: 'Arrange' },
    { id: 'effects', label: 'Effects' },
    { id: 'ai', label: 'AI Tools' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'export', label: 'Export' }
];

// Helper Components
function RibbonButton({ icon: Icon, label, onClick, disabled, active, shortcut, small }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={shortcut ? `${label} (${shortcut})` : label}
            className={`flex flex-col items-center gap-0.5 ${small ? 'px-2 py-1' : 'px-3 py-2'} rounded-lg transition
        ${active ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
        >
            <Icon className={small ? 'w-4 h-4' : 'w-5 h-5'} />
            <span className={`${small ? 'text-[10px]' : 'text-xs'} font-medium`}>{label}</span>
        </button>
    );
}

function RibbonGroup({ title, children }) {
    return (
        <div className="flex flex-col border-r border-gray-200 pr-3 mr-3 last:border-r-0 last:pr-0 last:mr-0">
            <div className="flex items-center gap-1 mb-1 flex-wrap">
                {children}
            </div>
            <span className="text-[10px] text-gray-400 text-center">{title}</span>
        </div>
    );
}

function ColorPicker({ value, onChange, label }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative">
                <div
                    className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
                    style={{ backgroundColor: value || '#000000' }}
                />
                <input
                    type="color"
                    value={value || '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>
            <span className="text-[10px] text-gray-500">{label}</span>
        </div>
    );
}

function Dropdown({ value, options, onChange, label, width = 'w-24' }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`${width} text-xs border rounded px-1 py-1 bg-white`}
            >
                {options.map((opt) => (
                    <option key={opt.value || opt} value={opt.value || opt}>
                        {opt.label || opt}
                    </option>
                ))}
            </select>
            <span className="text-[10px] text-gray-400">{label}</span>
        </div>
    );
}

function SliderControl({ value, onChange, min, max, label }) {
    return (
        <div className="flex flex-col items-center gap-1 px-2">
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-20 h-1"
            />
            <span className="text-[10px] text-gray-400">{label}: {value}</span>
        </div>
    );
}

export default function RibbonToolbar({
    canvas,
    canvasRef,
    onAIMagic,
    onCheckCompliance,
    onShowTemplates,
    onShowChat,
    showChat,
    onExport,
    selectedRatio,
    onRatioChange,
    isGenerating,
    isCheckingCompliance
}) {
    const [activeTab, setActiveTab] = useState('home');
    const [selectedObject, setSelectedObject] = useState(null);

    // Object properties state
    const [fillColor, setFillColor] = useState('#FF0000');
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(1);
    const [opacity, setOpacity] = useState(100);
    const [fontFamily, setFontFamily] = useState('Arial');
    const [fontSize, setFontSize] = useState(24);
    const [textColor, setTextColor] = useState('#000000');

    // Track selected object
    useEffect(() => {
        if (!canvas) return;

        const handleSelection = () => {
            const obj = canvas.getActiveObject();
            setSelectedObject(obj);
            if (obj) {
                setFillColor(obj.fill || '#FF0000');
                setStrokeColor(obj.stroke || '#000000');
                setStrokeWidth(obj.strokeWidth || 1);
                setOpacity(Math.round((obj.opacity || 1) * 100));
                if (obj.type === 'i-text' || obj.type === 'text') {
                    setFontFamily(obj.fontFamily || 'Arial');
                    setFontSize(obj.fontSize || 24);
                    setTextColor(obj.fill || '#000000');
                }
            }
        };

        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);
        canvas.on('selection:cleared', () => setSelectedObject(null));

        return () => {
            canvas.off('selection:created', handleSelection);
            canvas.off('selection:updated', handleSelection);
            canvas.off('selection:cleared');
        };
    }, [canvas]);

    // Canvas operations
    const handleUndo = () => canvasRef?.current?.undo();
    const handleRedo = () => canvasRef?.current?.redo();

    const handleCopy = async () => {
        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                try {
                    // Fabric.js v6+ uses Promise-based clone
                    const cloned = await activeObject.clone();
                    window._clipboard = cloned;
                } catch (e) {
                    // Fallback for older versions or simpler copy
                    window._clipboard = activeObject.toObject();
                    window._clipboardType = activeObject.type;
                }
            }
        }
    };

    const handleCut = async () => {
        await handleCopy();
        handleDelete();
    };

    const handlePaste = async () => {
        if (!canvas) return;

        if (window._clipboard) {
            try {
                let cloned;
                if (window._clipboard.clone) {
                    // It's a fabric object, clone it
                    cloned = await window._clipboard.clone();
                } else {
                    // It's serialized data, recreate the object
                    const objects = await window.fabric.util.enlivenObjects([window._clipboard]);
                    cloned = objects[0];
                }

                if (cloned) {
                    canvas.discardActiveObject();
                    cloned.set({
                        left: (cloned.left || 100) + 20,
                        top: (cloned.top || 100) + 20,
                        evented: true,
                    });
                    canvas.add(cloned);
                    canvas.setActiveObject(cloned);
                    canvas.requestRenderAll();
                }
            } catch (e) {
                console.error('Paste error:', e);
            }
        }
    };

    const handleDelete = () => {
        if (canvas) {
            const activeObjects = canvas.getActiveObjects();
            activeObjects.forEach(obj => canvas.remove(obj));
            canvas.discardActiveObject();
            canvas.requestRenderAll();
        }
    };

    const handleSelectAll = () => {
        if (canvas) {
            canvas.discardActiveObject();
            const objects = canvas.getObjects();
            if (objects.length > 0) {
                const selection = new window.fabric.ActiveSelection(objects, { canvas });
                canvas.setActiveObject(selection);
                canvas.requestRenderAll();
            }
        }
    };

    const handleDuplicate = async () => {
        if (canvas && selectedObject) {
            try {
                const cloned = await selectedObject.clone();
                cloned.set({
                    left: (cloned.left || 100) + 20,
                    top: (cloned.top || 100) + 20,
                    evented: true,
                });
                canvas.add(cloned);
                canvas.setActiveObject(cloned);
                canvas.requestRenderAll();
            } catch (e) {
                console.error('Duplicate error:', e);
            }
        }
    };

    // Insert shapes
    const addShape = (type) => {
        if (!canvas) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        let shape;

        switch (type) {
            case 'rectangle':
                shape = new window.fabric.Rect({
                    left: centerX - 50, top: centerY - 30,
                    width: 100, height: 60,
                    fill: fillColor, stroke: strokeColor, strokeWidth: strokeWidth
                });
                break;
            case 'roundedRect':
                shape = new window.fabric.Rect({
                    left: centerX - 50, top: centerY - 30,
                    width: 100, height: 60, rx: 10, ry: 10,
                    fill: fillColor, stroke: strokeColor, strokeWidth: strokeWidth
                });
                break;
            case 'circle':
                shape = new window.fabric.Circle({
                    left: centerX - 40, top: centerY - 40,
                    radius: 40,
                    fill: fillColor, stroke: strokeColor, strokeWidth: strokeWidth
                });
                break;
            case 'triangle':
                shape = new window.fabric.Triangle({
                    left: centerX - 40, top: centerY - 35,
                    width: 80, height: 70,
                    fill: fillColor, stroke: strokeColor, strokeWidth: strokeWidth
                });
                break;
            case 'line':
                shape = new window.fabric.Line([centerX - 50, centerY, centerX + 50, centerY], {
                    stroke: strokeColor, strokeWidth: strokeWidth + 2
                });
                break;
            case 'star':
                shape = createStar(centerX, centerY, 5, 40, 20);
                break;
            case 'heart':
                shape = createHeart(centerX, centerY, 40);
                break;
            case 'arrow-right':
                shape = createArrow(centerX, centerY, 'right');
                break;
            case 'arrow-left':
                shape = createArrow(centerX, centerY, 'left');
                break;
            case 'arrow-up':
                shape = createArrow(centerX, centerY, 'up');
                break;
            case 'arrow-down':
                shape = createArrow(centerX, centerY, 'down');
                break;
            case 'pentagon':
                shape = createPolygon(centerX, centerY, 5, 40);
                break;
            case 'hexagon':
                shape = createPolygon(centerX, centerY, 6, 40);
                break;
            case 'octagon':
                shape = createPolygon(centerX, centerY, 8, 40);
                break;
            case 'callout':
                shape = createCallout(centerX, centerY);
                break;
            default:
                return;
        }

        if (shape) {
            canvas.add(shape);
            canvas.setActiveObject(shape);
            canvas.requestRenderAll();
        }
    };

    // Shape creators
    const createStar = (cx, cy, spikes, outerRadius, innerRadius) => {
        const points = [];
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI / spikes) * i - Math.PI / 2;
            points.push({
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius
            });
        }
        return new window.fabric.Polygon(points, {
            fill: fillColor, stroke: strokeColor, strokeWidth: strokeWidth
        });
    };

    const createHeart = (cx, cy, size) => {
        const path = `M ${cx} ${cy + size / 4}
      C ${cx} ${cy - size / 2}, ${cx - size} ${cy - size / 2}, ${cx - size} ${cy + size / 4}
      C ${cx - size} ${cy + size}, ${cx} ${cy + size * 1.25}, ${cx} ${cy + size * 1.25}
      C ${cx} ${cy + size * 1.25}, ${cx + size} ${cy + size}, ${cx + size} ${cy + size / 4}
      C ${cx + size} ${cy - size / 2}, ${cx} ${cy - size / 2}, ${cx} ${cy + size / 4} Z`;
        return new window.fabric.Path(path, {
            fill: fillColor, stroke: strokeColor, strokeWidth: strokeWidth,
            left: cx - size, top: cy - size
        });
    };

    const createArrow = (cx, cy, direction) => {
        const size = 40;
        let points;
        switch (direction) {
            case 'right':
                points = [
                    { x: cx - size, y: cy - size / 4 },
                    { x: cx, y: cy - size / 4 },
                    { x: cx, y: cy - size / 2 },
                    { x: cx + size / 2, y: cy },
                    { x: cx, y: cy + size / 2 },
                    { x: cx, y: cy + size / 4 },
                    { x: cx - size, y: cy + size / 4 }
                ];
                break;
            case 'left':
                points = [
                    { x: cx + size, y: cy - size / 4 },
                    { x: cx, y: cy - size / 4 },
                    { x: cx, y: cy - size / 2 },
                    { x: cx - size / 2, y: cy },
                    { x: cx, y: cy + size / 2 },
                    { x: cx, y: cy + size / 4 },
                    { x: cx + size, y: cy + size / 4 }
                ];
                break;
            case 'up':
                points = [
                    { x: cx - size / 4, y: cy + size },
                    { x: cx - size / 4, y: cy },
                    { x: cx - size / 2, y: cy },
                    { x: cx, y: cy - size / 2 },
                    { x: cx + size / 2, y: cy },
                    { x: cx + size / 4, y: cy },
                    { x: cx + size / 4, y: cy + size }
                ];
                break;
            case 'down':
                points = [
                    { x: cx - size / 4, y: cy - size },
                    { x: cx - size / 4, y: cy },
                    { x: cx - size / 2, y: cy },
                    { x: cx, y: cy + size / 2 },
                    { x: cx + size / 2, y: cy },
                    { x: cx + size / 4, y: cy },
                    { x: cx + size / 4, y: cy - size }
                ];
                break;
        }
        return new window.fabric.Polygon(points, {
            fill: fillColor, stroke: strokeColor, strokeWidth: strokeWidth
        });
    };

    const createPolygon = (cx, cy, sides, radius) => {
        const points = [];
        for (let i = 0; i < sides; i++) {
            const angle = (2 * Math.PI / sides) * i - Math.PI / 2;
            points.push({
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius
            });
        }
        return new window.fabric.Polygon(points, {
            fill: fillColor, stroke: strokeColor, strokeWidth: strokeWidth
        });
    };

    const createCallout = (cx, cy) => {
        const width = 100, height = 60;
        const path = `M ${cx - width / 2} ${cy - height / 2}
      L ${cx + width / 2} ${cy - height / 2}
      L ${cx + width / 2} ${cy + height / 2}
      L ${cx + 10} ${cy + height / 2}
      L ${cx - 20} ${cy + height / 2 + 20}
      L ${cx - 10} ${cy + height / 2}
      L ${cx - width / 2} ${cy + height / 2} Z`;
        return new window.fabric.Path(path, {
            fill: fillColor, stroke: strokeColor, strokeWidth: strokeWidth
        });
    };

    // Text operations
    const handleAddText = () => {
        if (!canvas) return;
        const text = new window.fabric.IText('Your text here', {
            left: canvas.width / 2 - 80,
            top: canvas.height / 2,
            fontSize: fontSize,
            fontFamily: fontFamily,
            fill: textColor
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.requestRenderAll();
    };

    // Format operations
    const handleBold = () => {
        if (canvas && selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
            selectedObject.set('fontWeight', selectedObject.fontWeight === 'bold' ? 'normal' : 'bold');
            canvas.requestRenderAll();
        }
    };

    const handleItalic = () => {
        if (canvas && selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
            selectedObject.set('fontStyle', selectedObject.fontStyle === 'italic' ? 'normal' : 'italic');
            canvas.requestRenderAll();
        }
    };

    const handleUnderline = () => {
        if (canvas && selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
            selectedObject.set('underline', !selectedObject.underline);
            canvas.requestRenderAll();
        }
    };

    const handleStrikethrough = () => {
        if (canvas && selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
            selectedObject.set('linethrough', !selectedObject.linethrough);
            canvas.requestRenderAll();
        }
    };

    const applyFontFamily = (font) => {
        setFontFamily(font);
        if (canvas && selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
            selectedObject.set('fontFamily', font);
            canvas.requestRenderAll();
        }
    };

    const applyFontSize = (size) => {
        setFontSize(Number(size));
        if (canvas && selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
            selectedObject.set('fontSize', Number(size));
            canvas.requestRenderAll();
        }
    };

    const applyTextColor = (color) => {
        setTextColor(color);
        if (canvas && selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
            selectedObject.set('fill', color);
            canvas.requestRenderAll();
        }
    };

    // Object formatting
    const applyFillColor = (color) => {
        setFillColor(color);
        if (canvas && selectedObject) {
            selectedObject.set('fill', color);
            canvas.requestRenderAll();
        }
    };

    const applyStrokeColor = (color) => {
        setStrokeColor(color);
        if (canvas && selectedObject) {
            selectedObject.set('stroke', color);
            canvas.requestRenderAll();
        }
    };

    const applyStrokeWidth = (width) => {
        setStrokeWidth(width);
        if (canvas && selectedObject) {
            selectedObject.set('strokeWidth', width);
            canvas.requestRenderAll();
        }
    };

    const applyOpacity = (value) => {
        setOpacity(value);
        if (canvas && selectedObject) {
            selectedObject.set('opacity', value / 100);
            canvas.requestRenderAll();
        }
    };

    // Arrange operations
    const handleBringToFront = () => {
        if (canvas && selectedObject) {
            canvas.bringObjectToFront(selectedObject);
            canvas.requestRenderAll();
        }
    };

    const handleSendToBack = () => {
        if (canvas && selectedObject) {
            canvas.sendObjectToBack(selectedObject);
            canvas.requestRenderAll();
        }
    };

    const handleBringForward = () => {
        if (canvas && selectedObject) {
            canvas.bringObjectForward(selectedObject);
            canvas.requestRenderAll();
        }
    };

    const handleSendBackward = () => {
        if (canvas && selectedObject) {
            canvas.sendObjectBackwards(selectedObject);
            canvas.requestRenderAll();
        }
    };

    const handleGroup = () => {
        if (canvas) {
            const activeSelection = canvas.getActiveObject();
            if (activeSelection && activeSelection.type === 'activeSelection') {
                // Get all objects in selection
                const objects = activeSelection.getObjects();
                if (objects.length < 2) return;

                // Remove objects from canvas
                canvas.discardActiveObject();
                objects.forEach(obj => canvas.remove(obj));

                // Create group
                const group = new window.fabric.Group(objects, {
                    left: activeSelection.left,
                    top: activeSelection.top
                });

                canvas.add(group);
                canvas.setActiveObject(group);
                canvas.requestRenderAll();
            }
        }
    };

    const handleUngroup = () => {
        if (canvas && selectedObject && selectedObject.type === 'group') {
            const items = selectedObject.getObjects();
            const groupLeft = selectedObject.left;
            const groupTop = selectedObject.top;

            canvas.remove(selectedObject);

            items.forEach(item => {
                item.set({
                    left: item.left + groupLeft,
                    top: item.top + groupTop
                });
                canvas.add(item);
            });

            canvas.discardActiveObject();
            const selection = new window.fabric.ActiveSelection(items, { canvas });
            canvas.setActiveObject(selection);
            canvas.requestRenderAll();
        }
    };

    const handleFlipH = () => {
        if (canvas && selectedObject) {
            selectedObject.set('flipX', !selectedObject.flipX);
            canvas.requestRenderAll();
        }
    };

    const handleFlipV = () => {
        if (canvas && selectedObject) {
            selectedObject.set('flipY', !selectedObject.flipY);
            canvas.requestRenderAll();
        }
    };

    const handleRotate = (angle) => {
        if (canvas && selectedObject) {
            selectedObject.rotate((selectedObject.angle || 0) + angle);
            canvas.requestRenderAll();
        }
    };

    const handleAlignLeft = () => {
        if (canvas && selectedObject) {
            selectedObject.set('left', 0);
            canvas.requestRenderAll();
        }
    };

    const handleAlignCenter = () => {
        if (canvas && selectedObject) {
            selectedObject.set('left', (canvas.width - selectedObject.width * selectedObject.scaleX) / 2);
            canvas.requestRenderAll();
        }
    };

    const handleAlignRight = () => {
        if (canvas && selectedObject) {
            selectedObject.set('left', canvas.width - selectedObject.width * selectedObject.scaleX);
            canvas.requestRenderAll();
        }
    };

    // Effects
    const handleShadow = () => {
        if (canvas && selectedObject) {
            if (selectedObject.shadow) {
                selectedObject.set('shadow', null);
            } else {
                selectedObject.set('shadow', new window.fabric.Shadow({
                    color: 'rgba(0,0,0,0.3)',
                    blur: 10,
                    offsetX: 5,
                    offsetY: 5
                }));
            }
            canvas.requestRenderAll();
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <div className="flex items-start">
                        <RibbonGroup title="Clipboard">
                            <RibbonButton icon={Scissors} label="Cut" onClick={handleCut} shortcut="Ctrl+X" small />
                            <RibbonButton icon={Copy} label="Copy" onClick={handleCopy} shortcut="Ctrl+C" small />
                            <RibbonButton icon={Clipboard} label="Paste" onClick={handlePaste} shortcut="Ctrl+V" small />
                        </RibbonGroup>
                        <RibbonGroup title="History">
                            <RibbonButton icon={Undo} label="Undo" onClick={handleUndo} shortcut="Ctrl+Z" small />
                            <RibbonButton icon={Redo} label="Redo" onClick={handleRedo} shortcut="Ctrl+Y" small />
                        </RibbonGroup>
                        <RibbonGroup title="Edit">
                            <RibbonButton icon={Trash2} label="Delete" onClick={handleDelete} shortcut="Del" small />
                            <RibbonButton icon={MousePointer} label="Select All" onClick={handleSelectAll} shortcut="Ctrl+A" small />
                            <RibbonButton icon={Copy} label="Duplicate" onClick={handleDuplicate} shortcut="Ctrl+D" small />
                        </RibbonGroup>
                        <RibbonGroup title="Font">
                            <Dropdown value={fontFamily} options={FONTS} onChange={applyFontFamily} label="Font" width="w-28" />
                            <Dropdown value={fontSize} options={FONT_SIZES} onChange={applyFontSize} label="Size" width="w-16" />
                        </RibbonGroup>
                        <RibbonGroup title="Style">
                            <RibbonButton icon={Bold} label="Bold" onClick={handleBold} small />
                            <RibbonButton icon={Italic} label="Italic" onClick={handleItalic} small />
                            <RibbonButton icon={Underline} label="Underline" onClick={handleUnderline} small />
                            <RibbonButton icon={Strikethrough} label="Strike" onClick={handleStrikethrough} small />
                        </RibbonGroup>
                    </div>
                );

            case 'insert':
                return (
                    <div className="flex items-start">
                        <RibbonGroup title="Text">
                            <RibbonButton icon={Type} label="Text Box" onClick={handleAddText} />
                        </RibbonGroup>
                        <RibbonGroup title="Basic Shapes">
                            <RibbonButton icon={Square} label="Rect" onClick={() => addShape('rectangle')} small />
                            <RibbonButton icon={RectangleHorizontal} label="Rounded" onClick={() => addShape('roundedRect')} small />
                            <RibbonButton icon={Circle} label="Circle" onClick={() => addShape('circle')} small />
                            <RibbonButton icon={Triangle} label="Triangle" onClick={() => addShape('triangle')} small />
                            <RibbonButton icon={Minus} label="Line" onClick={() => addShape('line')} small />
                        </RibbonGroup>
                        <RibbonGroup title="Special Shapes">
                            <RibbonButton icon={Star} label="Star" onClick={() => addShape('star')} small />
                            <RibbonButton icon={Heart} label="Heart" onClick={() => addShape('heart')} small />
                            <RibbonButton icon={Callout} label="Callout" onClick={() => addShape('callout')} small />
                        </RibbonGroup>
                        <RibbonGroup title="Arrows">
                            <RibbonButton icon={ArrowRight} label="Right" onClick={() => addShape('arrow-right')} small />
                            <RibbonButton icon={ArrowLeft} label="Left" onClick={() => addShape('arrow-left')} small />
                            <RibbonButton icon={ArrowUp} label="Up" onClick={() => addShape('arrow-up')} small />
                            <RibbonButton icon={ArrowDown} label="Down" onClick={() => addShape('arrow-down')} small />
                        </RibbonGroup>
                        <RibbonGroup title="Polygons">
                            <RibbonButton icon={Pentagon} label="Pentagon" onClick={() => addShape('pentagon')} small />
                            <RibbonButton icon={Hexagon} label="Hexagon" onClick={() => addShape('hexagon')} small />
                            <RibbonButton icon={Octagon} label="Octagon" onClick={() => addShape('octagon')} small />
                        </RibbonGroup>
                    </div>
                );

            case 'format':
                return (
                    <div className="flex items-start">
                        <RibbonGroup title="Fill">
                            <ColorPicker value={fillColor} onChange={applyFillColor} label="Fill" />
                            <div className="flex flex-wrap gap-1 max-w-[120px]">
                                {COLOR_PALETTE.slice(0, 12).map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => applyFillColor(color)}
                                        className="w-4 h-4 rounded border border-gray-300"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </RibbonGroup>
                        <RibbonGroup title="Stroke">
                            <ColorPicker value={strokeColor} onChange={applyStrokeColor} label="Color" />
                            <SliderControl value={strokeWidth} onChange={applyStrokeWidth} min={0} max={20} label="Width" />
                        </RibbonGroup>
                        <RibbonGroup title="Opacity">
                            <SliderControl value={opacity} onChange={applyOpacity} min={0} max={100} label="%" />
                        </RibbonGroup>
                        <RibbonGroup title="Text Color">
                            <ColorPicker value={textColor} onChange={applyTextColor} label="Text" />
                        </RibbonGroup>
                    </div>
                );

            case 'arrange':
                return (
                    <div className="flex items-start">
                        <RibbonGroup title="Order">
                            <RibbonButton icon={BringToFront} label="To Front" onClick={handleBringToFront} small />
                            <RibbonButton icon={SendToBack} label="To Back" onClick={handleSendToBack} small />
                            <RibbonButton icon={ArrowUp} label="Forward" onClick={handleBringForward} small />
                            <RibbonButton icon={ArrowDown} label="Backward" onClick={handleSendBackward} small />
                        </RibbonGroup>
                        <RibbonGroup title="Group">
                            <RibbonButton icon={Group} label="Group" onClick={handleGroup} shortcut="Ctrl+G" small />
                            <RibbonButton icon={Ungroup} label="Ungroup" onClick={handleUngroup} shortcut="Ctrl+Shift+G" small />
                        </RibbonGroup>
                        <RibbonGroup title="Flip">
                            <RibbonButton icon={FlipHorizontal} label="Flip H" onClick={handleFlipH} small />
                            <RibbonButton icon={FlipVertical} label="Flip V" onClick={handleFlipV} small />
                        </RibbonGroup>
                        <RibbonGroup title="Rotate">
                            <RibbonButton icon={RotateCcw} label="-90°" onClick={() => handleRotate(-90)} small />
                            <RibbonButton icon={RotateCw} label="+90°" onClick={() => handleRotate(90)} small />
                        </RibbonGroup>
                        <RibbonGroup title="Align">
                            <RibbonButton icon={AlignLeft} label="Left" onClick={handleAlignLeft} small />
                            <RibbonButton icon={AlignCenter} label="Center" onClick={handleAlignCenter} small />
                            <RibbonButton icon={AlignRight} label="Right" onClick={handleAlignRight} small />
                        </RibbonGroup>
                    </div>
                );

            case 'effects':
                return (
                    <div className="flex items-start">
                        <RibbonGroup title="Shadow">
                            <RibbonButton
                                icon={Sun}
                                label="Shadow"
                                onClick={handleShadow}
                                active={selectedObject?.shadow}
                            />
                        </RibbonGroup>
                        <RibbonGroup title="Templates">
                            <RibbonButton icon={LayoutGrid} label="Templates" onClick={onShowTemplates} />
                        </RibbonGroup>
                    </div>
                );

            case 'ai':
                return (
                    <div className="flex items-start">
                        <RibbonGroup title="Generate">
                            <RibbonButton
                                icon={Sparkles}
                                label="AI Magic"
                                onClick={onAIMagic}
                                disabled={isGenerating}
                                active={isGenerating}
                            />
                            <RibbonButton icon={Wand2} label="Templates" onClick={onShowTemplates} />
                        </RibbonGroup>
                        <RibbonGroup title="Chat">
                            <RibbonButton
                                icon={Brain}
                                label="AI Chat"
                                onClick={onShowChat}
                                active={showChat}
                            />
                        </RibbonGroup>
                    </div>
                );

            case 'compliance':
                return (
                    <div className="flex items-start">
                        <RibbonGroup title="Check">
                            <RibbonButton
                                icon={CheckCircle}
                                label="Check Compliance"
                                onClick={onCheckCompliance}
                                disabled={isCheckingCompliance}
                                active={isCheckingCompliance}
                            />
                        </RibbonGroup>
                        <RibbonGroup title="Brand">
                            <RibbonButton icon={Shield} label="Guidelines" onClick={() => window.open('/brand-guidelines', '_blank')} />
                        </RibbonGroup>
                    </div>
                );

            case 'export':
                return (
                    <div className="flex items-start">
                        <RibbonGroup title="Download">
                            <RibbonButton icon={FileImage} label="PNG" onClick={() => onExport?.('png')} />
                            <RibbonButton icon={FileImage} label="JPEG" onClick={() => onExport?.('jpeg')} />
                            <RibbonButton icon={FileCode} label="SVG" onClick={() => onExport?.('svg')} />
                        </RibbonGroup>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-white border-b shadow-sm">
            {/* Tab Headers */}
            <div className="flex items-center border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="px-4 py-2 font-bold text-blue-700 border-r">AdGen</div>
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium transition border-b-2 ${activeTab === tab.id
                            ? 'bg-white text-blue-600 border-blue-600'
                            : 'text-gray-600 hover:text-gray-800 border-transparent hover:bg-white/50'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="px-4 py-2 min-h-[70px] bg-gray-50/50">
                {renderTabContent()}
            </div>
        </div>
    );
}
