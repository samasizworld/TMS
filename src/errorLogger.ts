// error-logging.filter.ts
import { Catch, ExceptionFilter, ArgumentsHost, Logger } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

@Catch()
export class ErrorLoggingFilter implements ExceptionFilter {
    private readonly logger = new Logger(ErrorLoggingFilter.name);
    private readonly errorLogPath: string = '/usr/endlessdomain/';
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const status = exception.getStatus ? exception.getStatus() : 500;
        const message = exception.message || 'Internal server error';

        // Log the error
        this.logger.error(`[${request.method}] ${request.originalUrl}`, exception.stack);

        const date = new Date();
        // Get the components of the date
        const year = date.getFullYear(); // Get the year (e.g., 2024)
        const month = date.getMonth() + 1; // Get the month (0-11, add 1 for 1-12)
        const day = date.getDate(); // Get the day of the month (1-31)
        const hours = date.getHours(); // Get the hours (0-23)
        const minutes = date.getMinutes(); // Get the minutes (0-59)
        const seconds = date.getSeconds(); // Get the seconds (0-59)

        // Format the date components as desired
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        const logFilePath = `${this.errorLogPath}${year}${month}${day}_error_logs.log`;

        const logText = `[${formattedDate}] [${request.method}] ${request.originalUrl} - ${message}\n${exception.stack}\n\n\n`;

        //create log dir
        if (!existsSync(this.errorLogPath)) {
            mkdirSync(this.errorLogPath, { recursive: true });
        }

        // Optionally, you can write the error to a file
        writeFileSync(logFilePath, logText, { flag: 'a' });

        // Send an error response to the client
        response.status(status).json({
            statusCode: status,
            message: message,
        });
    }
}
