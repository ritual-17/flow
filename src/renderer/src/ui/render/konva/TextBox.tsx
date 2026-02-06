import { TextBox as DomainText } from '@renderer/core/geometry/shapes/TextBox';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import CompiledTextBox from '@renderer/ui/render/konva/text-box/CompiledTextBox';
import EditingTextBox from '@renderer/ui/render/konva/text-box/EditingTextBox';
import { useStore } from '@renderer/ui/Store';

const TextBox: ShapeComponent<DomainText> = (args) => {
  const { shape } = args;
  const isCurrentlyEditing = useStore((state) => state.editor.currentTextBox?.id) === shape.id;

  return isCurrentlyEditing ? <EditingTextBox {...args} /> : <CompiledTextBox {...args} />;
};

export default TextBox;
