export const jsPDF = jest.fn().mockImplementation(() => ({
  addImage: jest.fn(),
  output: jest.fn().mockReturnValue(new ArrayBuffer(0)),
}));
