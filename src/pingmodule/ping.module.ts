import { Module } from "@nestjs/common";
import { PingController } from "./pingController";

@Module({ controllers: [PingController] })
export class PingModule {

}