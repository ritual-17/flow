import { Shape } from '@renderer/core/geometry/Shape';
import { useStore } from '@renderer/ui/Store';
import { useCallback, useEffect, useRef } from 'react';

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapes = useStore((state) => state.document.shapes);
  const mode = useStore((state) => state.editor.mode);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get visible shapes (for now, render all - optimize with viewport later)
    const allShapes = Array.from(shapes.values());

    // Render shapes
    allShapes.forEach((shape) => {
      renderShape(ctx, shape);
    });

    // Render preview shape if exists
  }, [shapes]);

  // Re-render when shapes change
  useEffect(() => {
    render();
  }, [render]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      render();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [render]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  };

  return (
    <canvas
      ref={canvasRef}
      className={`flex-1 ${mode === 'normal' ? 'cursor-default' : 'cursor-crosshair'}`}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
    />
  );
}

// Helper function to render a shape
function renderShape(ctx: CanvasRenderingContext2D, shape: Shape, isPreview = false) {
  ctx.save();

  // Set style
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = 'transparent';
  ctx.lineWidth = 2;

  if (isPreview) {
    ctx.setLineDash([5, 5]);
    ctx.globalAlpha = 0.5;
  }

  switch (shape.type) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
      ctx.stroke();
      if (shape.fill) ctx.fill();
      break;

    default:
      console.warn('Unknown shape type:', shape.type);
  }

  ctx.restore();
}
