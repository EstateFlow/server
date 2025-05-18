import swaggerJSDoc from "swagger-jsdoc";

export const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SmartRealty API",
      version: "1.0.0",
      description: "API documentation for the SmartRealty application",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: [
    "./src/routes/*.ts",
  ],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
