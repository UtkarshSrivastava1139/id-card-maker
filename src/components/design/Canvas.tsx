import { useRef, useState, useEffect } from 'react';
import { useTemplateStore } from '../../store/templateStore';
import { useProjectStore } from '../../store/projectStore';

const MM_TO_PX = 3.7795;

export default function Canvas() {
  const { currentProject } = useProjectStore();
  const { 
    backgroundImage, 
    elements, 
    guidelines,
    selectedElementId, 
    setSelectedElementId, 
    updateElement,
    addGuideline,
    updateGuideline,
    // removeGuideline is unused here
    zoom 
  } = useTemplateStore();
  
  const [dragging, setDragging] = useState<{ id: string, startX: number, startY: number, initialX: number, initialY: number } | null>(null);
  const [draggingGuide, setDraggingGuide] = useState<{ id: string, axis: 'x' | 'y', isNew: boolean } | null>(null);
  const [snapLines, setSnapLines] = useState<{ x?: number, y?: number }[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);

  // Keyboard Nudging
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElementId) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const el = elements.find(e => e.id === selectedElementId);
        if (!el) return;
        
        const step = e.shiftKey ? 0.1 : 1; // 1mm normal, 0.1mm with shift
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;
        
        updateElement(selectedElementId, { x: el.x + dx, y: el.y + dy });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, elements, updateElement]);

  // Window pointer events for guideline dragging (allows dragging outside canvas board)
  useEffect(() => {
    if (!draggingGuide) return;
    
    const onMove = (e: PointerEvent) => {
      if (!boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const zoomLevel = useTemplateStore.getState().zoom;
      let pos = 0;
      if (draggingGuide.axis === 'y') {
        pos = (e.clientY - rect.top) / zoomLevel / MM_TO_PX;
      } else {
        pos = (e.clientX - rect.left) / zoomLevel / MM_TO_PX;
      }
      updateGuideline(draggingGuide.id, pos);
    };
    
    const onUp = () => {
      const state = useTemplateStore.getState();
      const finalPos = state.guidelines.find(g => g.id === draggingGuide.id)?.pos;
      
      if (finalPos !== undefined && currentProject) {
        const isLandscape = currentProject.orientation === 'landscape';
        const w = isLandscape ? Math.max(currentProject.cardSize.width, currentProject.cardSize.height) : Math.min(currentProject.cardSize.width, currentProject.cardSize.height);
        const h = isLandscape ? Math.min(currentProject.cardSize.width, currentProject.cardSize.height) : Math.max(currentProject.cardSize.width, currentProject.cardSize.height);
        
        // Remove if dragged out of bounds
        if (draggingGuide.axis === 'y' && (finalPos < 0 || finalPos > h)) {
          state.removeGuideline(draggingGuide.id);
        } else if (draggingGuide.axis === 'x' && (finalPos < 0 || finalPos > w)) {
          state.removeGuideline(draggingGuide.id);
        }
      }
      setDraggingGuide(null);
    };
    
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [draggingGuide, currentProject]);

  if (!currentProject) return null;

  const cardWidthPx = currentProject.cardSize.width * MM_TO_PX;
  const cardHeightPx = currentProject.cardSize.height * MM_TO_PX;

  const isLandscape = currentProject.orientation === 'landscape';
  const finalWidth = isLandscape ? Math.max(cardWidthPx, cardHeightPx) : Math.min(cardWidthPx, cardHeightPx);
  const finalHeight = isLandscape ? Math.min(cardWidthPx, cardHeightPx) : Math.max(cardWidthPx, cardHeightPx);

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    setSelectedElementId(id);
    const el = elements.find(e => e.id === id);
    if (el) {
      setDragging({
        id,
        startX: e.clientX,
        startY: e.clientY,
        initialX: el.x,
        initialY: el.y
      });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const zoomLevel = useTemplateStore.getState().zoom;
    const dxPx = (e.clientX - dragging.startX) / zoomLevel;
    const dyPx = (e.clientY - dragging.startY) / zoomLevel;
    let dxMm = dxPx / MM_TO_PX;
    let dyMm = dyPx / MM_TO_PX;
    
    let newX = dragging.initialX + dxMm;
    let newY = dragging.initialY + dyMm;
    
    const activeEl = elements.find(el => el.id === dragging.id);
    if (!activeEl) return;
    
    const snapThreshold = 1.0; // 1mm snapping threshold
    let snappedX: number | undefined;
    let snappedY: number | undefined;
    const lines: {x?: number, y?: number}[] = [];

    const activeXs = [newX, newX + activeEl.width / 2, newX + activeEl.width];
    const activeYs = [newY, newY + activeEl.height / 2, newY + activeEl.height];

    // 1. Snap to Guidelines first
    const currentGuidelines = useTemplateStore.getState().guidelines;
    for (const guide of currentGuidelines) {
      if (guide.axis === 'x' && snappedX === undefined) {
        for (let i = 0; i < 3; i++) {
          if (Math.abs(activeXs[i] - guide.pos) < snapThreshold) {
            newX = guide.pos - (i === 0 ? 0 : (i === 1 ? activeEl.width / 2 : activeEl.width));
            snappedX = guide.pos;
            lines.push({ x: snappedX });
            break;
          }
        }
      } else if (guide.axis === 'y' && snappedY === undefined) {
        for (let i = 0; i < 3; i++) {
          if (Math.abs(activeYs[i] - guide.pos) < snapThreshold) {
            newY = guide.pos - (i === 0 ? 0 : (i === 1 ? activeEl.height / 2 : activeEl.height));
            snappedY = guide.pos;
            lines.push({ y: snappedY });
            break;
          }
        }
      }
    }

    // 2. Snap to Elements (fallback)
    elements.forEach(target => {
      if (target.id === dragging.id) return;
      
      const targetXs = [target.x, target.x + target.width / 2, target.x + target.width];
      const targetYs = [target.y, target.y + target.height / 2, target.y + target.height];
      
      if (snappedX === undefined) {
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            if (Math.abs(activeXs[i] - targetXs[j]) < snapThreshold) {
              newX = targetXs[j] - (i === 0 ? 0 : (i === 1 ? activeEl.width / 2 : activeEl.width));
              snappedX = targetXs[j];
              lines.push({ x: snappedX });
              break;
            }
          }
          if (snappedX !== undefined) break;
        }
      }
      
      if (snappedY === undefined) {
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            if (Math.abs(activeYs[i] - targetYs[j]) < snapThreshold) {
              newY = targetYs[j] - (i === 0 ? 0 : (i === 1 ? activeEl.height / 2 : activeEl.height));
              snappedY = targetYs[j];
              lines.push({ y: snappedY });
              break;
            }
          }
          if (snappedY !== undefined) break;
        }
      }
    });

    setSnapLines(lines);
    updateElement(dragging.id, { x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragging) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDragging(null);
      setSnapLines([]);
    }
  };

  const handleTopRulerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    const id = Math.random().toString(36).substring(2, 9);
    addGuideline({ id, axis: 'y', pos: 0 }); // starts at 0, pointermove immediately corrects it
    setDraggingGuide({ id, axis: 'y', isNew: true });
  };

  const handleLeftRulerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    const id = Math.random().toString(36).substring(2, 9);
    addGuideline({ id, axis: 'x', pos: 0 });
    setDraggingGuide({ id, axis: 'x', isNew: true });
  };

  return (
    <div className="canvas-wrapper" style={{ position: 'relative', overflow: 'auto', width: '100%', height: '100%', backgroundColor: '#fafafa' }}>
      
      {/* Top Ruler */}
      <div 
        style={{ position: 'sticky', top: 0, left: 24, right: 0, height: '24px', backgroundColor: '#f4f4f5', borderBottom: '1px solid #e4e4e7', cursor: 'row-resize', zIndex: 1000 }}
        onPointerDown={handleTopRulerDown}
        title="Drag to create horizontal guideline"
      >
        <div style={{ paddingLeft: '8px', fontSize: '10px', color: '#999', lineHeight: '24px' }}>Top Ruler (Drag down)</div>
      </div>

      {/* Left Ruler */}
      <div 
        style={{ position: 'sticky', top: 24, left: 0, bottom: 0, width: '24px', backgroundColor: '#f4f4f5', borderRight: '1px solid #e4e4e7', cursor: 'col-resize', zIndex: 1000 }}
        onPointerDown={handleLeftRulerDown}
        title="Drag to create vertical guideline"
      >
        <div style={{ writingMode: 'vertical-rl', paddingTop: '8px', fontSize: '10px', color: '#999', lineHeight: '24px', transform: 'rotate(180deg)' }}>Left Ruler (Drag right)</div>
      </div>

      <div style={{ padding: '40px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: 'calc(100% - 24px)', marginLeft: '24px' }}>
        <div 
          ref={boardRef}
          className="canvas-board"
          style={{
            width: finalWidth,
            height: finalHeight,
            backgroundColor: 'white',
            position: 'relative',
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.1s ease',
            margin: '0 auto'
          }}
          onClick={() => setSelectedElementId(null)}
        >
          {/* Custom Guidelines */}
          {guidelines.map(g => {
            const isX = g.axis === 'x';
            return (
              <div
                key={g.id}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setDraggingGuide({ id: g.id, axis: g.axis, isNew: false });
                }}
                style={{
                  position: 'absolute',
                  left: isX ? g.pos * MM_TO_PX : -2000,
                  right: isX ? 'auto' : -2000,
                  top: isX ? -2000 : g.pos * MM_TO_PX,
                  bottom: isX ? -2000 : 'auto',
                  width: isX ? 10 : 4000,
                  height: isX ? 4000 : 10,
                  transform: isX ? 'translateX(-5px)' : 'translateY(-5px)',
                  cursor: isX ? 'col-resize' : 'row-resize',
                  zIndex: 9998,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {/* Visual Line */}
                <div style={{ 
                  width: isX ? 1 : '100%', 
                  height: isX ? '100%' : 1, 
                  backgroundColor: '#0ea5e9' // Cyan/blue
                }} />
              </div>
            );
          })}

          {elements.map(el => {
            const isSelected = selectedElementId === el.id;
            const leftPx = el.x * MM_TO_PX;
            const topPx = el.y * MM_TO_PX;
            const widthPx = el.width * MM_TO_PX;
            const heightPx = el.height * MM_TO_PX;

            // Resize handler
            const handleResizeDown = (e: React.PointerEvent, dir: 'tl'|'tr'|'bl'|'br') => {
              e.stopPropagation();
              const startX = e.clientX;
              const startY = e.clientY;
              const startW = el.width;
              const startH = el.height;
              const startXmm = el.x;
              const startYmm = el.y;

              const onMove = (moveEvent: PointerEvent) => {
                const zoomLevel = useTemplateStore.getState().zoom;
                const dx = (moveEvent.clientX - startX) / zoomLevel / MM_TO_PX;
                const dy = (moveEvent.clientY - startY) / zoomLevel / MM_TO_PX;
                
                let newW = startW;
                let newH = startH;
                let newX = startXmm;
                let newY = startYmm;

                if (dir.includes('r')) newW = Math.max(5, startW + dx);
                if (dir.includes('b')) newH = Math.max(5, startH + dy);
                if (dir.includes('l')) {
                  newW = Math.max(5, startW - dx);
                  if (newW > 5) newX = startXmm + dx;
                }
                if (dir.includes('t')) {
                  newH = Math.max(5, startH - dy);
                  if (newH > 5) newY = startYmm + dy;
                }

                updateElement(el.id, { x: newX, y: newY, width: newW, height: newH });
              };

              const onUp = () => {
                window.removeEventListener('pointermove', onMove);
                window.removeEventListener('pointerup', onUp);
              };

              window.addEventListener('pointermove', onMove);
              window.addEventListener('pointerup', onUp);
            };

            return (
              <div
                key={el.id}
                className={`canvas-element ${isSelected ? 'selected' : ''}`}
                onPointerDown={(e) => handlePointerDown(e, el.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  left: leftPx,
                  top: topPx,
                  width: widthPx,
                  height: heightPx,
                  zIndex: el.zIndex,
                  cursor: dragging?.id === el.id ? 'grabbing' : 'grab',
                  display: 'flex',
                  alignItems: el.type === 'text' ? 'flex-start' : 'center',
                  justifyContent: el.type === 'text' ? (el as any).align : 'center',
                  backgroundColor: el.type === 'photo' ? 'rgba(0,0,0,0.1)' : 'transparent',
                  borderRadius: el.type === 'photo' ? `${(el as any).borderRadius * MM_TO_PX}px` : 0,
                  border: isSelected ? '1px solid var(--primary)' : '1px dashed transparent',
                  boxSizing: 'border-box',
                  transform: el.angle ? `rotate(${el.angle}deg)` : 'none',
                  transformOrigin: 'center center'
                }}
              >
                {/* Inner content with pointerEvents none so the wrapper gets the drag events */}
                <div style={{ width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', display: 'flex', alignItems: el.type === 'text' ? 'flex-start' : 'center', justifyContent: el.type === 'text' ? (el as any).align : 'center' }}>
                  {el.type === 'text' && (
                    <span style={{ 
                      fontFamily: (el as any).fontFamily, 
                      fontSize: `${(el as any).fontSize}pt`,
                      color: (el as any).color,
                      fontWeight: (el as any).weight,
                      textAlign: (el as any).align,
                      width: '100%',
                      lineHeight: (el as any).lineHeight || 1.2,
                      textTransform: (el as any).uppercase ? 'uppercase' : 'none',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {(el as any).content}
                    </span>
                  )}
                  {el.type === 'photo' && (
                    <span style={{ color: '#666', fontSize: '12px' }}>Photo Area</span>
                  )}
                  {el.type === 'qrcode' && (
                    <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#666' }}>QR</div>
                  )}
                </div>

                {isSelected && (
                  <>
                    <div onPointerDown={(e) => handleResizeDown(e, 'tl')} style={{ position: 'absolute', top: -4, left: -4, width: 8, height: 8, background: 'var(--primary)', cursor: 'nwse-resize' }} />
                    <div onPointerDown={(e) => handleResizeDown(e, 'tr')} style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, background: 'var(--primary)', cursor: 'nesw-resize' }} />
                    <div onPointerDown={(e) => handleResizeDown(e, 'bl')} style={{ position: 'absolute', bottom: -4, left: -4, width: 8, height: 8, background: 'var(--primary)', cursor: 'nesw-resize' }} />
                    <div onPointerDown={(e) => handleResizeDown(e, 'br')} style={{ position: 'absolute', bottom: -4, right: -4, width: 8, height: 8, background: 'var(--primary)', cursor: 'nwse-resize' }} />
                  </>
                )}
              </div>
            );
          })}

          {/* Snap Lines */}
          {snapLines.map((line, i) => {
            if (line.x !== undefined) {
              return <div key={`snap-x-${i}`} style={{ position: 'absolute', left: line.x * MM_TO_PX, top: 0, bottom: 0, width: 1, backgroundColor: 'red', zIndex: 9999, pointerEvents: 'none' }} />;
            }
            if (line.y !== undefined) {
              return <div key={`snap-y-${i}`} style={{ position: 'absolute', top: line.y * MM_TO_PX, left: 0, right: 0, height: 1, backgroundColor: 'red', zIndex: 9999, pointerEvents: 'none' }} />;
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
