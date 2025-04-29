import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiKeyUrlMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.query.api_key as string; // Extrai o valor de api_key na URL

    if (apiKey) {
      req.headers['x-api-key'] = apiKey;  // Adiciona a chave ao header 'x-api-key'
    }

    next();  // Segue com o próximo middleware ou controlador
  }
}
