import { Module } from "@nestjs/common";
import { TaskController } from "./taskController";
import { SequelizeModule } from "@nestjs/sequelize";
import { Task } from "./taskModels";
import { TaskService } from "./taskService";
import { UserTaskModule } from "src/usertaskmodule/usertasks.module";

@Module({
    imports: [UserTaskModule, SequelizeModule.forFeature([Task])],
    controllers: [TaskController],
    providers: [TaskService]
})
export class TaskModule { }