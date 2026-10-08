import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { UsersService } from './users.service.js';
import { UserModel } from './user.model.js';
import { ClinicLocationModel } from '../clinic/models/clinic-location.model.js';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(UserModel),
          useValue: {
            findOne: vi.fn(),
            findByPk: vi.fn(),
            findAll: vi.fn(),
            create: vi.fn(),
          },
        },
        {
          provide: getModelToken(ClinicLocationModel),
          useValue: {
            findOne: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
