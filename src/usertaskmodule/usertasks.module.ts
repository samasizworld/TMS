import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UserTasks } from "./userTaskModels";
import { UserTaskService } from "./userTaskService";
import { UserModule } from "src/usermodule/users.module";
import { UserTaskController } from "./userTasksController";

@Module({
    imports: [UserModule, SequelizeModule.forFeature([UserTasks])],
    providers: [UserTaskService],
    controllers: [UserTaskController],
    exports: [UserTaskService]
})
export class UserTaskModule {

}