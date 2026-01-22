/* eslint-disable react/prop-types */
import { TextBox as DomainText } from '@renderer/core/geometry/Shape';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { Text as KonvaText } from 'react-konva';

const Text: ShapeComponent<DomainText> = ({ shape }) => {
  return <KonvaText text={shape.text} x={shape.x} y={shape.y} />;
};

export default Text;
