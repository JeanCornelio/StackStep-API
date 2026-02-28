import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Goal } from './entities/goal.entity';
import { Repository } from 'typeorm';
import { GetGoalDto } from './dto/get-goal.dto';
import { Category } from 'src/categories/entities/category.entity';
import { HandleErrorService } from 'src/common/services/handleError.service';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalsRepository: Repository<Goal>,
    private readonly handleErrorService: HandleErrorService,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createGoalDto: CreateGoalDto, userId: string) {
    try {
      console.log(createGoalDto);

      const goal = this.goalsRepository.create({
        ...createGoalDto,
        user: { id: userId },
        category: { id: createGoalDto.categoryId },
      });
      await this.goalsRepository.save(goal);

      return {
        goal,
      };
    } catch (error) {
      this.handleErrorService.error(error);
    }
  }

  async findAll(getGoalDto: GetGoalDto, userId: string) {
    const { size = 8, page = 1, term, categoryId } = getGoalDto;

    const userlogedUUID = userId; //Get user from TOKEN

    const query = this.goalsRepository
      .createQueryBuilder('goals')
      .leftJoin('goals.user', 'user') //Relation in goal and users
      .leftJoin('goals.category', 'category') //Relation in goal and category
      .select(['goals', 'user.id', 'category.id', 'category.name'])
      .where('user.id = :id', { id: userlogedUUID }); //Search by user

    if (term) {
      query.andWhere(
        'goals.title ILIKE :title or goals.description ILIKE :description', //  search by Term
        {
          title: `%${term}%`,
          description: `%${term}%`,
        },
      );
    }

    if (categoryId) {
      query.andWhere('goals.category = :category', {
        category: categoryId,
      }); //filter by category
    }

    query
      .orderBy('goals.createdAt', 'DESC')
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

    await this.goalsRepository.save(goal as Goal);

    return goal;
  }

  async remove(uuid: string) {
    await this.findOne(uuid);

    await this.goalsRepository.delete({ id: uuid });
    return {
      message: 'Goal deleted successfully',
    };
  }
}
