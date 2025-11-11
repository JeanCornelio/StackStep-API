import { Module } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goal } from './entities/goal.entity';
import { Category } from 'src/categories/entities/category.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [GoalsController],
  imports: [TypeOrmModule.forFeature([Goal, Category]), CommonModule],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}
