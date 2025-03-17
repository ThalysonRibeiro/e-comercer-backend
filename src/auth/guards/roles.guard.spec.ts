import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({
        user: {
          type: 'userdefault', // Ajuste conforme sua enumeração
        },
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  });

  // Teste para quando nenhum role é necessário
  it('should return true if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const result = rolesGuard.canActivate(mockExecutionContext);

    expect(result).toBe(true); // Verifica se a função retorna true
  });

  // Teste para quando o usuário tem o role necessário
  it('should return true if user has the required role', () => {
    const requiredRoles = ['userdefault']; // Altere conforme sua enumeração
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

    const result = rolesGuard.canActivate(mockExecutionContext);

    expect(result).toBe(true); // Verifica se a função retorna true
  });

  // Teste para quando o usuário não tem o role necessário
  it('should return false if user does not have the required role', () => {
    const requiredRoles = ['useradmin']; // Altere conforme sua enumeração
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

    const result = rolesGuard.canActivate(mockExecutionContext);

    expect(result).toBe(false); // Verifica se a função retorna false
  });
});
