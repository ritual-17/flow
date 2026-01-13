function hello(): string {
  return 'Hello World';
}

test('returns Hello World', () => {
  expect(hello()).toBe('Hello World');
});
