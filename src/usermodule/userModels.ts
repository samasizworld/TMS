import { Table, Column, Model, PrimaryKey, DataType } from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: false })
export class User extends Model<User> {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  userid: number;

  @Column({ type: DataType.UUIDV4 })
  guid: string;

  @Column
  firstname: string;

  @Column
  lastname: string;

  @Column
  middlename: string;

  @Column
  emailaddress: string;

  @Column
  datecreated: string;

  @Column
  datemodified: string;

  @Column
  datedeleted: Date;

  @Column({ type: DataType.BOOLEAN })
  issystemadmin: boolean

  @Column({ type: DataType.BOOLEAN })
  enable2fa: boolean

  @Column({ type: DataType.BOOLEAN })
  enablesso: boolean

  @Column({ type: DataType.TEXT })
  secretkey2fa: string
}