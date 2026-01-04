import { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Unlock, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

export default function LayersPanel({ canvas, onUpdate }) {
    const [layers, setLayers] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    // Update layers when canvas changes
    useEffect(() => {
        if (!canvas) return;

        const updateLayers = () => {
            const objects = canvas.getObjects();
            // Create layer list with original index, then reverse for display
            // (top layer shown first, but index refers to actual canvas position)
            const layerList = objects.map((obj, index) => ({
                id: obj.id || `object-${index}`,
                name: getObjectName(obj),
                type: obj.type,
                visible: obj.visible !== false,
                locked: obj.lockMovementX && obj.lockMovementY,
                index // This is the ACTUAL canvas index
            }));
            // Reverse for display (top layers first), but keep original index
            setLayers(layerList.reverse());

            // Update selected
            const active = canvas.getActiveObject();
            if (active) {
                setSelectedId(active.id || `object-${objects.indexOf(active)}`);
            }
        };

        updateLayers();

        // Listen for canvas changes
        canvas.on('object:added', updateLayers);
        canvas.on('object:removed', updateLayers);
        canvas.on('object:modified', updateLayers);
        canvas.on('selection:created', updateLayers);
        canvas.on('selection:updated', updateLayers);
        canvas.on('selection:cleared', () => setSelectedId(null));

        return () => {
            canvas.off('object:added', updateLayers);
            canvas.off('object:removed', updateLayers);
            canvas.off('object:modified', updateLayers);
            canvas.off('selection:created', updateLayers);
            canvas.off('selection:updated', updateLayers);
            canvas.off('selection:cleared');
        };
    }, [canvas]);

    const getObjectName = (obj) => {
        if (obj.id) {
            // Convert id to readable name
            const name = obj.id.replace(/-/g, ' ').replace(/_/g, ' ');
            return name.charAt(0).toUpperCase() + name.slice(1);
        }
        switch (obj.type) {
            case 'i-text':
            case 'text':
                return obj.text?.substring(0, 15) || 'Text';
            case 'rect':
                return 'Rectangle';
            case 'circle':
                return 'Circle';
            case 'triangle':
                return 'Triangle';
            case 'image':
                return 'Image';
            case 'group':
                return 'Group';
            case 'line':
                return 'Line';
            default:
                return obj.type || 'Object';
        }
    };

    const handleSelect = (layer) => {
        if (!canvas) return;
        const objects = canvas.getObjects();
        const obj = objects[layer.index];
        if (obj && !layer.locked) {
            canvas.setActiveObject(obj);
            canvas.renderAll();
            setSelectedId(layer.id);
        }
    };

    const handleToggleVisibility = (layer) => {
        if (!canvas) return;
        const objects = canvas.getObjects();
        const obj = objects[layer.index];
        if (obj) {
            obj.set('visible', !obj.visible);
            canvas.renderAll();
            onUpdate?.();
        }
    };

    const handleToggleLock = (layer) => {
        if (!canvas) return;
        const objects = canvas.getObjects();
        const obj = objects[layer.index];
        if (obj) {
            const isLocked = obj.lockMovementX && obj.lockMovementY;
            obj.set({
                lockMovementX: !isLocked,
                lockMovementY: !isLocked,
                lockRotation: !isLocked,
                lockScalingX: !isLocked,
                lockScalingY: !isLocked,
                selectable: isLocked
            });
            canvas.renderAll();
            onUpdate?.();
        }
    };

    const handleMoveUp = (layer) => {
        if (!canvas) {
            console.log('handleMoveUp: no canvas');
            return;
        }
        const objects = canvas.getObjects();
        console.log('handleMoveUp: layer.index=', layer.index, 'total objects=', objects.length);
        // In reversed list, "up" means higher z-index, so bringForward
        if (layer.index >= objects.length - 1) {
            console.log('handleMoveUp: already at top');
            return; // Already at top
        }
        const obj = objects[layer.index];
        if (obj) {
            console.log('handleMoveUp: calling bringForward on', obj.id || obj.type);
            canvas.bringForward(obj);
            canvas.renderAll();
            // Force update the layers list
            const newObjects = canvas.getObjects();
            const layerList = newObjects.map((o, index) => ({
                id: o.id || `object-${index}`,
                name: getObjectName(o),
                type: o.type,
                visible: o.visible !== false,
                locked: o.lockMovementX && o.lockMovementY,
                index
            }));
            setLayers(layerList.reverse());
            onUpdate?.();
        }
    };

    const handleMoveDown = (layer) => {
        if (!canvas) {
            console.log('handleMoveDown: no canvas');
            return;
        }
        console.log('handleMoveDown: layer.index=', layer.index);
        // In reversed list, "down" means lower z-index, so sendBackwards
        if (layer.index <= 0) {
            console.log('handleMoveDown: already at bottom');
            return; // Already at bottom
        }
        const objects = canvas.getObjects();
        const obj = objects[layer.index];
        if (obj) {
            console.log('handleMoveDown: calling sendBackwards on', obj.id || obj.type);
            canvas.sendBackwards(obj);
            canvas.renderAll();
            // Force update the layers list
            const newObjects = canvas.getObjects();
            const layerList = newObjects.map((o, index) => ({
                id: o.id || `object-${index}`,
                name: getObjectName(o),
                type: o.type,
                visible: o.visible !== false,
                locked: o.lockMovementX && o.lockMovementY,
                index
            }));
            setLayers(layerList.reverse());
            onUpdate?.();
        }
    };

    const handleDelete = (layer) => {
        if (!canvas) return;
        const objects = canvas.getObjects();
        const obj = objects[layer.index];
        if (obj) {
            canvas.remove(obj);
            canvas.renderAll();
            onUpdate?.();
        }
    };

    if (layers.length === 0) {
        return (
            <div className="p-4 text-gray-500 text-sm text-center">
                No layers yet. Add elements to the canvas.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1 p-2 max-h-64 overflow-auto">
            {layers.map((layer) => (
                <div
                    key={layer.id}
                    onClick={() => handleSelect(layer)}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${selectedId === layer.id
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                >
                    {/* Layer Icon */}
                    <div className="w-6 h-6 flex items-center justify-center text-sm">
                        {layer.type === 'i-text' || layer.type === 'text' ? '📝' :
                            layer.type === 'rect' ? '⬜' :
                                layer.type === 'circle' ? '⭕' :
                                    layer.type === 'image' ? '🖼️' :
                                        layer.type === 'group' ? '📦' :
                                            '🔷'}
                    </div>

                    {/* Name */}
                    <span className={`flex-1 text-sm truncate ${!layer.visible ? 'opacity-50' : ''}`}>
                        {layer.name}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleToggleVisibility(layer); }}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title={layer.visible ? 'Hide' : 'Show'}
                        >
                            {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleToggleLock(layer); }}
                            className="p-1 text-gray-400 hover:text-orange-600"
                            title={layer.locked ? 'Unlock' : 'Lock'}
                        >
                            {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(layer); }}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
