import swaggerJSDoc from "swagger-jsdoc";

export const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EstateFlow API",
      version: "1.0.0",
      description: "API documentation for the EstateFlow application",
    },
    servers: [
      {
        url: "http://localhost:10000",
      },
    ],
  },
  apis: [
    "./src/routes/*.ts",
  ],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
