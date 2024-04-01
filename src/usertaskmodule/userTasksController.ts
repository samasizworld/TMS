import { Controller, Patch, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { UserTaskService } from "./userTaskService";

@Controller('usertasks')
export class UserTaskController {
    constructor(private readonly userTaskService: UserTaskService) {

    }
    @Patch(':usertaskid')
    async patchStatus(@Req() req: Request, @Res() res: Response) {
        const userTaskId = req.params.usertaskid;
        const task = await this.userTaskService.updateUserTaskRows(req.body.TaskStatus, userTaskId);
        return res.status(204).send();
    }
}