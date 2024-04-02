import { Controller, Delete, Get, Patch, Post, Put, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { TaskService } from "./taskService";
import { UserTaskService } from "src/usertaskmodule/userTaskService";
import { TaskInterfaceDB } from "./taskInterfaces";

@Controller('/tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService, private readonly taskUserService: UserTaskService) { }

    @Get()
    async getTasks(@Req() req: Request, @Res() res: Response) {
        const page = req.query.page ? req.query.page : 1;
        const pageSize: any = req.query.pageSize ? req.query.pageSize : 20;
        const offset = +pageSize * (+page - 1);
        const search: any = req.query.search ? req.query.search : "";
        const orderBy: any = req.query.orderBy ? req.query.orderBy : "title";
        const orderDir: any = req.query.orderDir ? req.query.orderDir : "ASC";
        const isAdmin = req['IsSystemAdmin'];
        const loggedInUser = req['UserId'];
        const userIds: any = req.query.userIds ? req.query.userIds : "";
        const taskStatus: any = req.query.taskStatus ? req.query.taskStatus : "";

        const tasks: any[] = await this.taskService.getTasks(search, pageSize, offset, orderBy, orderDir, isAdmin, loggedInUser, userIds, taskStatus);
        const resTasks: object[] = tasks.map((task) => {
            return {
                TaskId: task.taskid,
                Title: task.title,
                Description: task.description,
                CreationDate: task.datecreated,
                ModifiedDate: task.datemodified,
                TaskStatus: task.tstatus
            }
        });
        res.header('x-count', tasks[0]?.total || 0)
        return res.status(200).send(resTasks);
    }
    @Get(':taskid')
    async getTask(@Req() req: Request, @Res() res: Response) {
        const taskId = req.params.taskid;
        const isAdmin = req['IsSystemAdmin'];
        const loggedInUser = req['UserId'];
        const [retTask]: any = await this.taskService.getTaskWithUsers(taskId, loggedInUser, isAdmin);
        const task: TaskInterfaceDB = retTask
        let resTask: any;
        if (!isAdmin) {
            resTask = {
                TaskId: task.taskguid,
                Title: task.title,
                Description: task.description,
                CreationDate: task.datecreated,
                ModifiedDate: task.datemodified,
                AssignedUsers: task.assignedusers ? task.assignedusers.filter(au => au.userguid == loggedInUser).map(u => { return { UserId: u.userguid, TaskStatus: u.status, Emailaddress: u.emailaddress, UserTaskId: u.usertaskguid } }) : []
            }
        } else {
            resTask = {
                TaskId: task.taskguid,
                Title: task.title,
                Description: task.description,
                CreationDate: task.datecreated,
                ModifiedDate: task.datemodified,
                AssignedUsers: task.assignedusers ? task.assignedusers.map(u => { return { UserId: u.userguid, TaskStatus: u.status, Emailaddress: u.emailaddress, UserTaskId: u.usertaskguid } }) : []
            }
        }

        return res.status(200).send(resTask);
    }

    @Post()
    async addTask(@Req() req: Request, @Res() res: Response) {
        const { Title, Description, AssignedUsers } = req.body;
        const task = await this.taskService.createTask(Title, Description);
        await this.taskUserService.upsertUserTasks(task.taskid, AssignedUsers);
        return res.status(201).send(task);
    }
    @Put(':taskid')
    async updateTask(@Req() req: Request, @Res() res: Response) {

        const { Title, Description, AssignedUsers } = req.body;

        const taskId = req.params.taskid;
        const task = await this.taskService.updateTask(Title, Description, taskId);
        await this.taskUserService.upsertUserTasks(task.taskid, AssignedUsers);

        return res.status(204).send();
    }

    @Delete(':taskid')
    async deleteTask(@Req() req: Request, @Res() res: Response) {
        const taskId = req.params.taskid;
        const task = await this.taskService.deleteTask(taskId);
        await this.taskUserService.deleteUserTasks(task.taskid);
        return res.status(204).send();
    }

    @Patch('/usertasks/:usertaskid')
    async patchStatus(@Req() req: Request, @Res() res: Response) {
        const userTaskId = req.params.usertaskid;
        const task: any = await this.taskUserService.updateUserTaskRows(req.body.TaskStatus, userTaskId);
        await this.taskService.updateTaskDescription(task.taskid, req.body.Description)
        return res.status(204).send();
    }
}