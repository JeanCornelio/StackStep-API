import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const queryBuilder =
      this.categoriesRepository.createQueryBuilder('category');

    const category = await queryBuilder
      .where('UPPER(category.name) = :name', {
        name: createCategoryDto.name.toUpperCase(),
      })
      .getOne();

    if (category) {
      throw new BadRequestException('Category with this name already exists');
    }

    try {
      const newCategory = this.categoriesRepository.create(createCategoryDto);
      return this.categoriesRepository.save(newCategory);
    } catch (error) {
      //TODO: improve error handling
      throw new Error('Error creating category: ' + error.message);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, size = 10 } = paginationDto;
    const categories = await this.categoriesRepository.find({
      take: size,
      skip: (page - 1) * size,
    });

    return categories;
  }

  async update(uuid: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoriesRepository.preload({
      id: uuid,
      ...updateCategoryDto,
    });
    if (!category) {
      throw new BadRequestException(`Category is not found`);
    }

    return category;
  }

  async remove(uuid: string) {
    await this.getCategoryById(uuid);

    await this.categoriesRepository.update({ id: uuid }, { isActive: false });

    await this.categoriesRepository.softDelete({ id: uuid });

    return {
      message: `Category with id ${uuid} has been removed`,
      error: false,
    };
  }

  async restore(uuid: string) {
    await this.getCategoryById(uuid, { withDeleted: true });

    await this.categoriesRepository.update({ id: uuid }, { isActive: true });

    await this.categoriesRepository.restore({ id: uuid });

    return {
      message: `Category with id ${uuid} has been activated`,
      error: false,
    };
  }

  async getCategoryById(uuid: string, args: FindOneOptions<Category> = {}) {
    const category = await this.categoriesRepository.findOne({
      where: { id: uuid },
      ...args,
    });

    if (!category) {
      throw new BadRequestException(`Category is not found`);
    }

    return category;
  }
}
