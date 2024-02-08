import cookieParser from 'cookie-parser';
import express from 'express';
import { middleware as OpenApiValidatorMiddleware } from 'express-openapi-validator';
import { Express } from 'express-serve-static-core';
import http from 'http';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { Tspec, TspecDocsMiddleware } from 'tspec';
import { Logger } from 'winston';

import apiSpecification from '@root/generate/openapi.json';
import { name, version } from '@root/package.json';

import { JwtHandler } from '@src/core/ports/jwt.handler';
import { AuthService } from '@src/core/services/auth/auth.service';
import { CommentService } from '@src/core/services/comment/comment.service';
import { ReviewService } from '@src/core/services/review/review.service';
import { UserService } from '@src/core/services/user/user.service';

import { AuthV1Controller } from '@controller/http/auth/auth.v1.controller';
import { CommentV1Controller } from '@controller/http/comment/comment.v1.controller';
import { DevV1Controller } from '@controller/http/dev/dev.v1.controller';
import { HealthController } from '@controller/http/health/health.controller';
import { Middleware } from '@controller/http/middleware';
import { ReviewV1Controller } from '@controller/http/review/review.v1.controller';
import { HttpConfig } from '@controller/http/types';
import { idTokenCookieName } from '@controller/http/types';
import { UserV1Controller } from '@controller/http/user/user.v1.controller';

export class HttpServer {
  private middleware: Middleware;
  private server!: http.Server;
  private app!: Express;

  constructor(
    private readonly logger: Logger,
    private readonly config: HttpConfig,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly commentService: CommentService,
    private readonly reviewService: ReviewService,
    private readonly jwtHandler: JwtHandler
  ) {
    this.middleware = new Middleware(this.logger, this.jwtHandler);
  }

  public start = async (): Promise<void> => {
    this.app = express();
    this.app.disable('x-powered-by');
    this.app.set('trust proxy', 0);
    this.app.use(express.json());
    await this.buildApiDocument();
    this.app.use('/api', cookieParser());
    this.app.use('/api', this.middleware.accessLog);
    this.app.use(
      OpenApiValidatorMiddleware({
        apiSpec: path.join(__dirname, '../../../generate/openapi.json'),
        validateRequests: true,
        validateResponses: true,
        validateSecurity: false
      })
    );
    this.app.use('/api', this.getApiRouters());
    this.app.use('/healthz', this.getHealthRouters());
    this.app.use(this.middleware.handleError);
    this.app.use(this.middleware.handleNotFoundRoute);

    this.server = this.app.listen(this.config.port, () => {
      this.logger.info(`HTTP server started on ${this.config.port}`);
    });
  };

  public isListeninig = (): boolean => {
    return this.server.listening;
  };

  public close = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          this.logger.info('HTTP server closed');
          resolve();
        }
      });
    });
  };

  private getApiRouters = (): express.Router[] => {
    const routers = [
      new DevV1Controller(this.middleware).routes(),
      new AuthV1Controller(
        this.middleware,
        this.authService,
        this.config.cookieExpirationHours
      ).routes(),
      new UserV1Controller(this.middleware, this.userService).routes(),
      new CommentV1Controller(this.middleware, this.commentService).routes(),
      new ReviewV1Controller(this.middleware, this.reviewService).routes()
    ];
    return routers;
  };

  private getHealthRouters = (): express.Router[] => {
    const routers = [new HealthController().routes()];
    return routers;
  };

  private buildApiDocument = async (): Promise<void> => {
    if (this.config.env !== 'prod') {
      const apiDocumentOptions: Tspec.GenerateParams = {
        specPathGlobs: ['src/**/*.ts'],
        tsconfigPath: './tsconfig.json',
        outputPath: './generate/openapi.json',
        specVersion: 3,
        openapi: {
          title: name,
          version: version,
          securityDefinitions: {
            jwt: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            },
            cookieAuth: {
              type: 'apiKey',
              in: 'cookie',
              name: idTokenCookieName
            }
          }
        },
        debug: false,
        ignoreErrors: false
      };
      this.app.use('/docs', await TspecDocsMiddleware(apiDocumentOptions));
    } else {
      this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSpecification));
    }
  };
}
