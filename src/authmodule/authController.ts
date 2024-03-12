import { BadRequestException, Controller, Get, Req, Res } from "@nestjs/common";
import { AuthService } from "./authService";
import { Request, Response } from "express";
import { UserService } from "src/usermodule/userService";

@Controller('/generateToken')
export class AuthController {
    constructor(private authService: AuthService, private userService: UserService) { }
    @Get()
    async generateToken(@Req() req: Request, @Res() res: Response) {
        const { Username } = req.body;
        const user = await this.userService.getUserByEmail(Username);
        if (!user) {
            throw new BadRequestException('User not available');
        }
        const data = { UserId: user.guid };
        const token = this.authService.generateToken(data);
        return res.status(200).send({ AuthenticationKey: token });
    }
}