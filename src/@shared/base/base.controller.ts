import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '../pagination';
import { SupabaseAuthGuard } from '../guards/auth.guard';

export interface BaseControllerConfig {
  name: string;
  createDto: any;
  updateDto: any;
  responseDto: any;
  createCommand: new (data: any) => any;
  updateCommand: new (id: string, data: any) => any;
  deleteCommand: new (id: string) => any;
  getByIdQuery: new (id: string) => any;
  listQuery: new (pagination: PaginationQueryDto) => any;
  guard?: any;
}

export function createBaseController(config: BaseControllerConfig) {
  @ApiTags(config.name)
  @ApiBearerAuth()
  @Controller(config.name.toLowerCase())
  @UseGuards(config.guard || SupabaseAuthGuard)
  class BaseController {
    constructor(
      public readonly commandBus: CommandBus,
      public readonly queryBus: QueryBus,
    ) {}

    @Post()
    @ApiOperation({ summary: `Create a new ${config.name.toLowerCase()}` })
    @ApiCreatedResponse({ type: config.responseDto })
    async create(@Body() dto: InstanceType<typeof config.createDto>) {
      const id = await this.commandBus.execute(new config.createCommand(dto));
      return this.queryBus.execute(new config.getByIdQuery(id));
    }

    @Get(':id')
    @ApiOperation({ summary: `Get ${config.name.toLowerCase()} by ID` })
    @ApiOkResponse({ type: config.responseDto })
    @ApiNotFoundResponse({ description: `${config.name} not found` })
    async findOne(@Param('id') id: string) {
      return this.queryBus.execute(new config.getByIdQuery(id));
    }

    @Get()
    @ApiOperation({ summary: `List all ${config.name.toLowerCase()}s with pagination` })
    async findAll(@Query() pagination: PaginationQueryDto) {
      return this.queryBus.execute(new config.listQuery(pagination));
    }

    @Patch(':id')
    @ApiOperation({ summary: `Update ${config.name.toLowerCase()}` })
    @ApiOkResponse({ type: config.responseDto })
    async update(@Param('id') id: string, @Body() dto: InstanceType<typeof config.updateDto>) {
      await this.commandBus.execute(new config.updateCommand(id, dto));
      return this.queryBus.execute(new config.getByIdQuery(id));
    }

    @Delete(':id')
    @ApiOperation({ summary: `Soft delete ${config.name.toLowerCase()}` })
    async remove(@Param('id') id: string) {
      await this.commandBus.execute(new config.deleteCommand(id));
    }
  }

  return BaseController;
}
