import { useCanvas } from '@renderer/context/CanvasContext';

const LinesDisplay = () => {
  const { lines } = useCanvas();

  return (
    <>
      {lines.map((line, index) => {
        return (
          <svg key={`line-${index}`} style={{ position: 'absolute', pointerEvents: 'none', width: "100%", height: "100%"}}>
            <defs>
              <marker
                id={`arrowhead`}
                markerWidth="6"
                markerHeight="6"
                refX="4"
                refY="3"
                orient="auto"
              >
                <polygon points="0 1, 4 3, 0 5" fill="rgba(0, 0, 255, 0.8)" />
              </marker>
            </defs>
            
            <line
              key={index}
              x1={line.position1.x}
              y1={line.position1.y}
              x2={line.position2.x}
              y2={line.position2.y}
              stroke="rgba(0,0,255,0.7)" // Line color, change as needed
              strokeWidth={line.size-13} // You can customize the line thickness
              markerEnd={line.type === 'arrow' ? 'url(#arrowhead)' : undefined}
            />
          </svg>
        );
      })}
    </>
  );
};

export default LinesDisplay;
