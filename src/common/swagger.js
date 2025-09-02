// swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mindmeld',
      version: '1.0.0',
      description: '공부의 숲 API 문서',
    },
    servers: [
      { url: 'http://localhost:3000', description: '개발 서버' },
      {
        url: 'https://eight-studyforest-team2-be.onrender.com',
        description: '운영 서버',
      },
    ],
  },
  apis: [path.resolve(__dirname, '../api/routes/*.js')], // JSDoc 주석 기반으로 문서 생성
};

const swaggerSpec = swaggerJsdoc(options);

export function swaggerDocs(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('📄 Swagger UI: http://localhost:3000/api-docs');
  console.log(
    '📄 Swagger UI: https://eight-studyforest-team2-be.onrender.com/api-docs',
  );
}
