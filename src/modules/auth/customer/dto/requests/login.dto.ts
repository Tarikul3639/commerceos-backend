import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: "The email address of the customer",
    example: "customer@example.com"
  })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "The password of the customer",
    example: "password123"
  })
  password!: string;
}