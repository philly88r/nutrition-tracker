exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Netlify function placeholder",
      timestamp: new Date().toISOString(),
    }),
  };
};