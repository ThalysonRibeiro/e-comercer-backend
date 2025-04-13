import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddressType } from '@prisma/client';
import { ValideteZipService } from 'src/validete-zip/validete-zip.service';

@Injectable()
export class AddressService {
  constructor(
    private prisma: PrismaService,
    private readonly valideteZipService: ValideteZipService,
  ) {}

  async create(createAddressDto: CreateAddressDto) {
    if (!createAddressDto.userId) {
      throw new HttpException(
        'O userId é necessário para criar um endereço',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: createAddressDto.userId },
    });

    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.BAD_REQUEST);
    }

    let addressType;

    if (createAddressDto.addressType === 'frete') {
      addressType = AddressType.shipping;
    } else if (createAddressDto.addressType === 'faturamento') {
      addressType = AddressType.billing;
    } else if (createAddressDto.addressType === 'ambos') {
      addressType = AddressType.both;
    }

    const validateZip = await this.valideteZipService
      .validateZip(createAddressDto.zip)
      .catch(() => {
        throw new HttpException(
          'CEP inválido ou não encontrado',
          HttpStatus.BAD_REQUEST,
        );
      });

    try {
      const address = await this.prisma.address.create({
        data: {
          userId: user.id,
          addressType: addressType,
          street: createAddressDto.state.toLowerCase(),
          number: createAddressDto.number.toLowerCase(),
          city: createAddressDto.city.toLowerCase(),
          state: createAddressDto.state.toLowerCase(),
          zip: validateZip.cep,
          country: createAddressDto.country.toLowerCase(),
          complemento: createAddressDto.complemento.toLowerCase(),
          isDefault: createAddressDto.isDefault,
        },
      });

      return address;
    } catch (error) {
      console.log(error);
      throw new HttpException('Erro ao criar endereço', HttpStatus.BAD_REQUEST);
    }
  }

  async findAllAddressUser(id: string) {
    if (!id) {
      return;
    }
    try {
      return await this.prisma.address.findMany({
        where: { userId: id },
      });
    } catch (error) {
      throw new HttpException(
        'erro ao buscar um endereço',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.address.findMany();
    } catch (error) {
      throw new HttpException(
        'erro ao buscar um endereço',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, updateAddressDto: UpdateAddressDto) {
    if (!id) {
      throw new HttpException(
        'O Id é necessário para editar um endereço',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingAddress = await this.prisma.address.findFirst({
      where: { id: id },
    });

    if (!existingAddress) {
      throw new HttpException(
        'endereço não encontrado',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!updateAddressDto.zip) {
      return;
    }

    let addressType;

    if (updateAddressDto.addressType === 'frete') {
      addressType = AddressType.shipping;
    } else if (updateAddressDto.addressType === 'faturamento') {
      addressType = AddressType.billing;
    } else if (updateAddressDto.addressType === 'ambos') {
      addressType = AddressType.both;
    }

    const validateZip = await this.valideteZipService
      .validateZip(updateAddressDto.zip)
      .catch(() => {
        throw new HttpException(
          'CEP inválido ou não encontrado',
          HttpStatus.BAD_REQUEST,
        );
      });

    try {
      const address = await this.prisma.address.update({
        where: { id: existingAddress.id },
        data: {
          addressType: addressType,
          street: updateAddressDto.state?.toLowerCase(),
          number: updateAddressDto.number?.toLowerCase(),
          city: updateAddressDto.city?.toLowerCase(),
          state: updateAddressDto.state?.toLowerCase(),
          zip: validateZip.cep,
          country: updateAddressDto.country?.toLowerCase(),
          complemento: updateAddressDto.complemento?.toLowerCase(),
          isDefault: updateAddressDto.isDefault,
        },
      });

      return address;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Erro ao editar endereço',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    if (!id) {
      return;
    }
    try {
      await this.prisma.address.delete({
        where: { id: id },
      });
      return {
        message: 'Endereço deletado com sucesso!',
      };
    } catch (error) {
      throw new HttpException(
        'erro ao deletar endereço',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
