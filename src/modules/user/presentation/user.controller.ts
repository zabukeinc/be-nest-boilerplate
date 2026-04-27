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
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from '../application/dtos/create-user.dto';
import { UpdateUserDto } from '../application/dtos/update-user.dto';
import { UserResponseDto } from '../application/dtos/user-response.dto';
import { CreateUserCommand } from '../application/commands/create-user/create-user.command';
import { UpdateUserCommand } from '../application/commands/update-user/update-user.command';
import { DeleteUserCommand } from '../application/commands/delete-user/delete-user.command';
import { GetUserQuery } from '../application/queries/get-user/get-user.query';
import { ListUsersQuery } from '../application/queries/list-users/list-users.query';
import { PaginationQueryDto } from '@shared/pagination';
import { SupabaseAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { Roles } from '@shared/decorators/roles.decorator';
import { AuditLog } from '@shared/decorators/audit-log.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @AuditLog({ action: 'CREATE', entity: 'USER' })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const id = await this.commandBus.execute(new CreateUserCommand(dto.email, dto.name));
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Get()
  @ApiOperation({ summary: 'List all users with pagination' })
  async findAll(@Query() pagination: PaginationQueryDto) {
    return this.queryBus.execute(new ListUsersQuery(pagination));
  }

  @Patch(':id')
  @AuditLog({ action: 'UPDATE', entity: 'USER' })
  @ApiOperation({ summary: 'Update user' })
  @ApiOkResponse({ type: UserResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<UserResponseDto> {
    await this.commandBus.execute(new UpdateUserCommand(id, dto.name, dto.avatarUrl));
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Delete(':id')
  @Roles('admin')
  @AuditLog({ action: 'DELETE', entity: 'USER' })
  @ApiOperation({ summary: 'Soft delete user' })
  async remove(@Param('id') id: string) {
    await this.commandBus.execute(new DeleteUserCommand(id));
  }
}
