import { Controller } from '@nestjs/common';
import { FreelancerService } from './freelancer.service';

@Controller('freelancer')
export class FreelancerController {
  constructor(private readonly freelancerService: FreelancerService) {}
}
