import { Controller, Delete, Get, Post, Put, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { UserService } from "./userService";

@Controller("/users")
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    async getUsers(@Req() req: Request, @Res() res: Response) {
        const page = req.query.page ? req.query.page : 1;
        const pageSize: any = req.query.pageSize ? req.query.pageSize : 20;
        const offset = +pageSize * (+page - 1);
        const search: any = req.query.search ? req.query.search : "";
        const orderBy: any = req.query.orderBy ? req.query.orderBy : "name";
        const orderDir: any = req.query.orderDir ? req.query.orderDir : "ASC";
        const users: any[] = await this.userService.getUsers(search, pageSize, offset, orderBy, orderDir);
        const resUsers: object[] = users.map((user) => {
            return {
                UserId: user.userid,
                Firstname: user.firstname,
                Middlename: user.middlename,
                Lastname: user.lastname,
                EmailAddress: user.emailaddress,
                CreationDate: user.datecreated,
                ModifiedDate: user.datemodified
            }
        });
        res.header('X-PageCount', users[0]?.total || 0)
        return res.status(200).send(resUsers);
    }
    @Get(':userid')
    async getUser(@Req() req: Request, @Res() res: Response) {
        const userId = req.params.userid;
        const user = await this.userService.getUser(userId);
        const resUser: object = {
            UserId: user.guid,
            Firstname: user.firstname,
            Middlename: user.middlename,
            Lastname: user.lastname,
            EmailAddress: user.emailaddress,
            CreationDate: user.datecreated,
            ModifiedDate: user.datemodified

        }
        return res.status(200).send(resUser);
    }
    @Post()
    async addUser(@Req() req: Request, @Res() res: Response) {
        const { Firstname, Middlename, Lastname, Emailaddress } = req.body;
        const user = await this.userService.createUser(Firstname, Middlename, Lastname, Emailaddress);
        return res.status(201).send(user);
    }

    @Put(':userid')
    async updateUser(@Req() req: Request, @Res() res: Response) {
        const { Firstname, Middlename, Lastname, Emailaddress } = req.body;
        const userId = req.params.userid;
        await this.userService.updateUser(Firstname, Middlename, Lastname, Emailaddress, userId);
        return res.status(204).send();
    }

    @Delete(':userid')
    async deleteUser(@Req() req: Request, @Res() res: Response) {
        const userId = req.params.userid;
        await this.userService.deleteUser(userId);
        return res.status(204).send();
    }
}
