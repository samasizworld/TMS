import { InjectModel } from "@nestjs/sequelize";
import { User } from "./userModels";
import { Injectable } from "@nestjs/common";
import { Op, QueryTypes } from "sequelize";
import { userModel } from "./userBodyValidator";

@Injectable()
export class UserService {
    constructor(@InjectModel(User) private readonly userContext: typeof User) {
    }

    async getUsers(searchText: string, pageSize: number, pageOffset: number, orderBy: string, orderDir: string) {
        const sql: string = `SELECT * FROM public.get_userlist(
            :searchText,--<searchtext character varying>, 
            :pageSize,--<pagesize integer>, 
            :pageOffset,--<pageoffset integer>, 
            :orderBy,--<orderby character varying>, 
            :orderDir --<orderdir character varying>
        )`;

        return this.userContext.sequelize.query(sql, {
            replacements: { searchText, pageSize, pageOffset, orderDir, orderBy },
            type: QueryTypes.SELECT
        });
    }

    async getUser(userId: string) {
        return await this.userContext.findOne({ where: { datedeleted: null, guid: userId } });
    }
    async getUserByEmail(emailAddress: string, userId: string = '') {
        if (!userId) {
            return await this.userContext.findOne({ where: { datedeleted: null, emailaddress: { [Op.iLike]: emailAddress } } });

        } else {
            return await this.userContext.findOne({ where: { datedeleted: null, emailaddress: { [Op.iLike]: emailAddress }, guid: { [Op.ne]: userId } } });
        }
    }

    async createUser(userDto: userModel): Promise<User> {
        const { firstname, lastname, middlename, emailaddress } = userDto;
        return await this.userContext.create({ firstname, lastname, middlename, emailaddress });
    }

    async updateUser(userDto: userModel, userId: string): Promise<User> {
        const whereClause = { datedeleted: null, guid: userId }
        const { firstname, lastname, middlename, emailaddress } = userDto;
        const [rows, [user]] = await this.userContext.update({ firstname, lastname, middlename, emailaddress }, { where: whereClause, returning: true });
        return user;
    }

    async deleteUser(userId: string): Promise<User> {
        const whereClause = { datedeleted: null, guid: userId };
        console.log(new Date());
        const [rows, [user]]: any = await this.userContext.update({ datedeleted: new Date() }, { where: whereClause, returning: true });
        return user;
    }
}