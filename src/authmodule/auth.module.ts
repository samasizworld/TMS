import { DynamicModule, Module } from "@nestjs/common";
import { AuthService } from "./authService";
import { UserModule } from "src/usermodule/users.module";
import { AuthController } from "./authController";

@Module({
    imports: [UserModule],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService] // exporting auth service to use in another modules
})
export class RootAuthModule { }

@Module({})
export class AuthModule {
    static async forRoot(key: string): Promise<DynamicModule> {
        return {
            module: RootAuthModule,
            providers: [AuthService,
                {
                    provide: 'JWT_KEY',
                    useValue: key
                }],
        }
    }
}