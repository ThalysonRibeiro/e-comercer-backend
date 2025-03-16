import { AccountStatus, AccountType } from '@prisma/client';

export class CreateUserDTO {
  email: string;
  name?: string;
  googleId?: string;
  avatar?: string;
  status: AccountStatus;
  type: AccountType;
  cpf: string;
  genero: string;
  dateOfBirth: string;
  phone: string;
  password?: string;
  emailVerificationToken?: string | undefined;
}

export class CreateUserAdminDTO extends CreateUserDTO {
  adminPassword: string;
}
