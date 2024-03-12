
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { sequelizeConfig } from './sequelizeConfig';
import { User } from 'src/usermodule/userModels';
import { Task } from 'src/taskmodule/taskModels';
import { UserTasks } from 'src/usertaskmodule/userTaskModels';
@Module({
    imports: [SequelizeModule.forRoot({ ...sequelizeConfig, models: [User, Task, UserTasks] })],
})
export class DatabaseModule { }
