import { Shape } from '@renderer/core/geometry/Shape';
import DynamicTextBox from '@renderer/ui/render/konva/text-box/DynamicTextBox';
import { LocationResolver } from '@renderer/ui/render/konva/text-box/LocationResolver';
import StaticTextBox from '@renderer/ui/render/konva/text-box/StaticTextBox';
import { useStore } from '@renderer/ui/Store';

interface LabelProps {
  shape: Shape;
}

function Label(args: LabelProps) {
  const { shape } = args;
  const isCurrentlyEditing = useStore((state) => state.editor.currentTextBox?.id) === shape.id;
  if (shape.type === 'textBox') return null;

  if (isCurrentlyEditing) {
    return <DynamicTextBox {...args} />;
  } else if (shape.label.compiledImageMeta) {
    const { x, y } = LocationResolver.resolveImagePosition(shape);
    return <StaticTextBox x={x} y={y} {...args} />;
  }
  return null;
}

export default Label;
