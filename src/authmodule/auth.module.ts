import { DynamicModule, Module } from "@nestjs/common";
import { AuthService } from "./authService";
import { MFA } from "./2faService";
import { UserModule } from "src/usermodule/users.module";
import { AuthController } from "./authController";
import { SSOService } from "./ssoService";

@Module({
    imports: [UserModule],
    providers: [AuthService, MFA, SSOService, Number],
    controllers: [AuthController],
    exports: [AuthService, MFA] // exporting auth service to use in another modules
})
export class RootAuthModule { }

@Module({})
export class AuthModule {
    static async forRoot(key: string): Promise<DynamicModule> {
        return {
            module: RootAuthModule,
            providers: [AuthService, MFA, SSOService,
                {
                    provide: 'JWT_KEY',
                    useValue: key
                }],
        }
    }
}