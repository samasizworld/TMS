import { Body, ConflictException, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req, Res, ValidationPipe } from "@nestjs/common";
import { Request, Response } from "express";
import { UserService } from "./userService";
import { UserMapper } from "./userMapper";
import { userDTO } from "./userBodyValidator";

@Controller("/users")
export class UserController {
    constructor(private readonly userService: UserService, private userMapper: UserMapper) { }

    @Get()
    async getUsers(@Req() req: Request, @Res() res: Response) {
        const page = req.query.page ? req.query.page : 1;
        const pageSize: any = req.query.pageSize ? req.query.pageSize : 20;
        const offset = +pageSize * (+page - 1);
        const search: any = req.query.search ? req.query.search : "";
        const orderBy: any = req.query.orderBy ? req.query.orderBy : "name";
        const orderDir: any = req.query.orderDir ? req.query.orderDir : "ASC";
        const users: any[] = await this.userService.getUsers(search, pageSize, offset, orderBy, orderDir);
        const dtos = this.userMapper.userListMapper(users)
        res.header('x-count', users[0]?.total || 0)
        return res.status(200).send(dtos);
    }
    @Get(':userid')
    async getUser(@Res() res: Response, @Param('userid', new ParseUUIDPipe({ version: "4" })) userId: string) {
        const user = await this.userService.getUser(userId);
        const resUser = this.userMapper.userDetailMapper(user);
        return res.status(200).send(resUser);
    }
    @Post()
    async addUser(@Res() res: Response, @Body(ValidationPipe) userDto: userDTO) {
        const userBody = this.userMapper.userPayloadMapper(userDto);
        const retUser = await this.userService.getUserByEmail(userBody.emailaddress);
        if (retUser?.emailaddress) {
            throw new ConflictException('Duplicate users');
        }
        const user = await this.userService.createUser(userBody);
        return res.status(201).send({ UserId: user.guid });
    }

    @Put(':userid')
    async updateUser(@Res() res: Response, @Body(ValidationPipe) userDto: userDTO, @Param('userid', new ParseUUIDPipe({ version: "4" })) userId: string) {
        const userBody = this.userMapper.userPayloadMapper(userDto);
        const retUser = await this.userService.getUserByEmail(userBody.emailaddress, userId);

        if (retUser?.emailaddress) {
            throw new ConflictException('Duplicate users');
        }
        await this.userService.updateUser(userBody, userId);
        return res.status(204).send();
    }

    @Delete(':userid')
    async deleteUser(@Res() res: Response, @Param('userid', new ParseUUIDPipe({ version: "4" })) userId: string) {
        await this.userService.deleteUser(userId);
        return res.status(204).send();
    }
}
