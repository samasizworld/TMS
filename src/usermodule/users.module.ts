import { Module } from "@nestjs/common";
import { UserController } from "./userController";
import { UserService } from "./userService";
import { User } from "./userModels";
import { SequelizeModule } from "@nestjs/sequelize";
import { UserMapper } from "./userMapper";

@Module({
    imports: [SequelizeModule.forFeature([User])],
    controllers: [UserController],
    providers: [UserService, UserMapper],
    exports: [UserService]
})
export class UserModule { }