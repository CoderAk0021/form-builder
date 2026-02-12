import bcrypt from 'bcrypt';
import dotenv from 'dotenv'
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const hashPassword = async (password) => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password,saltRounds);
        return hashedPassword;
    } catch (error) {
        console.log('Error while hashing : ',error.message);
        return 0;
    }
}

export const matchPassword = async (password,hashPassword) => {
    try {
       const result = await bcrypt.compare(password,hashPassword);
       return result;
    } catch (error) {
       return false; 
    }
}

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 60 * 60 * 1000,
  };
}