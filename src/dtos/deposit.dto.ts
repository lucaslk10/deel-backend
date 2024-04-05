import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsNumber } from 'class-validator';

export class DepositAmountDto {
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @IsNotEmpty()
  public amount: number;
}
