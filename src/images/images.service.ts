import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as path from 'node:path';

@Injectable()
export class ImagesService {
  constructor(
    private configService: ConfigService
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async postImage(id: string, file: Express.Multer.File) {
    try {
      // Converte o buffer do arquivo para base64 para upload no Cloudinary
      const b64 = Buffer?.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      // Faz o upload para o Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'image',
        public_id: `image_${id}`,
        overwrite: true,
        resource_type: 'image',
      });


      return result.secure_url;
    } catch (error) {
      console.log(error);

      throw new HttpException(
        'Falha fazer upload da image',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async postVideo(id: string, file: Express.Multer.File) {
    try {
      // Valida se o arquivo é um vídeo
      if (!file.mimetype.startsWith('video/')) {
        throw new HttpException(
          'Arquivo não é um vídeo válido',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Converte o buffer do arquivo para base64
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      // Faz o upload para o Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'videos',
        public_id: `video_${id}`,
        overwrite: true,
        resource_type: 'video',
        // Opções específicas para vídeo podem ser adicionadas aqui
        chunk_size: 6000000, // Tamanho do chunk para upload de arquivos grandes (6MB)
      });

      return result.secure_url;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Falha ao fazer upload do vídeo',
        HttpStatus.BAD_REQUEST,
      );
    }
  }


  async postImages(id: string, files: Array<Express.Multer.File>) {
    try {
      const savedImages: { image: string }[] = [];

      if (!files || files.length === 0) {
        throw new Error('Nenhum arquivo foi enviado.');
      }

      // Realiza o upload das imagens no Cloudinary
      for (const file of files) {
        const fileExtension = path
          .extname(file.originalname)
          .toLowerCase()
          .substring(1);
        const fileName = `${id}.${fileExtension}`;

        // Enviando para o Cloudinary usando upload_stream
        const uploadedImage = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { public_id: fileName, resource_type: 'auto', folder: 'image' },
              async (error, result) => {
                if (error) {
                  reject(
                    new HttpException(
                      'Falha ao fazer o upload das imagens para o Cloudinary',
                      HttpStatus.BAD_REQUEST,
                    ),
                  );
                } else {
                  resolve(result);
                }
              },
            )
            .end(file.buffer); // Usa o método .end() para passar o buffer
        });

        savedImages.push(uploadedImage?.secure_url);
      }

      return savedImages;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Falha ao fazer o upload das imagens',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

}
