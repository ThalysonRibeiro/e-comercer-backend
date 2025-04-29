import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface ApiKeyData {
  scopes: string[];
  origins: string[];
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private apiKeys: Record<string, ApiKeyData>;

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {
    try {
      this.apiKeys = JSON.parse(this.configService.get<string>('API_KEYS_JSON') || '{}');
    } catch (err) {
      console.error('Erro ao fazer parse do API_KEYS_JSON:', err.message);
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] || request.query['api_key'];

    if (!apiKey || !this.apiKeys[apiKey as string]) {
      throw new UnauthorizedException('API Key inválida');
    }

    const keyData = this.apiKeys[apiKey as string];
    const origin = request.headers.origin;

    if (origin && !keyData.origins.includes(origin)) {
      throw new ForbiddenException('Origem não autorizada');
    }

    const requiredScopes = this.reflector.get<string[]>('scopes', context.getHandler()) || [];
    const hasScope = requiredScopes.every(scope => keyData.scopes.includes(scope));

    if (!hasScope) {
      throw new ForbiddenException('Permissão insuficiente');
    }

    return true;
  }
}
