export interface TaskInterfaceDB {
    taskguid: string;
    title: string;
    description: string;
    datecreated: Date;
    datemodified: Date;
    assignedusers: any[];
}