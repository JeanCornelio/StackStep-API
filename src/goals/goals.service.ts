import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Goal } from './entities/goal.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { GetGoalDto } from './dto/get-goal.dto';

@Injectable()
export class GoalsService {
  private readonly logger = new Logger('GoalService');

  constructor(
    @InjectRepository(Goal)
    private readonly goalsRepository: Repository<Goal>,
  ) {}

  async create(createGoalDto: CreateGoalDto) {
    try {
      const goal = this.goalsRepository.create(createGoalDto);
      await this.goalsRepository.save(goal);

      return {
        goal,
      };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  async findAll(getGoalDto: GetGoalDto) {
    const { size = 10, page = 1, term } = getGoalDto;

    const userlogedUUID = '9c436e12-def3-4112-b559-35ca760af48e'; //Get user from TOKEN

    const query = this.goalsRepository
      .createQueryBuilder('goal')
      .leftJoin('goal.user', 'user') //Relation in goal and users
      .select(['goal', 'user.id']) //select all of goal and only id of user
      .where('user.id = :id', { id: userlogedUUID }); //Search by user

    if (term) {
      query.andWhere(
        'goal.title ILIKE :title or goal.description ILIKE :description', //  search by Term
        {
          title: `%${term}%`,
          description: `%${term}%`,
        },
      );
    }

    query
      .orderBy('goal.createdAt', 'DESC')
      .take(size)
      .skip((page - 1) * size);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
    };
  }

  async findOne(uuid: string) {
    const goal = await this.goalsRepository
      .createQueryBuilder('goal')
      .leftJoin('goal.user', 'user')
      .select(['goal', 'user.id'])
      .where(`goal.id = :id`, { id: uuid }) //get by id
      .getOne();

    return goal;
  }

  update(id: number, updateGoalDto: UpdateGoalDto) {
    return `This action updates a #${id} goal`;
  }

  remove(id: number) {
    return `This action removes a #${id} goal`;
  }

  //TODO: Create a reutilizable function or class
  //TODO: Add type
  handleError(error) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    if (error.code === '23503') {
      throw new BadRequestException('The user is not found.');
    }

    this.logger.error(error);

    throw new InternalServerErrorException(
      'Unexpected error, check Server logs',
    );
  }
}
