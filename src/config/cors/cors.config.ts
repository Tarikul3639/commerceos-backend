import { registerAs } from "@nestjs/config";

export default registerAs("cors", () => ({
    frontendUrl: process.env.FRONTEND_URL,
}));