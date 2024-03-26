import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

@Injectable()
export class SSOService {
    constructor() {

    }
    async checkSSOAuthKey(accessToken: string) {
        const formData = new FormData();
        formData.append('grant_type', 'authorization_code');
        formData.append('code', accessToken);
        formData.append('client_id', '');
        formData.append('client_secret', '');
        formData.append('redirect_uri', 'http://localhost:3000/auth/cb');
        const data: any = await axios.post('https://accounts.google.com/o/oauth2/token', formData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })

        if (!data || data?.error) {
            return null;
        }
        let decoded: any = jwtDecode(data.id_token);

        const email = decoded.email ? decoded.email : decoded.preferred_username;
        return email;
    }
}