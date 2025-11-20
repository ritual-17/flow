import { useCanvas } from '@renderer/context/CanvasContext';

const LinesDisplay = () => {
  const { lines } = useCanvas();

  return (
    <>
      {lines.map((line, index) => {
        return (
          <svg key={`line-${index}`} style={{ position: 'absolute', pointerEvents: 'none', width: "100%", height: "100%"}}>
            <line
              key={index}
              x1={line.position1.x}
              y1={line.position1.y}
              x2={line.position2.x}
              y2={line.position2.y}
              stroke="rgba(0,0,255,0.7)" // Line color, change as needed
              strokeWidth={line.size-13} // You can customize the line thickness
            />
          </svg>
        );
      })}
    </>
  );
};

export default LinesDisplay;
