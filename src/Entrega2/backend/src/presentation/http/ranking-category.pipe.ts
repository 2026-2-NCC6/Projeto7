import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isRankingCategory, RankingCategory } from '../../domain/ranking/ranking-category';

@Injectable()
export class RankingCategoryPipe implements PipeTransform<string, RankingCategory> {
  transform(value: string): RankingCategory {
    if (!isRankingCategory(value)) {
      throw new BadRequestException('Categoria de ranking inválida.');
    }
    return value;
  }
}
