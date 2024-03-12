import { ForbiddenException, Injectable, NestMiddleware, NotFoundException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { AuthService } from "./authService";
import { UserService } from "src/usermodule/userService";

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) { }
  async use(req: Request, res: Response, next: NextFunction) {

    const token = req.headers.authorization?.split(' ')[1];
    let decodedToken: { UserId: string, iat: number, eat: number };
    if (token) {
      // authentication part
      decodedToken = this.authService.verifyToken(token);
      if (decodedToken) {
        req['UserId'] = decodedToken.UserId
      } else {
        throw new ForbiddenException('Token expires. Please try again');
      }
    } else {
      throw new ForbiddenException('Token is not provided');
    }
    const user = await this.userService.getUser(decodedToken.UserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    req['IsSystemAdmin'] = user?.issystemadmin ? user?.issystemadmin : false;
    next();
  }
}


@Injectable()
export class AdminMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    if (req['IsSystemAdmin'] == true) {
      next();
    } else {
      throw new ForbiddenException(`The route is not authorized for normal user`);
    }
  }
}

