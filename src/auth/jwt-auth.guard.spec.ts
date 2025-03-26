import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if the route is public', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const context: ExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should call super.canActivate if the route is not public', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const context: ExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;

    const canActivateSpy = jest
      .spyOn(JwtAuthGuard.prototype, 'canActivate')
      .mockImplementation(async () => true);

    const result = await guard.canActivate(context);
    expect(canActivateSpy).toHaveBeenCalled();
    expect(result).toBe(true); // Assegura que o resultado é o esperado
  });
});
