import { build as buildRectangle } from '@renderer/core/geometry/shapes/Rectangle';
import { build as buildSquare } from '@renderer/core/geometry/shapes/Square';
import Rectangle from '@renderer/ui/render/konva/Rectangle';
import Square from '@renderer/ui/render/konva/Square';
import { render } from '@testing-library/react';

// Mock react-konva
jest.mock('react-konva', () => ({
  Rect: ({
    x,
    y,
    width,
    height,
    fill,
    stroke,
    strokeWidth,
    ...props
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    [key: string]: unknown;
  }) => (
    <div
      data-testid='konva-rect'
      data-x={x}
      data-y={y}
      data-width={width}
      data-height={height}
      data-fill={fill}
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
      {...props}
    />
  ),
}));

describe('Shape Components', () => {
  describe('Square Component', () => {
    it('renders a square with default dimensions', () => {
      const shape = buildSquare({
        x: 10,
        y: 20,
        fillColor: 'blue',
        strokeWidth: 2,
      });

      const { getByTestId } = render(<Square shape={shape} stroke='black' />);

      const rect = getByTestId('konva-rect');
      expect(rect).toHaveAttribute('data-x', '10');
      expect(rect).toHaveAttribute('data-y', '20');
      expect(rect).toHaveAttribute('data-width', '100');
      expect(rect).toHaveAttribute('data-height', '100');
      expect(rect).toHaveAttribute('data-fill', 'blue');
      expect(rect).toHaveAttribute('data-stroke', 'black');
      expect(rect).toHaveAttribute('data-stroke-width', '2');
    });

    it('renders a square with custom dimensions', () => {
      const shape = buildSquare({
        x: 5,
        y: 15,
        width: 50,
        height: 50,
        fillColor: 'red',
        strokeWidth: 3,
      });

      const { getByTestId } = render(<Square shape={shape} stroke='green' />);

      const rect = getByTestId('konva-rect');
      expect(rect).toHaveAttribute('data-x', '5');
      expect(rect).toHaveAttribute('data-y', '15');
      expect(rect).toHaveAttribute('data-width', '50');
      expect(rect).toHaveAttribute('data-height', '50');
      expect(rect).toHaveAttribute('data-fill', 'red');
      expect(rect).toHaveAttribute('data-stroke', 'green');
      expect(rect).toHaveAttribute('data-stroke-width', '3');
    });

    it('renders a square with zero dimensions', () => {
      const shape = buildSquare({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        fillColor: 'transparent',
        strokeWidth: 1,
      });

      const { getByTestId } = render(<Square shape={shape} stroke='purple' />);

      const rect = getByTestId('konva-rect');
      expect(rect).toHaveAttribute('data-x', '0');
      expect(rect).toHaveAttribute('data-y', '0');
      expect(rect).toHaveAttribute('data-width', '0');
      expect(rect).toHaveAttribute('data-height', '0');
      expect(rect).toHaveAttribute('data-fill', 'transparent');
      expect(rect).toHaveAttribute('data-stroke', 'purple');
      expect(rect).toHaveAttribute('data-stroke-width', '1');
    });
  });

  describe('Rectangle Component', () => {
    it('renders a rectangle with default dimensions', () => {
      const shape = buildRectangle({
        x: 25,
        y: 35,
        fillColor: 'yellow',
        strokeWidth: 4,
      });

      const { getByTestId } = render(<Rectangle shape={shape} stroke='orange' />);

      const rect = getByTestId('konva-rect');
      expect(rect).toHaveAttribute('data-x', '25');
      expect(rect).toHaveAttribute('data-y', '35');
      expect(rect).toHaveAttribute('data-width', '100');
      expect(rect).toHaveAttribute('data-height', '50');
      expect(rect).toHaveAttribute('data-fill', 'yellow');
      expect(rect).toHaveAttribute('data-stroke', 'orange');
      expect(rect).toHaveAttribute('data-stroke-width', '4');
    });

    it('renders a rectangle with custom dimensions', () => {
      const shape = buildRectangle({
        x: 100,
        y: 200,
        width: 150,
        height: 75,
        fillColor: 'green',
        strokeWidth: 5,
      });

      const { getByTestId } = render(<Rectangle shape={shape} stroke='blue' />);

      const rect = getByTestId('konva-rect');
      expect(rect).toHaveAttribute('data-x', '100');
      expect(rect).toHaveAttribute('data-y', '200');
      expect(rect).toHaveAttribute('data-width', '150');
      expect(rect).toHaveAttribute('data-height', '75');
      expect(rect).toHaveAttribute('data-fill', 'green');
      expect(rect).toHaveAttribute('data-stroke', 'blue');
      expect(rect).toHaveAttribute('data-stroke-width', '5');
    });

    it('renders a rectangle with extreme dimensions', () => {
      const shape = buildRectangle({
        x: -10,
        y: -20,
        width: 500,
        height: 300,
        fillColor: 'purple',
        strokeWidth: 10,
      });

      const { getByTestId } = render(<Rectangle shape={shape} stroke='pink' />);

      const rect = getByTestId('konva-rect');
      expect(rect).toHaveAttribute('data-x', '-10');
      expect(rect).toHaveAttribute('data-y', '-20');
      expect(rect).toHaveAttribute('data-width', '500');
      expect(rect).toHaveAttribute('data-height', '300');
      expect(rect).toHaveAttribute('data-fill', 'purple');
      expect(rect).toHaveAttribute('data-stroke', 'pink');
      expect(rect).toHaveAttribute('data-stroke-width', '10');
    });
  });
});
