import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserModel } from './user.model.js';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto.js';
import { UserRole } from './user-role.enum.js';
import * as bcrypt from 'bcrypt';
import { ClinicLocationModel } from '../clinic/clinic-location.model.js';

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(UserModel)
		private userModel: typeof UserModel,

		@InjectModel(ClinicLocationModel)
		private readonly clinicLocationModel:
			typeof ClinicLocationModel,
	) { }

	async create(dto: CreateUserDto) {

		if (
			dto.role === UserRole.MANAGER &&
			!dto.locationId
		) {
			throw new BadRequestException(
				'Manager must have a clinic location',
			);
		}

		if (
			dto.role !== UserRole.MANAGER &&
			dto.locationId
		) {
			throw new BadRequestException(
				'Only manager can have a clinic location',
			);
		}

		let locationId: string | null = null;

		if (dto.role === UserRole.MANAGER) {
			const location =
				await this.clinicLocationModel.findOne({
					where: {
						id: dto.locationId,
						isActive: true,
					},
				});

			if (!location) {
				throw new NotFoundException(
					'Clinic location not found',
				);
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

		const user = await this.userModel.create({
			firstName: dto.firstName,
			lastName: dto.lastName,
			email: dto.email,
			password: hashedPassword,
			role: dto.role ?? UserRole.MANAGER,
			locationId,
		});

		return {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			role: user.role,
			avatarUrl: user.avatarUrl,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			locationId: user.locationId,
		};
	}

	async update(id: string, dto: UpdateUserDto) {
		const user = await this.findById(id);

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
		}

		await user.save();

		return {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			role: user.role,
			avatarUrl: user.avatarUrl,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			locationId: user.locationId,
			isActive: user.isActive,
		};
	}

	async setActive(id: string, isActive: boolean) {
		const user = await this.findById(id);

		user.isActive = isActive;

		await user.save();

		return {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			role: user.role,
			avatarUrl: user.avatarUrl,
			isActive: user.isActive,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	}

	async findById(id: string) {
		const user = await this.userModel.findByPk(id);
		if (!user) throw new NotFoundException('User not found');
		return user;
	}

	async findUserById(id: string) {
		const user = await this.userModel.findByPk(id, {
			attributes: {
				exclude: ['password', 'hashedRefreshToken']
			}
		});
		if (!user) throw new NotFoundException('User not found');
		return user;
	}

	async findByEmail(email: string) {
		return this.userModel.findOne({ where: { email } });
	}

	async updateRefreshToken(userId: string, refreshToken: string | null) {
		const user = await this.findById(userId);
		user.hashedRefreshToken = refreshToken;
		return user.save();
	}

	async findAll() {
		const users = await this.userModel.findAll({
			attributes: {
				exclude: ['password', 'hashedRefreshToken'],
			},
			order: [['createdAt', 'DESC']],
		});

		return users;
	}
}
