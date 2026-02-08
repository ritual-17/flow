import { Shape } from '@renderer/core/geometry/Shape';
import DynamicTextBox from '@renderer/ui/render/konva/text-box/DynamicTextBox';
import StaticTextBox from '@renderer/ui/render/konva/text-box/StaticTextBox';
import { useStore } from '@renderer/ui/Store';

interface LabelProps {
  shape: Shape;
}

function Label(args: LabelProps) {
  const { shape } = args;
  const isCurrentlyEditing = useStore((state) => state.editor.currentTextBox?.id) === shape.id;
  if (shape.type === 'textBox') return null;

  const { x, y } = resolveLabelPosition(shape);

  return isCurrentlyEditing ? (
    <DynamicTextBox {...args} />
  ) : (
    <StaticTextBox x={x} y={y} {...args} />
  );
}

function resolveLabelPosition(shape: Shape, labelDimensions?: { width: number; height: number }) {
  if (shape.type === 'textBox') {
    return { x: shape.x, y: shape.y };
  }

  const { width: labelWidth, height: labelHeight } =
    labelDimensions || shape.label.compiledImageMeta!;
  const shapeCenter = getCenterCoordinate(shape);
  return {
    x: shapeCenter.x - labelWidth / 2,
    y: shapeCenter.y - labelHeight / 2,
  };
}

// gets the center of the shape.
// for something like a rectangle, it would be x + width/2, y + height/2
function getCenterCoordinate(shape: Shape) {
  switch (shape.type) {
    case 'circle':
      return { x: shape.x, y: shape.y };
    default:
      return { x: shape.x, y: shape.y };
  }
}

export default Label;
