import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { GetGoalDto } from './dto/get-goal.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserRoles } from 'src/enums/user';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Auth(UserRoles.USER)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(
    @Body() createGoalDto: CreateGoalDto,
    @GetUser('id') user: { id: string },
  ) {
    const userID = user.id;
    return this.goalsService.create(createGoalDto, userID);
  }

  @Get()
  findAll(@Query() getGoalDto: GetGoalDto) {
    return this.goalsService.findAll(getGoalDto);
  }

  @Get(':uuid')
  findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.goalsService.findOne(uuid);
  }

  @Patch(':uuid')
  update(@Param('uuid') uuid: string, @Body() updateGoalDto: UpdateGoalDto) {
    return this.goalsService.update(uuid, updateGoalDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.goalsService.remove(uuid);
  }
}
