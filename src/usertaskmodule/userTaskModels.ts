import { Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({ tableName: "usertasks", timestamps: false })
export class UserTasks extends Model {

    @PrimaryKey
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true
    })
    usertaskid: number;

    @Column({ type: DataType.UUIDV4 })
    guid: string;

    @Column
    userid: string;

    @Column
    taskid: string;

    @Column({
        type:DataType.ENUM('todo', 'inprogress','done'),
        
    })
    status: string[];

    @Column
    datecreated: string;

    @Column
    datemodified: string;

    @Column
    datedeleted: Date;
}