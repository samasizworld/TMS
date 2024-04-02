import { Injectable } from '@nestjs/common';
import { createHmac, randomBytes } from 'crypto'

import { encode, decode } from 'hi-base32'
import { toDataURL } from 'qrcode'
@Injectable()
export class MFA {
    // private readonly randomByteLength: number
    constructor() {
    }
    generateSecret() {
        const randomBuffer = randomBytes(20);
        return encode(randomBuffer).replace(/=/g, "")
    }

    async generateQRCodeDataForMFA(key: string, email: string) {
        return await toDataURL(`otpauth://totp/${email}?secret=${key}&issuedby=tms.asis`)
    }


    verifyOTP(OTPCode: string, secret: string, OTPValidTimeInSec: number = 30): boolean {
        const otpCode = +OTPCode;
        const windowSize = 1;

        for (let i = -windowSize; i <= windowSize; i++) {
            const timeInMs = OTPValidTimeInSec * 1000;
            let counter = Math.floor(Date.now() / timeInMs) + i;

            const decodedSecret = decode.asBytes(secret)
            const buffer = Buffer.alloc(8);
            for (let j = 0; j < 8; j++) {
                buffer[7 - j] = counter & 0xff;
                counter >>= 8;
            }

            const hmac = createHmac("sha1", Buffer.from(decodedSecret));
            hmac.update(buffer);
            const hmacValue = hmac.digest();
            // console.log(hmacValue)
            const offset = hmacValue[hmacValue.length - 1] & 0xf;
            const code = (
                ((hmacValue[offset] & 0x7f) << 24) |
                ((hmacValue[offset + 1] & 0xff) << 16) |
                ((hmacValue[offset + 2] & 0xff) << 8) |
                (hmacValue[offset + 3] & 0xff)
            ) % 1000000; // Use 10^6 to get a 6-digit OTP code

            if (otpCode === code) {
                return true;
            }
        }

        return false;
    }
}