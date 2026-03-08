import { build, MultiLine } from '@renderer/core/geometry/shapes/MultiLine';
import Line from '@renderer/ui/render/konva/Line';
import { render } from '@testing-library/react';

// Mock react-konva
jest.mock('react-konva', () => ({
  Arrow: ({
    points,
    fill,
    stroke,
    pointerLength,
    pointerWidth,
    ...props
  }: {
    points: number[];
    fill: string;
    stroke: string;
    pointerLength: number;
    pointerWidth: number;
    [key: string]: unknown;
  }) => (
    <div
      data-testid='konva-arrow'
      data-points={JSON.stringify(points)}
      data-fill={fill}
      data-stroke={stroke}
      data-pointer-length={pointerLength}
      data-pointer-width={pointerWidth}
      {...props}
    />
  ),
  Line: ({
    points,
    stroke,
    ...props
  }: {
    points: number[];
    stroke: string;
    [key: string]: unknown;
  }) => (
    <div
      data-testid='konva-line'
      data-points={JSON.stringify(points)}
      data-stroke={stroke}
      {...props}
    />
  ),
}));

// Mock the hook
jest.mock('@renderer/ui/hooks/useResolvedPoints', () => ({
  useResolvedPoints: jest.fn(),
}));

// Mock Label
jest.mock('@renderer/ui/render/konva/style/Label', () => ({
  __esModule: true,
  default: ({ shape, center }: { shape: MultiLine; center: { x: number; y: number } }) => (
    <div
      data-testid='label'
      data-shape={JSON.stringify(shape)}
      data-center={JSON.stringify(center)}
    />
  ),
}));

import { useResolvedPoints } from '@renderer/ui/hooks/useResolvedPoints';

const mockUseResolvedPoints = useResolvedPoints as jest.MockedFunction<typeof useResolvedPoints>;

describe('Line Component', () => {
  const mockResolvedPoints = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 20, y: 10 },
    { x: 30, y: 10 },
  ];

  beforeEach(() => {
    mockUseResolvedPoints.mockReturnValue(mockResolvedPoints);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a line without arrows', () => {
    const shape = build({
      arrowStart: false,
      arrowEnd: false,
    });

    const { getByTestId } = render(<Line shape={shape} stroke='black' />);

    expect(getByTestId('konva-line')).toBeInTheDocument();
    expect(getByTestId('label')).toBeInTheDocument();

    // No arrows
    expect(() => getByTestId('konva-arrow')).toThrow();
  });

  it('renders an arrow at the end when arrowEnd is true', () => {
    const shape = build({
      arrowStart: false,
      arrowEnd: true,
    });

    const { getByTestId, getAllByTestId } = render(<Line shape={shape} stroke='black' />);

    expect(getByTestId('konva-line')).toBeInTheDocument();
    expect(getByTestId('label')).toBeInTheDocument();

    const arrows = getAllByTestId('konva-arrow');
    expect(arrows).toHaveLength(1);

    const arrow = arrows[0];
    expect(arrow).toHaveAttribute('data-points', JSON.stringify([20, 10, 30, 10])); // last segment
    expect(arrow).toHaveAttribute('data-fill', 'black');
    expect(arrow).toHaveAttribute('data-stroke', 'black');
    expect(arrow).toHaveAttribute('data-pointer-length', '12');
    expect(arrow).toHaveAttribute('data-pointer-width', '10');
  });

  it('renders an arrow at the start when arrowStart is true', () => {
    const shape = build({
      arrowStart: true,
      arrowEnd: false,
    });

    const { getByTestId, getAllByTestId } = render(<Line shape={shape} stroke='black' />);

    expect(getByTestId('konva-line')).toBeInTheDocument();
    expect(getByTestId('label')).toBeInTheDocument();

    const arrows = getAllByTestId('konva-arrow');
    expect(arrows).toHaveLength(1);

    const arrow = arrows[0];
    expect(arrow).toHaveAttribute('data-points', JSON.stringify([10, 0, 0, 0])); // start segment
    expect(arrow).toHaveAttribute('data-fill', 'black');
    expect(arrow).toHaveAttribute('data-stroke', 'black');
    expect(arrow).toHaveAttribute('data-pointer-length', '12');
    expect(arrow).toHaveAttribute('data-pointer-width', '10');
  });

  it('renders arrows at both ends when both flags are true', () => {
    const shape = build({
      arrowStart: true,
      arrowEnd: true,
    });

    const { getByTestId, getAllByTestId } = render(<Line shape={shape} stroke='black' />);

    expect(getByTestId('konva-line')).toBeInTheDocument();
    expect(getByTestId('label')).toBeInTheDocument();

    const arrows = getAllByTestId('konva-arrow');
    expect(arrows).toHaveLength(2);

    // Check start arrow
    const startArrow = arrows.find(
      (arrow) => arrow.getAttribute('data-points') === JSON.stringify([10, 0, 0, 0]),
    );
    expect(startArrow).toBeTruthy();

    // Check end arrow
    const endArrow = arrows.find(
      (arrow) => arrow.getAttribute('data-points') === JSON.stringify([20, 10, 30, 10]),
    );
    expect(endArrow).toBeTruthy();
  });

  it('does not render arrows when there are less than 2 points', () => {
    mockUseResolvedPoints.mockReturnValue([{ x: 0, y: 0 }]);

    const shape = build({
      arrowStart: true,
      arrowEnd: true,
    });

    const { getByTestId } = render(<Line shape={shape} stroke='black' />);

    expect(getByTestId('konva-line')).toBeInTheDocument();
    expect(getByTestId('label')).toBeInTheDocument();

    // No arrows because resolved.length < 2
    expect(() => getByTestId('konva-arrow')).toThrow();
  });

  it('calculates center correctly for even number of points', () => {
    // 4 points, even, center average of index 1 and 2
    const { getByTestId } = render(
      <Line shape={build({ arrowStart: false, arrowEnd: false })} stroke='black' />,
    );

    const label = getByTestId('label');
    expect(label).toHaveAttribute('data-center', JSON.stringify({ x: 15, y: 5 })); // average of resolved[1] and resolved[2]
  });

  it('calculates center correctly for odd number of points', () => {
    mockUseResolvedPoints.mockReturnValue([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 10 },
    ]); // 3 points, odd

    const { getByTestId } = render(
      <Line shape={build({ arrowStart: false, arrowEnd: false })} stroke='black' />,
    );

    const label = getByTestId('label');
    expect(label).toHaveAttribute('data-center', JSON.stringify({ x: 10, y: 0 })); // resolved[1] (floor(3/2)=1)
  });

  it('calculates center correctly for two points', () => {
    mockUseResolvedPoints.mockReturnValue([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]); // 2 points, even

    const { getByTestId } = render(
      <Line shape={build({ arrowStart: false, arrowEnd: false })} stroke='black' />,
    );

    const label = getByTestId('label');
    expect(label).toHaveAttribute('data-center', JSON.stringify({ x: 5, y: 0 })); // average of [0] and [1]
  });
});
