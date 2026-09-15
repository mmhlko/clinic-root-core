import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserModel } from './user.model.js';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto.js';
import { UserRole } from './user-role.enum.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(UserModel)
		private userModel: typeof UserModel,
	) { }

	async create(dto: CreateUserDto) {

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
		};
	}

	async update(id: string, dto: UpdateUserDto) {
		const user = await this.findById(id);

		if(dto.email && dto.email !== user.email) {
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
