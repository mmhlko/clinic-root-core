import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/sequelize';
import { UsersService } from './users.service.js';
import { UserModel } from './user.model.js';
import { ClinicLocationModel } from '../clinic/models/clinic-location.model.js';
import { MediaService } from '../media/media.service.js';
import { UserRole } from './user-role.enum.js';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: {
    findOne: ReturnType<typeof vi.fn>;
    findByPk: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let mediaService: {
    replaceImage: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    userModel = {
      findOne: vi.fn(),
      findByPk: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
    };
    mediaService = {
      replaceImage: vi.fn().mockResolvedValue(null),
      delete: vi.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(UserModel),
          useValue: userModel,
        },
        {
          provide: getModelToken(ClinicLocationModel),
          useValue: {
            findOne: vi.fn(),
          },
        },
        {
          provide: MediaService,
          useValue: mediaService,
        },
        {
          provide: getConnectionToken(),
          useValue: {
            transaction: vi.fn((callback) => callback({})),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('loads the profile media when finding a user by email', async () => {
    userModel.findOne.mockResolvedValue(null);

    await service.findByEmail('ada@example.com');

    expect(userModel.findOne).toHaveBeenCalledWith({
      where: { email: 'ada@example.com' },
      include: [
        {
          model: expect.any(Function),
          as: 'photoMedia',
          attributes: ['id', 'url'],
        },
      ],
    });
  });

  it('attaches the uploaded profile media when creating a user', async () => {
    const photoMediaId = 'd8d59a0d-4c79-4bd5-a2cf-1d0a744f5f5c';
    const createdUser = {
      id: 'user-id',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      role: UserRole.ADMIN,
      photoMediaId,
      photoMedia: { id: photoMediaId, url: '/uploads/images/ada.webp' },
      reload: vi.fn(),
    };
    userModel.findOne.mockResolvedValue(null);
    userModel.create.mockResolvedValue(createdUser);

    await service.create({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'securePass123',
      role: UserRole.ADMIN,
      photoMediaId,
    });

    expect(mediaService.replaceImage).toHaveBeenCalledWith(
      null,
      photoMediaId,
      expect.any(Object),
    );
    expect(userModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ photoMediaId }),
      expect.objectContaining({ transaction: expect.any(Object) }),
    );
  });

  it.each([
    ['replaces', 'new-media-id', true],
    ['removes', null, true],
    ['keeps', 'old-media-id', false],
  ])('%s profile media during a user update', async (_case, nextMediaId, shouldDeleteOldMedia) => {
    const oldMedia = { id: 'old-media-id', url: '/uploads/images/old.webp' };
    const user = {
      id: 'user-id',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      role: UserRole.ADMIN,
      locationId: null,
      photoMediaId: 'old-media-id',
      save: vi.fn(),
      reload: vi.fn(),
    };
    userModel.findByPk.mockResolvedValue(user);
    mediaService.replaceImage.mockResolvedValue(
      shouldDeleteOldMedia ? oldMedia : null,
    );

    await service.update('user-id', { photoMediaId: nextMediaId });

    expect(user.photoMediaId).toBe(nextMediaId);
    expect(mediaService.replaceImage).toHaveBeenCalledWith(
      'old-media-id',
      nextMediaId,
      expect.any(Object),
    );
    expect(mediaService.delete).toHaveBeenCalledTimes(
      shouldDeleteOldMedia ? 1 : 0,
    );
  });
});
