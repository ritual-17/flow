export const GlobalWorkerOptions = {
  workerSrc: '',
};

export const getDocument = jest.fn(() => ({
  promise: Promise.resolve({
    numPages: 1,
    getPage: jest.fn().mockResolvedValue({
      getViewport: jest.fn().mockReturnValue({ width: 600, height: 800 }),
      render: jest.fn().mockReturnValue({
        promise: Promise.resolve(),
      }),
    }),
  }),
}));
