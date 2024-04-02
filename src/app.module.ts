import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UserModule } from './usermodule/users.module';
import { TaskModule } from './taskmodule/tasks.module';
import { UserTaskModule } from './usertaskmodule/usertasks.module';
import { AuthModule } from './authmodule/auth.module';
import { JWT_KEY } from './authmodule/symmetricKey';
import { AdminMiddleware, AuthenticationMiddleware } from './authmodule/auth.middleware';
import { DatabaseModule } from './config/databaseConnection.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { FileLogger } from './loggerInterceptor';
import { ErrorLoggingFilter } from './errorLogger';
import { PingModule } from './pingmodule/ping.module';

@Module({
  imports: [UserModule, TaskModule, UserTaskModule, AuthModule.forRoot(JWT_KEY), DatabaseModule, PingModule],
  providers: [
    // { provide: APP_INTERCEPTOR, useClass: FileLogger },
    { provide: APP_FILTER, useClass: ErrorLoggingFilter }
  ]
})
export class AppModule implements NestModule {
  // normal user only see the task list and retrive the details
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes('users', 'tasks', 'usertasks')
      .apply(AdminMiddleware).exclude({ path: '/tasks', method: RequestMethod.GET }, { path: '/tasks/:taskid', method: RequestMethod.GET }, { path: '/users', method: RequestMethod.GET }).forRoutes('users', 'tasks')
  }
}
