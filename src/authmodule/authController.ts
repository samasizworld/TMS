import { BadRequestException, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "./authService";
import { Request, Response } from "express";
import { UserService } from "src/usermodule/userService";
import { MFA } from "./2faService";
import { SSOService } from "./ssoService";

@Controller('/generateToken')
export class AuthController {
    constructor(private authService: AuthService, private userService: UserService, private mfaService: MFA, private ssoService: SSOService) { }
    @Post()
    async generateToken(@Req() req: Request, @Res() res: Response) {
        let { Username, OTPCode } = req.body;
        // if (!Username && !OTPCode && AuthToken) {
        //     const email = await this.ssoService.checkSSOAuthKey(AuthToken)
        //     if (!email) {
        //         throw new BadRequestException('SSO verification failed');
        //     }

        //     Username = email

        // }
        const user = await this.userService.getUserByEmail(Username);
        if (!user) {
            throw new BadRequestException('User not available');
        }

        const data = { UserId: user.guid };
        const token = this.authService.generateToken(data);
        if (Username && !OTPCode) {
            return res.status(200).send({ AuthenticationKey: token, IsAdmin: user.issystemadmin, sso: true });

        } else {
            if (OTPCode && this.mfaService.verifyOTP(OTPCode, 'WMLEINI3PO6C3CTINM7PNLRR2CN4CZ2F')) {
                return res.status(200).send({ AuthenticationKey: token, IsAdmin: user.issystemadmin, sso: false });
            } else {
                throw new BadRequestException('Invalid OTPcode');

            }
        }

    }
}