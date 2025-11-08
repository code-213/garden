export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Plant & Protect API',
    version: '1.0.0',
    description: 'REST API for environmental conservation platform'
  },
  servers: [
    {
      url: 'http://localhost:8000/api/v1',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};
