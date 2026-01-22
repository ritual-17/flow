import { render, screen } from '@testing-library/react';

const Welcome = () => {
  return <h1>Welcome to React Testing</h1>;
};

test('renders welcome message', () => {
  render(<Welcome />);
  expect(screen.getByText(/welcome to react testing/i)).toBeInTheDocument();
});
