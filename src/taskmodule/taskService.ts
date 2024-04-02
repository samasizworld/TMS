import { InjectModel } from "@nestjs/sequelize";
import { Task } from "./taskModels";
import { Injectable } from "@nestjs/common";
import { QueryTypes } from "sequelize";

@Injectable()
export class TaskService {
    constructor(@InjectModel(Task) private readonly taskContext: typeof Task) {
    }

    async createTask(title: string, description: string): Promise<Task> {

        return await this.taskContext.create({ title, description });
    }
    async getTasks(searchText: string, pageSize: number, pageOffset: number, orderBy: string, orderDir: string, isAdmin: boolean, loggedInUser: string, userIds: string, taskStatus: string) {
        const sql: string = `SELECT * FROM public.get_tasklist(
            :searchText,--<searchtext character varying>, 
            :pageSize,--<pagesize integer>, 
            :pageOffset,--<pageoffset integer>, 
            :orderBy,--<orderby character varying>, 
            :orderDir, --<orderdir character varying>
            :isAdmin,
            :loggedInUser,
            :userIds,
            :taskStatus
        )`;

        return this.taskContext.sequelize.query(sql, {
            replacements: { searchText, pageSize, pageOffset, orderDir, orderBy, isAdmin, userIds, taskStatus, loggedInUser },
            type: QueryTypes.SELECT
        });
    }

    async getTask(taskId: string) {
        return await this.taskContext.findOne({ where: { datedeleted: null, guid: taskId } });
    }

    async updateTask(title: string, description: string, taskId: string,): Promise<Task> {
        const whereClause = { datedeleted: null, guid: taskId };
        const taskData = { title, description };
        const [rows, [user]] = await this.taskContext.update(taskData, { where: whereClause, returning: true });
        return user;
    }

    async deleteTask(taskId: string): Promise<Task> {
        const whereClause = { datedeleted: null, guid: taskId };
        const [rows, [user]]: any = await this.taskContext.update({ datedeleted: new Date() }, { where: whereClause, returning: true });
        return user;
    }

    // async getTaskWithUsersSequelize(taskId: string) {
    //     return this.taskContext.findOne({
    //         where: { datedeleted: null, guid: taskId },
    //         include: [
    //             {
    //                 model: User,
    //                 required: true,
    //                 where: { datedeleted: null },
    //                 include: [{
    //                     model: UserTasks,
    //                     required: true,
    //                     where: { datedeleted: null }
    //                 }]
    //             }
    //         ]
    //     });
    // }

    async getTaskWithUsers(taskId: string, loggedInUser: string, isAdmin: boolean) {
        const sql: string = `SELECT * FROM public.get_task(
            :taskId, 
            :isAdmin, 
            :loggedInUser
        )`;

        return this.taskContext.sequelize.query(sql, {
            replacements: { taskId, isAdmin, loggedInUser },
            type: QueryTypes.SELECT
        });
    }

    async updateTaskDescription(taskid: number, description: any): Promise<Task> {
        const whereClause = { datedeleted: null, taskid: taskid };
        const taskData = {description};
        const [rows, [user]] = await this.taskContext.update(taskData, { where: whereClause, returning: true });
        return user;
    }
}