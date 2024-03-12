import { Module } from "@nestjs/common";
import { UserController } from "./userController";
import { UserService } from "./userService";
import { User } from "./userModels";
import { SequelizeModule } from "@nestjs/sequelize";

@Module({
    imports: [SequelizeModule.forFeature([User])],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule { }