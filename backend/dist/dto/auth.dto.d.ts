export declare class LoginDto {
    username: string;
    password: string;
}
export declare class RegisterDto {
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    email?: string;
}
export declare class AuthResponseDto {
    token: string;
    user: {
        id: string;
        username: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        isAdmin: boolean;
    };
}
