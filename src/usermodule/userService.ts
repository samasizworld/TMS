import { InjectModel } from "@nestjs/sequelize";
import { User } from "./userModels";
import { Injectable, Query } from "@nestjs/common";
import { Op, QueryTypes } from "sequelize";

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
    async getUserByEmail(emailAddress: string) {
        return await this.userContext.findOne({ where: { datedeleted: null, emailaddress: { [Op.iLike]: emailAddress } } });
    }

    async createUser(firstname: string, middlename: string, lastname: string, emailaddress: string): Promise<User> {
        const userData = { firstname, middlename, lastname, emailaddress }
        return await this.userContext.create(userData);
    }

    async updateUser(firstname: string, middlename: string, lastname: string, emailaddress: string, userId: string,): Promise<User> {
        const whereClause = { datedeleted: null, guid: userId }
        const userData = { firstname, middlename, lastname, emailaddress }
        const [rows, [user]] = await this.userContext.update(userData, { where: whereClause, returning: true });
        return user;
    }

    async deleteUser(userId: string): Promise<User> {
        const whereClause = { datedeleted: null, guid: userId };
        console.log(new Date());
        const [rows, [user]]: any = await this.userContext.update({ datedeleted: new Date() }, { where: whereClause, returning: true });
        return user;
    }
}