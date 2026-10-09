import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserModel } from './user.model.js';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto.js';
import { UserRole } from './user-role.enum.js';
import * as bcrypt from 'bcrypt';
import { ClinicLocationModel } from '../clinic/models/clinic-location.model.js';
import { ClinicModel } from '../clinic/models/clinic.model.js';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { MediaService } from '../media/media.service.js';
import { MediaModel } from '../media/media.model.js';
import { ClinicTenantContextStore } from '../clinic/tenant/tenant-context.store.js';

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(UserModel)
		private userModel: typeof UserModel,

		@InjectModel(ClinicLocationModel)
		private readonly clinicLocationModel:
			typeof ClinicLocationModel,

		private readonly mediaService: MediaService,

		private readonly tenantContext: ClinicTenantContextStore,

		@InjectConnection()
		private readonly sequelize: Sequelize,
	) { }

	async create(dto: CreateUserDto) {
		const tenantContext = this.tenantContext.get();
		const clinicId = dto.role === UserRole.ROOT
			? null
			: tenantContext?.clinicId;

		if (dto.role !== UserRole.ROOT && !clinicId) {
			throw new ForbiddenException('A clinic context is required to create this user');
		}

		// if (
		// 	dto.role === UserRole.MANAGER &&
		// 	!dto.locationId
		// ) {
		// 	throw new BadRequestException(
		// 		'Manager must have a clinic location',
		// 	);
		// }

		if (
			dto.role !== UserRole.MANAGER &&
			dto.locationId
		) {
			throw new BadRequestException(
				'Only manager can have a clinic location',
			);
		}

		let locationId: string | null = null;

		if (dto.role === UserRole.MANAGER && dto.locationId) {
			const location = await this.clinicLocationModel.findOne({
				where: { id: dto.locationId, isActive: true },
			});
			if (!location) {
				throw new NotFoundException('Clinic location not found');
			}
			locationId = dto.locationId!;
		}

		const existingUser = await this.findByEmail(dto.email);

		if (existingUser) {
			throw new ConflictException(
				'Current email is occupied, please choose another email',
			);
		}

		const hashedPassword = await bcrypt.hash(dto.password, 12);

		const user = await this.sequelize.transaction(async (transaction) => {

			if (dto.photoMediaId) {
        await this.mediaService.replaceImage(
          null,
          dto.photoMediaId,
          transaction,
        );
      }

			return this.userModel.create({
				firstName: dto.firstName,
				lastName: dto.lastName,
				email: dto.email,
				password: hashedPassword,
				role: dto.role ?? UserRole.MANAGER,
				clinicId,
				locationId,
				photoMediaId: dto.photoMediaId ?? null,
			}, { 
				include: [{model: MediaModel, as: 'photoMedia', attributes: ['id', 'url']}],
				transaction,
			 });
		});

		await user.reload({
			include: [
				{
					model: MediaModel,
					as: 'photoMedia',
					attributes: ['id', 'url'],
				},
			],
		});

		return {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			role: user.role,
			clinicId: user.clinicId,
			photoMedia: user.photoMedia,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			locationId: user.locationId,
			isActive: user.isActive,
		};
	}

	async update(id: string, dto: UpdateUserDto) {
		const user = await this.findByIdInCurrentClinic(id);

		if (!user) {
			throw new NotFoundException(
					'User not found',
				);
		}
		const previousMediaId = user.photoMediaId;

		const nextRole = dto.role ?? user.role;

		if (
			nextRole === UserRole.MANAGER
		) {
			const nextLocationId =
				dto.locationId !== undefined
					? dto.locationId
					: user.locationId;

			if (!nextLocationId) {
				throw new BadRequestException(
					'Manager must have a clinic location',
				);
			}

			const location =
				await this.clinicLocationModel.findOne({
					where: {
						id: nextLocationId,
						isActive: true,
					},
				});

			if (!location) {
				throw new NotFoundException(
					'Clinic location not found',
				);
			}

			user.locationId = nextLocationId;
		} else {
			if (
				dto.locationId !== undefined &&
				dto.locationId !== null
			) {
				throw new BadRequestException(
					'Only manager can have a clinic location',
				);
			}

			user.locationId = null;
		}

		if (dto.email && dto.email !== user.email) {
			const existingUser = await this.userModel.findOne({
				where: {
					email: dto.email,
				},
			});

			if (existingUser) {
				throw new ConflictException(
					'User with this email already exists',
				);
			}
		}

		if (dto.firstName !== undefined) {
			user.firstName = dto.firstName;
		}

		if (dto.lastName !== undefined) {
			user.lastName = dto.lastName;
		}

		if (dto.email !== undefined) {
			user.email = dto.email;
		}

		if (dto.role !== undefined) {
			user.role = dto.role;
		}

		if (dto.password !== undefined) {
			user.password = await bcrypt.hash(dto.password, 12);
			user.hashedRefreshToken = null;
		}
		let mediaToDelete: MediaModel | null = null;
		await this.sequelize.transaction(async (transaction) => {
			if (dto.photoMediaId !== undefined) {
				mediaToDelete = await this.mediaService.replaceImage(
					previousMediaId,
					dto.photoMediaId,
					transaction,
				);
				user.photoMediaId = dto.photoMediaId;
			}
			await user.save({ transaction });
		});
		if (mediaToDelete) await this.mediaService.delete(mediaToDelete);

		await user.reload({
			include: [
				{
					model: MediaModel,
					as: 'photoMedia',
					attributes: ['id', 'url'],
				},
			],
		});

		return {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			role: user.role,
			clinicId: user.clinicId,
			photoMedia: user.photoMedia,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			locationId: user.locationId,
			isActive: user.isActive,
		};
	}

	async updateProfile(id: string, dto: UpdateUserDto) {
		const user = await this.findById(id);
		const previousMediaId = user.photoMediaId;

		if (dto.email && dto.email !== user.email) {
			const existingUser = await this.userModel.findOne({
				where: { email: dto.email },
			});

			if (existingUser) {
				throw new ConflictException(
					'User with this email already exists',
				);
			}
		}

		if (dto.firstName !== undefined) user.firstName = dto.firstName;
		if (dto.lastName !== undefined) user.lastName = dto.lastName;
		if (dto.email !== undefined) user.email = dto.email;
		if (dto.password !== undefined) {
			user.password = await bcrypt.hash(dto.password, 12);
			user.hashedRefreshToken = null;
		}

		let mediaToDelete: MediaModel | null = null;
		await this.sequelize.transaction(async (transaction) => {
			if (dto.photoMediaId !== undefined) {
				mediaToDelete = await this.mediaService.replaceImage(
					previousMediaId,
					dto.photoMediaId,
					transaction,
				);
				user.photoMediaId = dto.photoMediaId;
			}
			await user.save({ transaction });
		});
		if (mediaToDelete) await this.mediaService.delete(mediaToDelete);

		await user.reload({
			include: [
				{
					model: MediaModel,
					as: 'photoMedia',
					attributes: ['id', 'url'],
				},
			],
		});

		return {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			role: user.role,
			clinicId: user.clinicId,
			photoMedia: user.photoMedia,
			isActive: user.isActive,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			locationId: user.locationId,
		};
	}

	async setActive(id: string, isActive: boolean) {
		const user = await this.findByIdInCurrentClinic(id);

		user.isActive = isActive;

		if (!isActive) {
			user.hashedRefreshToken = null;
		}

		await user.save();

		return this.findUserById(user.id)
	}

	async remove(id: string) {
		const user = await this.findByIdInCurrentClinic(id);
		await user.destroy();
		return { id };
	}

	async findById(id: string) {
		const user = await this.userModel.findByPk(id, {
			include: [
				{
					model: MediaModel,
					as: 'photoMedia',
					attributes: ['id', 'url'],
				},
			]
		});
		if (!user) throw new NotFoundException('User not found');
		return user;
	}

	async findByIdWithClinic(id: string) {
		const user = await this.userModel.findByPk(id, {
			include: [
				{ model: MediaModel, as: 'photoMedia', attributes: ['id', 'url'] },
				{ model: ClinicModel, as: 'clinic', attributes: ['id', 'slug'] },
			],
		});
		if (!user) throw new NotFoundException('User not found');
		return user;
	}

	async findByEmailWithClinic(email: string) {
		return this.userModel.findOne({
			where: { email },
			include: [
				{ model: MediaModel, as: 'photoMedia', attributes: ['id', 'url'] },
				{ model: ClinicModel, as: 'clinic', attributes: ['id', 'slug'] },
			],
		});
	}

	async findUserById(id: string) {
		const context = this.tenantContext.require();
		const isOwnRootProfile = context.actorRole === UserRole.ROOT && context.actorId === id;
		const user = await this.userModel.findOne({
			where: isOwnRootProfile ? { id } : { id, clinicId: context.clinicId },
			attributes: {
				exclude: ['password', 'hashedRefreshToken']
			},
			include: [
				{
					model: ClinicLocationModel,
					as: 'location',
				},
				{
					model: MediaModel,
					as: 'photoMedia',
					attributes: ['id', 'url'],
				},
			]
		});
		if (!user) throw new NotFoundException('User not found');
		return user;
	}

	async findByIdInCurrentClinic(id: string) {
		const context = this.tenantContext.require();
		const user = await this.userModel.findOne({
			where: { id, clinicId: context.clinicId },
			include: [{ model: MediaModel, as: 'photoMedia', attributes: ['id', 'url'] }],
		});
		if (!user) throw new NotFoundException('User not found');
		return user;
	}

	async findByEmail(email: string) {
		return this.userModel.findOne({
			where: { email },
			include: [
				{
					model: MediaModel,
					as: 'photoMedia',
					attributes: ['id', 'url'],
				},
			],
		});
	}

	async updateRefreshToken(userId: string, refreshToken: string | null) {
		const user = await this.findById(userId);
		user.hashedRefreshToken = refreshToken;
		return user.save();
	}

	async findAll(roles?: UserRole[]) {
		const { clinicId } = this.tenantContext.require();
		const users = await this.userModel.findAll({
			where: roles ? { role: roles, clinicId } : { clinicId },
			attributes: {
				exclude: ['password', 'hashedRefreshToken'],
			},
			include: [
        {
          model: MediaModel,
          as: 'photoMedia',

          attributes: ['id', 'url'],
        },
      ],
			order: [['createdAt', 'DESC']],
		});

		return users;
	}
}
