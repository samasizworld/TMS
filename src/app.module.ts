import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UserModule } from './usermodule/users.module';
import { TaskModule } from './taskmodule/tasks.module';
import { UserTaskModule } from './usertaskmodule/usertasks.module';
import { AuthModule } from './authmodule/auth.module';
import { JWT_KEY } from './authmodule/symmetricKey';
import { AdminMiddleware, AuthenticationMiddleware } from './authmodule/auth.middleware';
import { DatabaseModule } from './config/databaseConnection.module';

@Module({
  imports: [UserModule, TaskModule, UserTaskModule, AuthModule.forRoot(JWT_KEY), DatabaseModule],
})
export class AppModule implements NestModule {
  // normal user only see the task list and retrive the details
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes('users', 'tasks')
      .apply(AdminMiddleware).exclude({ path: '/tasks', method: RequestMethod.GET }, { path: '/tasks/:taskid', method: RequestMethod.GET }).forRoutes('users', 'tasks')
  }
}
