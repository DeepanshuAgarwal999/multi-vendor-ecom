import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { GqlArgumentsHost, GqlContextType } from '@nestjs/graphql';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const contextType = host.getType<GqlContextType>();

    // Handle GraphQL context
    if (contextType === 'graphql') {
      this.handleGraphQLException(exception, host);
    } else {
      // Handle HTTP context
      this.handleHttpException(exception, host);
    }
  }

  private handleGraphQLException(exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const info = gqlHost.getInfo();
    const context = gqlHost.getContext();

    const status = exception.getStatus();
    const message = exception.message;

    // Log the error for debugging
    this.logger.error(`GraphQL Error: ${message}`, {
      statusCode: status,
      timestamp: new Date().toISOString(),
      fieldName: info?.fieldName,
      path: info?.path,
      operation: info?.operation?.operation,
      // stack: exception.stack,
    });

    // For GraphQL, we just re-throw the exception
    // GraphQL will handle the formatting automatically
    throw exception;
  }
  private handleHttpException(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Ignore common browser requests that shouldn't be logged as errors
    const ignoredPaths = ['/favicon.ico', '/robots.txt', '/apple-touch-icon.png', '/manifest.json'];
    const shouldIgnoreLogging = status === 404 && ignoredPaths.includes(request.url);

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
      ...(process.env.NODE_ENV === 'development' && { stack: exception.stack }),
    };

    // Only log if it's not an ignored path
    if (!shouldIgnoreLogging) {
      this.logger.error(`HTTP Error: ${exception.message}`, {
        ...errorResponse,
        method: request.method,
        body: request.body,
        params: request.params,
        query: request.query,
      });
    }

    response.status(status).json(errorResponse);
  }
}
