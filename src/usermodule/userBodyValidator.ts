import { IsNotEmpty, IsString, IsEmail, IsEmpty } from "class-validator";

export class userDTO {
    @IsString({ message: "Firstname should be string" })
    @IsNotEmpty({ message: "Firstname should not be empty" })
    Firstname: string;

    @IsString({ message: "Lastname should be string" })
    @IsNotEmpty({ message: "Lastname should not be empty" })
    Lastname: string;

    Middlename: string;

    @IsEmail()
    Emailaddress: string;

    SSO: boolean;
    MFA: boolean;
}


export class userModel {

    @IsString()
    @IsNotEmpty()
    firstname: string;

    @IsString()
    @IsNotEmpty()
    lastname: string;

    @IsString()
    @IsEmpty()
    middlename: string;

    @IsEmail()
    emailaddress: string;

    enablesso: boolean;
    enable2fa: boolean;
}

