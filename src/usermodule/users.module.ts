import { Module } from "@nestjs/common";
import { UserController } from "./userController";
import { UserService } from "./userService";
import { User } from "./userModels";
import { SequelizeModule } from "@nestjs/sequelize";
import { UserMapper } from "./userMapper";
import { MFA } from "src/authmodule/2faService";

@Module({
    imports: [SequelizeModule.forFeature([User])],
    controllers: [UserController],
    providers: [UserService, UserMapper,MFA],
    exports: [UserService]
})
export class UserModule { }