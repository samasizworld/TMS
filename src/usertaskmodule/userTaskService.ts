import { Injectable } from "@nestjs/common";
import { UserTasks } from "./userTaskModels";
import { InjectModel } from "@nestjs/sequelize";
import { UserService } from "src/usermodule/userService";

@Injectable()
export class UserTaskService {
    // dynamic module where we inject UserTasks model
    constructor(@InjectModel(UserTasks) private readonly userTaskContext: typeof UserTasks, private readonly userService: UserService) { }

    async upsertUserTasks(taskId: number, assignedUsers: { UserId: string, TaskStatus: string }[]) {
        await this.userTaskContext.update({ datedeleted: new Date() }, { where: { datedeleted: null, taskid: taskId } });

        for (const user of assignedUsers) {
            const retUser = await this.userService.getUser(user.UserId);
            await this.userTaskContext.create({ userid: retUser.userid, taskid: taskId, status: user.TaskStatus });

        }
    }

    async deleteUserTasks(taskId: number) {
        await this.userTaskContext.update({ datedeleted: new Date() }, { where: { datedeleted: null, taskid: taskId } });

    }
}