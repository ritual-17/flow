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

  return isCurrentlyEditing ? <DynamicTextBox {...args} /> : <StaticTextBox {...args} />;
}

export default Label;
