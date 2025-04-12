import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AccountType } from '@prisma/client';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) { }

  @Post()
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressService.create(createAddressDto);
  }

  @Roles(AccountType.useradmin)
  @Get('admin')
  findAll() {
    return this.addressService.findAll();
  }

  @Get('user/:id')
  findAllAddressUserId(@Param('id') id: string) {
    return this.addressService.findAllAddressUser(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressService.update(id, updateAddressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.addressService.remove(id);
  }
}
