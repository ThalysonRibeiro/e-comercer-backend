import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { buscarEndereco } from 'utils-playground';

@Injectable()
export class ValideteZipService {
  async validateZip(zipValidate: string) {
    try {
      const zip = await buscarEndereco(zipValidate.replace(/\D/g, ''));
      if (!zip || zip.error) {
        throw new HttpException(
          'CEP inválido ou não encontrado',
          HttpStatus.BAD_REQUEST,
        );
      }
      return zip;
    } catch (error) {
      throw new HttpException(
        'Erro ao consultar o CEP',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
