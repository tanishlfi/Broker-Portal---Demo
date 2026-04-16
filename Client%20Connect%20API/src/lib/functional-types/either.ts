const Right = (x: any) => ({
  chain: (f: any) => f(x),
  fold: (f: any, g: any) => g(x),
  map: (f: any) => Right(f(x)),
  extract: () => x,
  inspect: () => `Right(${x})`,
});

const Left = (x: any) => ({
  chain: (f: any) => f(x),
  fold: (f: any, g: any) => f(x),
  map: (f: any) => Left(x),
  extract: () => x,
  inspect: () => `Left(${x})`,
});

const tryCatch = (f: any) => {
  try {
    return Right(f);
  } catch (err) {
    return Left(err);
  }
};

export { Left, Right, tryCatch };
