import { TextBox as DomainText } from '@renderer/core/geometry/shapes/TextBox';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import DynamicTextBox from '@renderer/ui/render/konva/text-box/DynamicTextBox';
import StaticTextBox from '@renderer/ui/render/konva/text-box/StaticTextBox';
import { useStore } from '@renderer/ui/Store';

const TextBox: ShapeComponent<DomainText> = (args) => {
  const { shape } = args;
  const isCurrentlyEditing = useStore((state) => state.editor.currentTextBox?.id) === shape.id;

  return isCurrentlyEditing ? <DynamicTextBox {...args} /> : <StaticTextBox {...args} />;
};

export default TextBox;
