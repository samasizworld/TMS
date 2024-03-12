import { Table, Column, Model, PrimaryKey, DataType } from 'sequelize-typescript';


@Table(
  {
    timestamps: false,
    tableName: 'tasks'
  }
)
export class Task extends Model {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  taskid: number;

  @Column({
    type: DataType.UUIDV4
  })
  guid: string;

  @Column
  title: string;

  @Column
  description: string;

  @Column
  datecreated: string;

  @Column
  datemodified: string;

  @Column
  datedeleted: Date;

  // @BelongsToMany(() => User, () => UserTasks, 'taskid', 'userid')
  // usertasks: any[]
}