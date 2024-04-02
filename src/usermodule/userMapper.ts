import { Injectable } from "@nestjs/common";
import { User } from "./userModels";
import { userDTO } from "./userBodyValidator";
import { MFA } from "src/authmodule/2faService";

@Injectable()
export class UserMapper {
    constructor(private readonly mfaService: MFA) {

    }
    userListMapper(models: User[]) {
        return models.map(user => {
            return {
                UserId: user.userid,
                Firstname: user.firstname,
                Middlename: user.middlename,
                Lastname: user.lastname,
                EmailAddress: user.emailaddress,
                CreationDate: user.datecreated,
                ModifiedDate: user.datemodified
            }
        })
    }

    async userDetailMapper(user: User) {
        return {
            UserId: user.guid,
            Firstname: user.firstname,
            Middlename: user.middlename,
            Lastname: user.lastname,
            EmailAddress: user.emailaddress,
            CreationDate: user.datecreated,
            ModifiedDate: user.datemodified,
            SSO: user.enablesso,
            MFA: user.enable2fa,
            Qr: await this.mfaService.generateQRCodeDataForMFA(user.secretkey2fa, user.emailaddress)
        }
    }

    userPayloadMapper(user: userDTO, method: any) {
        if (method == 'POST') {
            return {
                firstname: user.Firstname,
                middlename: user.Middlename,
                lastname: user.Lastname,
                emailaddress: user.Emailaddress,
                enablesso: user.SSO,
                enable2fa: user.MFA,
                secretkey2fa: this.mfaService.generateSecret()
            }
        } else {
            return {
                firstname: user.Firstname,
                middlename: user.Middlename,
                lastname: user.Lastname,
                emailaddress: user.Emailaddress,
                enablesso: user.SSO,
                enable2fa: user.MFA,
                secretkey2fa: undefined
            }
        }

    }
}