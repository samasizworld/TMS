import { Injectable } from "@nestjs/common";
import { User } from "./userModels";
import { userDTO } from "./userBodyValidator";

@Injectable()
export class UserMapper {
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

    userDetailMapper(user: User) {
        return {
            UserId: user.guid,
            Firstname: user.firstname,
            Middlename: user.middlename,
            Lastname: user.lastname,
            EmailAddress: user.emailaddress,
            CreationDate: user.datecreated,
            ModifiedDate: user.datemodified,
            SSO: user.enablesso,
            MFA: user.enable2fa
        }
    }

    userPayloadMapper(user: userDTO) {
        return {
            firstname: user.Firstname,
            middlename: user.Middlename,
            lastname: user.Lastname,
            emailaddress: user.Emailaddress,
            enablesso: user.SSO,
            enable2fa: user.MFA
        }
    }
}