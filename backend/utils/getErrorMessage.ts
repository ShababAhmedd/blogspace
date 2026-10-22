const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : String(error);
};

export default getErrorMessage;
