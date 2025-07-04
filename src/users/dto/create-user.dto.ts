import { AccountStatus, AccountType } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { INVALID_EMAIL_DOMAINS } from './invalid-email-domains';
import { Type } from 'class-transformer';

@ValidatorConstraint({ name: 'isValidEmail', async: false })
export class IsValidEmailConstraint implements ValidatorConstraintInterface {
  validate(email: string, args?: ValidationArguments): boolean {
    // Verifica se o email passou na validação padrão do @IsEmail()
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return false;

    // Verifica domínios inválidos
    const lowercaseEmail = email.toLowerCase();
    if (
      INVALID_EMAIL_DOMAINS.some((domain) => lowercaseEmail.endsWith(domain))
    ) {
      return false;
    }

    // Validações adicionais
    const [localPart, domain] = email.split('@');

    // Verifica comprimento
    if (localPart.length > 64 || domain.length > 255) {
      return false;
    }

    // Proibe caracteres especiais consecutivos
    if (/\.{2,}|_{2,}|-{2,}/.test(localPart)) {
      return false;
    }

    // Proibe pontos no início ou fim do local part
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return false;
    }

    return true;
  }

  defaultMessage(args?: ValidationArguments): string {
    return 'Email inválido. Por favor, forneça um email válido e real.';
  }
}

export class CreateUserDTO {
  @IsString()
  @IsEmail()
  @Validate(IsValidEmailConstraint)
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  googleId?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  status: AccountStatus;


  type: AccountType;

  @IsString()
  @IsOptional()
  cpf_or_cnpj: string;

  @IsString()
  gender: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfBirth?: Date | null;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  emailVerificationToken?: string | undefined;

  @IsBoolean()
  @IsOptional()
  acceptOffers?: boolean;

  @IsBoolean()
  @IsOptional()
  acceptTerms?: boolean;

  @IsString()
  @IsOptional()
  documentType?: string;
}

export class CreateUserAdminDTO extends CreateUserDTO {
  @IsString()
  adminPassword: string;
}
