import { Controller, Get, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";

@Controller('ping')
export class PingController {
    @Get('/:slug?')
    async ping(@Req() req: Request, @Res() res: Response) {
        if (req.params.slug) {
            res.header('Count', '0')
            return res.send({ status: 'UP', params: req.params.slug });
        }
        res.header('Count', '0')

        return res.send({ status: 'UP' });
    }
}