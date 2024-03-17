// auth.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';

@Injectable()
export class AuthService {
    // injecting properties dynamically
    private secretKey: string = 'SYMMETRIC_KEY';
    constructor(@Inject('JWT_KEY') key: string) {
        this.secretKey = key
    }
    generateToken(payload: any): string {
        // algorithm is HS256
        // expires in 1min
        return sign(payload, this.secretKey, { expiresIn: 60 * 60 });
    }

    verifyToken(token: string): any {
        try {
            return verify(token, this.secretKey);
        } catch (error) {
            return null;
        }
    }
}
