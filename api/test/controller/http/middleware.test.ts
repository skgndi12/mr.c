import cookieParser from 'cookie-parser';
import { Request, Response, Router } from 'express';
import express from 'express';
import { middleware as OpenApiValidatorMiddleware } from 'express-openapi-validator';
import { Express } from 'express-serve-static-core';
import http from 'http';
import path from 'path';
import request from 'supertest';
import { Tspec, generateTspec } from 'tspec';
import { Logger } from 'winston';

import { Middleware } from '@src/controller/http/middleware';
import { AppIdToken } from '@src/core/entities/auth.entity';
import { JwtHandler } from '@src/core/ports/jwt.handler';
import { CustomError, HttpErrorCode } from '@src/error/errors';
import { JwtClient } from '@src/jwt/jwt.client';

import { HttpErrorResponse } from '@controller/http/response';
import { idTokenCookieName } from '@controller/http/types';

class TestHttpServer {
  middleware: Middleware;
  server!: http.Server;
  app!: Express;

  constructor(
    private readonly logger: Logger,
    private readonly jwtHandler: JwtHandler
  ) {
    this.middleware = new Middleware(this.logger, this.jwtHandler);
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
    this.app.use('/api', cookieParser());
    this.app.use('/api/v1/dev/authRequired', this.middleware.issuePassport);
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

interface AuthRequiredResponse {
  message: string;
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
        summary: 'Authorization header required';
        responses: {
          200: AuthRequiredResponse;
          default: HttpErrorResponse;
        };
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
    router.use(cookieParser());
    router.post(`${prefix}/throwSyncCustomError`, this.throwSyncCustomError);
    router.post(`${prefix}/throwAsyncCustomError`, this.throwAsyncCustomError);
    router.post(`${prefix}/throwSyncError`, this.throwSyncError);
    router.post(`${prefix}/throwAsyncError`, this.throwAsyncError);
    router.get(`${prefix}/authRequired`, this.authRequired);
    return router;
  }

  public throwSyncCustomError = (req: Request, res: Response) => {
    throw new CustomError({
      code: HttpErrorCode.INTERNAL_ERROR,
      cause: new Error('Internal error'),
      message: 'Error from throwSyncCustomError'
    });
  };

  public throwAsyncCustomError = async (req: Request, res: Response) => {
    throw new CustomError({
      code: HttpErrorCode.INTERNAL_ERROR,
      cause: new Error('Internal error'),
      message: 'Error from throwAsyncCustomError'
    });
  };

  public throwSyncError = (req: Request, res: Response) => {
    throw new Error('Error from throwSyncError');
  };

  public throwAsyncError = async (req: Request, res: Response) => {
    throw new Error('Error from throwAsyncError');
  };

  public authRequired = async (
    req: Request,
    res: Response<AuthRequiredResponse, AppIdToken>
  ) => {
    res.send({ message: 'Authentication verified' });
  };
}

describe('Test middleware', () => {
  let mockLogger: Partial<Logger>;
  let jwtClient: JwtClient;
  let testHttpServer: TestHttpServer;
  let baseUrl: string;

  beforeAll(async () => {
    mockLogger = { error: jest.fn(), warn: jest.fn() };
    jwtClient = new JwtClient({
      activeKeyPair: 'test',
      expirationHour: 1,
      keyPairs: [
        {
          name: 'test',
          private:
            '-----BEGIN RSA PRIVATE KEY-----\nMIIEpQIBAAKCAQEAsNp22LRZ1VNL+0KI21Cd7XFIF5bdN4fiNjESGMcH8iylL0Pg\n924lYq/Jtt8wtBAVUn6W87hRqFN4jwrHfcaGd25aTf/MnR9asteSj8+d9K/s8UOL\nMQMRPjY0ud/NNL4Bn3LubjwLXjEkhV6bC9LeIZSAFiomjjqW2V4rFecffngdtOo8\nP77P19Rg5snQkLox1ABmVGE9+XWU2Hr1vZ+mh2WqwGmQr/j5Us6QZ8vvKR0oQdmz\nz9+P/1w/xwEYvZhZyn1hTWvBEufUQYWSb0ve/uKYA36hQt+ou2Y7ITRR0raFePtw\niwRfIT1cqeqG6+n+uMiT5kh70P6vQbglfCj91QIDAQABAoIBAGl4H+Bkzh42qt2R\ndGS20zhDkqbexdbUJsgCw7QbHlYC4hAp/wQQoCMWismQmU8JOG4WKJf4mFo2TXOh\nDg+oUZDwMtLJdpFNnZ2CillRi/Xc5QWNLnlwRtw/H3qqSYrmtbkNpbv/+xeVXx5a\nqUSH4QlNsoWFZbD0p/nB+xf42gNlSO5pOOqP5iXt5wJBbWhpomqFFZuD/+Pf6Uma\n+YNB6u6/obdS+AaHt3TIUck2CtMgZ49jI+rx87JEpNO2QVeiprTDBlZMyzxTQi3W\n3tfY5o5Nsu42ZyptZSTacNKgOzKub/7T0p6852j/fOXGQvVRT8baVFAeM9TrPExS\np2f/84ECgYEA3eaM/Q+flts3KJBpiTw5kwD5v6vAoZ4oGlJIxlMEjE4vLtruS1Fa\nYxChOeEmdu9oAk3drxDmtPmNTKXnlv75P2/h0Qi1burEF0wcQN5tUF1blcdgG4kr\nQVCf+Bwk03lVcPS8YxxeHCpq5NEEKLFImkjbY/X9pqWxQbsPjZOTfxkCgYEAzAfH\nznohrkWoy1guV/sxZjs6AIwBqM1uWhraXmDc+yVc1nNMKuyL5LKuaJFWSwXWMe2F\nhUT5BYs3ajtpEboxmQ+V9nCM6jbSSsxSrWe8sOffZj2hTbsJh8/N5rXTK1QaMRD3\ns1BQINAofxitFxKYWJ60tKAhTlmNMMwfH7Y7WB0CgYEAlN0cbJDUoWHDKUVoZ5at\nkT8wTTOt8T6m7LGS/OmovW+eG7Ln9kNHffokDy5KnbOSdSlDtTSDcZmQ/4C1UwkO\nsU4fkhpjjVuV3YND2QjfEPDwhhTRFuf4ysKJ7usCkZRui27EC0F2qTKTr5nBToNQ\nj6Cc/fyDBA9YUR5rGrGMW9ECgYEAxqKciAynVb9DwhSrqcRIJ7tpkLa9ttWppdeW\n2WN8QJXzeGTvtqps186Ntggo9wlLq3gPEdxAhIExBh+o/zVCrD1cRnz08+FDgsbB\nh0kDj0dvW16M99wsPyi00PQcDobmqPZX8R8zo36Erpgbi+byovSAAYoUYu8UYnmX\no4wK4pECgYEA2HY5ChDIAwucoN0mHDRsCUDQqopiI7rS9WckH6LnNbB5H9/mKvOK\ncHgqP1sH8xA9hYK1Gh5LljUHbwp3XAaLZULkDsMgPKG7DpnBN81Jq9avo0k9tl9b\nziVXu0bWgX8bIt9cmoG5eP9jx8oCTnR/l7xDxOTsDH1VV91lQjfj9fo=\n-----END RSA PRIVATE KEY-----\n',
          public:
            '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsNp22LRZ1VNL+0KI21Cd\n7XFIF5bdN4fiNjESGMcH8iylL0Pg924lYq/Jtt8wtBAVUn6W87hRqFN4jwrHfcaG\nd25aTf/MnR9asteSj8+d9K/s8UOLMQMRPjY0ud/NNL4Bn3LubjwLXjEkhV6bC9Le\nIZSAFiomjjqW2V4rFecffngdtOo8P77P19Rg5snQkLox1ABmVGE9+XWU2Hr1vZ+m\nh2WqwGmQr/j5Us6QZ8vvKR0oQdmzz9+P/1w/xwEYvZhZyn1hTWvBEufUQYWSb0ve\n/uKYA36hQt+ou2Y7ITRR0raFePtwiwRfIT1cqeqG6+n+uMiT5kh70P6vQbglfCj9\n1QIDAQAB\n-----END PUBLIC KEY-----\n'
        }
      ]
    });
    testHttpServer = new TestHttpServer(mockLogger as Logger, jwtClient);
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
      messages: ['Error from throwSyncCustomError']
    });
  });

  it('should 500 when async handle func throw InternalErrorType custom error', async () => {
    const response = await request(testHttpServer.app).post(
      `${baseUrl}/throwAsyncCustomError`
    );
    expect(response.status).toEqual(500);
    expect(response.body).toStrictEqual({
      messages: ['Error from throwAsyncCustomError']
    });
  });

  it('should 500 when sync handle func throw raw error', async () => {
    const response = await request(testHttpServer.app).post(
      `${baseUrl}/throwSyncError`
    );
    expect(response.status).toEqual(500);
    expect(response.body).toStrictEqual({
      messages: ['Unexpected error occured']
    });
  });

  it('should 500 when async handle func throw raw error', async () => {
    const response = await request(testHttpServer.app).post(
      `${baseUrl}/throwAsyncError`
    );
    expect(response.status).toEqual(500);
    expect(response.body).toStrictEqual({
      messages: ['Unexpected error occured']
    });
  });

  it('should 400 when unknown query passed', async () => {
    const response = await request(testHttpServer.app).post(
      `${baseUrl}/throwSyncCustomError?foo=123`
    );
    expect(response.status).toEqual(400);
  });

  it('should 200 when valid Authorization header is provided', async () => {
    const response = await request(testHttpServer.app)
      .get(`${baseUrl}/authRequired`)
      .set(
        'Authorization',
        'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InRlc3QifQ.eyJpc3MiOiJtb3ZpZS1yZWl2ZXctY29tbWVudCIsImlhdCI6MTcwNjYzMTcyMCwibmJmIjoxNzA2NjMxNzIwLCJleHAiOjQ4NjIzMDUzMjAsInVzZXJJZCI6ImZjOGUwNTkyLWMyNmEtNGMwOS05ZGY2LWUyNWE2ZjA0Yjg5MiIsIm5pY2tuYW1lIjoi7ZuM66Wt7ZWcIOyLnOuEpO2VhCDstIjroZ3sg4kg64uk656M7KWQIiwidGFnIjoiI1pKNzAiLCJpZHAiOiJHT09HTEUiLCJlbWFpbCI6ImRvd2hhdHlvdXdhbnQwNzI0QGdtYWlsLmNvbSIsImFjY2Vzc0xldmVsIjoiVVNFUiJ9.DOTaPkL_-KL6s81Syfk98rc552e6Cj44yfZUta3VqSBYjbk5PxPI2I45egvIv0k1bQPWhPhsZxTXGr-JD4HTlJO3bxnUYlXgKfcpxc7Q4tnpCpHUozOexXRukNECvWVUhPaxcRWAGODYoF0hkefXNvQbT3Po3hQ_YOEHsQCxl15xq8ujowJg86C6w_xSwdM6be51Lng1vdVP9StotWpft6AaomTNboB1Mg8Acl-7XvdWEhDW30lV52fIFJKZn_rrutcenHHvZD60erG0GycnK5-nPBKNv9KCu1H8uWbg3iUcCC-HrRc5a6oxbDgyhGaMg1h3b32yHczVlqehodMMvQ'
      )
      .expect(200);

    expect(response.body.message).toEqual('Authentication verified');
  });

  it('should 200 when valid cookie is provided', async () => {
    const response = await request(testHttpServer.app)
      .get(`${baseUrl}/authRequired`)
      .set(
        'Cookie',
        `${idTokenCookieName}=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InRlc3QifQ.eyJpc3MiOiJtb3ZpZS1yZWl2ZXctY29tbWVudCIsImlhdCI6MTcwNjYzMTcyMCwibmJmIjoxNzA2NjMxNzIwLCJleHAiOjQ4NjIzMDUzMjAsInVzZXJJZCI6ImZjOGUwNTkyLWMyNmEtNGMwOS05ZGY2LWUyNWE2ZjA0Yjg5MiIsIm5pY2tuYW1lIjoi7ZuM66Wt7ZWcIOyLnOuEpO2VhCDstIjroZ3sg4kg64uk656M7KWQIiwidGFnIjoiI1pKNzAiLCJpZHAiOiJHT09HTEUiLCJlbWFpbCI6ImRvd2hhdHlvdXdhbnQwNzI0QGdtYWlsLmNvbSIsImFjY2Vzc0xldmVsIjoiVVNFUiJ9.DOTaPkL_-KL6s81Syfk98rc552e6Cj44yfZUta3VqSBYjbk5PxPI2I45egvIv0k1bQPWhPhsZxTXGr-JD4HTlJO3bxnUYlXgKfcpxc7Q4tnpCpHUozOexXRukNECvWVUhPaxcRWAGODYoF0hkefXNvQbT3Po3hQ_YOEHsQCxl15xq8ujowJg86C6w_xSwdM6be51Lng1vdVP9StotWpft6AaomTNboB1Mg8Acl-7XvdWEhDW30lV52fIFJKZn_rrutcenHHvZD60erG0GycnK5-nPBKNv9KCu1H8uWbg3iUcCC-HrRc5a6oxbDgyhGaMg1h3b32yHczVlqehodMMvQ`
      )
      .expect(200);

    expect(response.body.message).toEqual('Authentication verified');
  });

  it('should 401 when the Authorization header is not in the Bearer format', async () => {
    const response = await request(testHttpServer.app)
      .get(`${baseUrl}/authRequired`)
      .set('Authorization', 'Test')
      .expect(401);

    expect(response.body.messages).toBeDefined();
    expect(response.body.messages).toEqual([
      'Authorization header must be in Bearer format'
    ]);
  });

  it('should 401 when the cookie does not exist', async () => {
    const response = await request(testHttpServer.app)
      .get(`${baseUrl}/authRequired`)
      .expect(401);

    expect(response.body.messages).toBeDefined();
    expect(response.body.messages).toEqual(['cookie does not exist']);
  });

  it('should 404 when no matching route found', async () => {
    const response = await request(testHttpServer.app).post(
      `${baseUrl}/wrongPath`
    );
    expect(response.status).toEqual(404);
  });

  it('should 405 when method not allowed', async () => {
    const response = await request(testHttpServer.app).get(
      `${baseUrl}/throwSyncCustomError`
    );
    expect(response.status).toEqual(405);
  });
});
