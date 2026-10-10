import { Injectable } from '@nestjs/common';

@Injectable()
export class GenerateProductVariantsService {
  async execute(): Promise<string[]> {
    return [];
  }
}
