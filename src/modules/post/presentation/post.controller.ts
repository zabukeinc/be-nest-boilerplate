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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { CreatePostDto } from '../application/dtos/create-post.dto';
import { PostResponseDto } from '../application/dtos/post-response.dto';
import { CreatePostCommand } from '../application/commands/create-post/create-post.command';
import { PublishPostCommand } from '../application/commands/publish-post/publish-post.command';
import { GetPostQuery } from '../application/queries/get-post/get-post.query';
import { ListPostsQuery } from '../application/queries/list-posts/list-posts.query';
import { PaginationQueryDto } from '@shared/pagination';
import { SupabaseAuthGuard } from '@shared/guards/auth.guard';
import { AuditLog } from '@shared/decorators/audit-log.decorator';
import { PostStorageService } from '../infrastructure/adapters/supabase-storage.adapter';

@ApiTags('Posts')
@ApiBearerAuth()
@Controller('posts')
@UseGuards(SupabaseAuthGuard)
export class PostController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly postStorageService: PostStorageService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new post' })
  @AuditLog({ action: 'CREATE', entity: 'POST' })
  async create(@Body() dto: CreatePostDto, @UploadedFile() file?: Express.Multer.File) {
    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.postStorageService.uploadImage(
        file.buffer,
        file.originalname,
        file.mimetype,
      );
    }
    const authorId = 'tmp-author';
    const id = await this.commandBus.execute(
      new CreatePostCommand(dto.title, authorId, dto.content, imageUrl),
    );
    return this.queryBus.execute(new GetPostQuery(id));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  async findOne(@Param('id') id: string): Promise<PostResponseDto> {
    return this.queryBus.execute(new GetPostQuery(id));
  }

  @Get()
  @ApiOperation({ summary: 'List posts with pagination' })
  async findAll(@Query() pagination: PaginationQueryDto) {
    return this.queryBus.execute(new ListPostsQuery(pagination));
  }

  @Patch(':id/publish')
  @AuditLog({ action: 'PUBLISH', entity: 'POST' })
  @ApiOperation({ summary: 'Publish a post' })
  async publish(@Param('id') id: string) {
    await this.commandBus.execute(new PublishPostCommand(id));
    return this.queryBus.execute(new GetPostQuery(id));
  }

  @Delete(':id')
  @AuditLog({ action: 'DELETE', entity: 'POST' })
  @ApiOperation({ summary: 'Soft delete a post' })
  async remove(@Param('id') id: string) {}
}
