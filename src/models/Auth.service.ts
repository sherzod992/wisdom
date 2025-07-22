import { token } from "morgan";
import { AUTH_TIMER } from "./libs/config";
import { Member } from "./libs/types/member";
import Errors, { HttpCode, Message } from "./libs/Errors";
import jwt from "jsonwebtoken"

class AuthService {
    private readonly secretToken;
    constructor() {
        this.secretToken = process.env.SECRET_TOKEN as string
    }

    public async createToken(payload: Member) { 
        return new Promise((resolve, reject) => {
            const duration = `${AUTH_TIMER}h`;
            
            // MongoDB ObjectId를 문자열로 변환하여 JWT 토큰에 안전하게 포함
            const tokenPayload = {
                _id: payload._id.toString(),
                memberType: payload.memberType,
                memberStatus: payload.memberStatus,
                memberNick: payload.memberNick,
                memberPhone: payload.memberPhone,
                memberPoints: payload.memberPoints
            };

            jwt.sign(
                tokenPayload,
                process.env.SECRET_TOKEN as string, 
                {
                 expiresIn: duration,   
                },
                (err, token) => {
                    if (err) {
                        console.error("JWT Sign Error:", err);
                        reject(new Errors(HttpCode.UNAUTHORIZED, Message.TOKEN_CREATION_FAILED));
                    } else {
                        resolve(token as string);
                    }
                }
            )
        })
    }

    public async checkAuth(token: string): Promise<Member> {
        const result: Member = (await jwt.verify(
            token,
            this.secretToken
         )) as Member;
         console.log(`----- [AUTH] memberNick: ${result.memberNick} ---`);
         return result;
    }
    
}

export default AuthService;