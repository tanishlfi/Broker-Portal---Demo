import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Broker Portal API',
      version: '1.0.0',
      description: 'API documentation for the Broker Portal - Client Connect API',
    },
    servers: [
      {
        url: 'http://localhost:8000/apirma/v1', // Added the prefix
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/controllers/*.ts', './src/routes/*.ts'], // Path to the API docs
};

export const specs = swaggerJsdoc(options);
