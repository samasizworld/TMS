import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Request, Response } from "express";
import { Observable, tap } from "rxjs";
import {createWriteStream, existsSync, mkdirSync} from 'fs';

@Injectable()
export class FileLogger implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();
        const startDate = new Date();
        return next.handle().pipe(
            tap(() => {
                const date = new Date();
                const diff = date as any - (startDate as any);
                // Get the components of the date
                const year = date.getFullYear(); // Get the year (e.g., 2024)
                const month = date.getMonth() + 1; // Get the month (0-11, add 1 for 1-12)
                const day = date.getDate(); // Get the day of the month (1-31)
                const hours = date.getHours(); // Get the hours (0-23)
                const minutes = date.getMinutes(); // Get the minutes (0-59)
                const seconds = date.getSeconds(); // Get the seconds (0-59)

                // Format the date components as desired
                const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

                const logFilePath = `/usr/endlessdomain/${year}${month}${day}_logs.log`;

                const logText = `Time: ${formattedDate} Method: ${request.method} Path: ${request.path} StatusCode: ${response.statusCode} ProcessingTime: ${diff}ms\n\n`;

                //create log dir
                if (!existsSync('/usr/endlessdomain/')) {
                    mkdirSync('/usr/endlessdomain/', { recursive: true });
                }


                const infoStream = createWriteStream(logFilePath, { flags: "a" });
                infoStream.write(logText);
                infoStream.end();
                console.log(logText);
            })
        )
    }
}
