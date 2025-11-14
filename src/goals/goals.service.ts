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

import { GetGoalDto } from './dto/get-goal.dto';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class GoalsService {
  private readonly logger = new Logger('GoalService');

  constructor(
    @InjectRepository(Goal)
    private readonly goalsRepository: Repository<Goal>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createGoalDto: CreateGoalDto) {
    try {
      const goal = this.goalsRepository.create({
        ...createGoalDto,
        category: { id: createGoalDto.categoryId },
      });
      await this.goalsRepository.save(goal);

      return {
        goal,
      };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  async findAll(getGoalDto: GetGoalDto) {
    const { size = 10, page = 1, term, category } = getGoalDto;

    const userlogedUUID = '8cd4be04-9d70-4669-a815-96af5c802e18'; //Get user from TOKEN

    const query = this.goalsRepository
      .createQueryBuilder('goal')
      .leftJoin('goal.user', 'user') //Relation in goal and users
      .leftJoin('goal.category', 'category') //Relation in goal and category
      .select(['goal', 'user.id', 'category.id', 'category.name'])
      .where('user.id = :id', { id: userlogedUUID }); //Search by user

    //TODO: Fix the category filter
    if (category) {
      query.andWhere('goal.category_id = :category_id', {
        category_id: category,
      }); //filter by category
    }

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
    const goal = await this.goalsRepository.findOne({
      where: { id: uuid },
      relations: { user: true, category: true },
      select: {
        user: { id: true },
        category: { id: true, name: true },
      },
    });

    if (!goal) {
      throw new BadRequestException(`Goal not found`);
    }

    return goal;
  }

  async update(uuid: string, updateGoalDto: UpdateGoalDto) {
    await this.findOne(uuid);

    const category = await this.categoryRepository.findOneBy({
      id: updateGoalDto.categoryId,
    });

    if (!category) {
      throw new BadRequestException(`Category not found`);
    }

    const goal = await this.goalsRepository.preload({
      id: uuid,
      ...updateGoalDto,
      category: category,
    });

    return goal;
  }

  async remove(uuid: string) {
    await this.findOne(uuid);

    await this.goalsRepository.delete({ id: uuid });
    return {
      message: 'Goal deleted successfully',
    };
  }

  //TODO: Create a reutilizable function or class
  //TODO: Add type
  //TODO: Add categoryid error
  handleError(error) {
    console.log(error);

    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    if (error.code === '23503') {
      throw new BadRequestException('Error related to foreign key constraint.');
    }

    this.logger.error(error);

    throw new InternalServerErrorException(
      'Unexpected error, check Server logs',
    );
  }
}
