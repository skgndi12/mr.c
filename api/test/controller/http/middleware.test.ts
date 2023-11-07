import { Request, Response, Router } from 'express';
import express from 'express';
import { middleware as OpenApiValidatorMiddleware } from 'express-openapi-validator';
import { Express } from 'express-serve-static-core';
import http from 'http';
import path from 'path';
import request from 'supertest';
import { Tspec, generateTspec } from 'tspec';
import { Logger } from 'winston';

import {
  BadRequestErrorType,
  CustomError,
  InternalErrorType,
  MethodNotAllowedErrorType,
  NotFoundErrorType,
  UnauthorizedErrorType
} from '@src/controller/http/errors';
import { Middleware } from '@src/controller/http/middleware';

class TestHttpServer {
  middleware: Middleware;
  server!: http.Server;
  app!: Express;

  constructor(private readonly logger: Logger) {
    this.middleware = new Middleware(this.logger);
  }

  public start = async (): Promise<void> => {
    this.app = express();
    // Uncomment when you need to generate a new OpenAPI Specification
    // await this.generateApiSpec();
    this.app.use(
      OpenApiValidatorMiddleware({
        apiSpec: path.join(__dirname, '../../../generate/openapi.test.json'),
        validateRequests: true,
        validateResponses: true
      })
    );
    this.app.use('/api', this.getRouters());
    this.app.use(this.middleware.handleError);
    // TODO: https://github.com/MovieReviewComment/Mr.C/issues/49
    this.app.use(this.middleware.handleNotFoundRoute);

    this.server = this.app.listen(0, () => {
      return;
    });
  };

  public close = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  private getRouters = (): express.Router[] => {
    const routers = [new TestController(this.logger).routes()];
    return routers;
  };

  private generateApiSpec = async (): Promise<void> => {
    const apiDocumentOptions: Tspec.GenerateParams = {
      specPathGlobs: ['test/controller/http/middleware.test.ts'],
      tsconfigPath: './tsconfig.json',
      outputPath: './generate/openapi.test.json',
      specVersion: 3,
      openapi: {
        title: 'Mr.C API test',
        version: '0.0.1',
        securityDefinitions: {
          jwt: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      debug: false,
      ignoreErrors: false
    };
    await generateTspec(apiDocumentOptions);
  };
}

type TestApiSpec = Tspec.DefineApiSpec<{
  basePath: '/api/v1/dev';
  tags: ['Test'];
  paths: {
    '/throwSyncCustomError': {
      post: {
        summary: 'Throw sync custom error';
        handler: typeof TestController.prototype.throwSyncCustomError;
      };
    };
    '/throwAsyncCustomError': {
      post: {
        summary: 'Throw async custom error';
        handler: typeof TestController.prototype.throwAsyncCustomError;
      };
    };
    '/throwSyncError': {
      post: {
        summary: 'Throw sync error';
        handler: typeof TestController.prototype.throwSyncError;
      };
    };
    '/throwAsyncError': {
      post: {
        summary: 'Throw async error';
        handler: typeof TestController.prototype.throwAsyncError;
      };
    };
    '/authRequired': {
      get: {
        security: 'jwt';
        summary: 'Authorization header required';
        handler: typeof TestController.prototype.authRequired;
      };
    };
  };
}>;

class TestController {
  constructor(public logger: Logger) {}

  routes(): Router {
    const router: Router = Router();
    const prefix = '/v1/dev';

    router.use(express.json());
    router.post(`${prefix}/throwSyncCustomError`, this.throwSyncCustomError);
    router.post(`${prefix}/throwAsyncCustomError`, this.throwAsyncCustomError);
    router.post(`${prefix}/throwSyncError`, this.throwSyncError);
    router.post(`${prefix}/throwAsyncError`, this.throwAsyncError);
    router.get(`${prefix}/authRequired`, this.authRequired);
    return router;
  }

  public throwSyncCustomError = (req: Request, res: Response) => {
    throw new CustomError(
      InternalErrorType.UNEXPECTED,
      'Error from throwSyncCustomError'
    );
  };

  public throwAsyncCustomError = async (req: Request, res: Response) => {
    throw new CustomError(
      InternalErrorType.UNEXPECTED,
      'Error from throwAsyncCustomError'
    );
  };

  public throwSyncError = (req: Request, res: Response) => {
    throw new Error('Error from throwSyncError');
  };

  public throwAsyncError = async (req: Request, res: Response) => {
    throw new Error('Error from throwAsyncError');
  };

  public authRequired = async (req: Request, res: Response) => {
    res.send({ message: 'Authentication verified' });
  };
}

describe('Test middleware', () => {
  let mockLogger: Partial<Logger>;
  let testHttpServer: TestHttpServer;
  let baseUrl: string;

  beforeAll(async () => {
    mockLogger = { error: jest.fn(), warn: jest.fn() };
    testHttpServer = new TestHttpServer(mockLogger as Logger);
    baseUrl = '/api/v1/dev';
    await testHttpServer.start();
  });

  afterAll(async () => {
    await testHttpServer.close();
  });

  it('should 500 when sync handle func throw InternalErrorType custom error', async () => {
    const response = await request(testHttpServer.app).post(
      `${baseUrl}/throwSyncCustomError`
    );
    expect(response.status).toEqual(500);
    expect(response.body).toStrictEqual({
      type: InternalErrorType.UNEXPECTED,
      messages: ['Error from throwSyncCustomError']
    });
  });

  it('should 500 when async handle func throw InternalErrorType custom error', async () => {
    const response = await request(testHttpServer.app).post(
      `${baseUrl}/throwAsyncCustomError`
    );
    expect(response.status).toEqual(500);
    expect(response.body).toStrictEqual({
      type: InternalErrorType.UNEXPECTED,
      messages: ['Error from throwAsyncCustomError']
    });
  });

  it('should 500 when sync handle func throw raw error', async () => {
    const response = await request(testHttpServer.app).post(
      `${baseUrl}/throwSyncError`
    );
    expect(response.status).toEqual(500);
    expect(response.body).toStrictEqual({
      type: InternalErrorType.UNEXPECTED,
      messages: ['Unexpected error occured, error: Error from throwSyncError']
    });
  });

  it('should 500 when async handle func throw raw error', async () => {
    const response = await request(testHttpServer.app).post(
      `${baseUrl}/throwAsyncError`
    );
    expect(response.status).toEqual(500);
    expect(response.body).toStrictEqual({
      type: InternalErrorType.UNEXPECTED,
      messages: ['Unexpected error occured, error: Error from throwAsyncError']
    });
  });

  it('should 400 when unknown query passed', async () => {
    const response = await request(testHttpServer.app).post(
      `${baseUrl}/throwSyncCustomError?foo=123`
    );
    expect(response.status).toEqual(400);
    expect(response.body.type).toEqual(BadRequestErrorType.BAD_REQUEST);
  });

  it('should 200 when correct authorization header passed', async () => {
    const response = await request(testHttpServer.app)
      .get(`${baseUrl}/authRequired`)
      .set('Authorization', 'Bearer test');
    expect(response.status).toEqual(200);
    expect(response.body.message).toEqual('Authentication verified');
  });

  it('should 401 when authorization header does not passed', async () => {
    const response = await request(testHttpServer.app).get(
      `${baseUrl}/authRequired`
    );
    expect(response.status).toEqual(401);
    expect(response.body.type).toEqual(UnauthorizedErrorType.UNAUTHORIZED);
  });

  it('should 404 when no matching route found', async () => {
    const response = await request(testHttpServer.app).post(
      `${baseUrl}/wrongPath`
    );
    expect(response.status).toEqual(404);
    expect(response.body.type).toEqual(NotFoundErrorType.ROUTE_NOT_FOUND);
  });

  it('should 405 when method not allowed', async () => {
    const response = await request(testHttpServer.app).get(
      `${baseUrl}/throwSyncCustomError`
    );
    expect(response.status).toEqual(405);
    expect(response.body.type).toEqual(
      MethodNotAllowedErrorType.METHOD_NOT_ALLOWED
    );
  });
});
