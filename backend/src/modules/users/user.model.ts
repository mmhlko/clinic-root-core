import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';

import { UserRole } from './user-role.enum.js';
import { CreateUserDto } from './dto/users.dto.js';
import { ClinicLocationModel } from '../clinic/clinic-location.model.js';

export interface UserCreationAttributes {
  id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: UserRole;
  password: string;
  hashedRefreshToken?: string | null;
  avatarUrl?: string | null;
  locationId?: string | null;
}

@Table({ tableName: 'users' })
export class UserModel extends Model<UserModel, UserCreationAttributes> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
    defaultValue: UserRole.MANAGER,
  })
  declare role: UserRole;

  @ForeignKey(() => ClinicLocationModel)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    references: {
      model: 'clinic_locations',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  declare locationId: string | null;

  @BelongsTo(() => ClinicLocationModel)
  declare location: ClinicLocationModel | null;

  @Column({
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare hashedRefreshToken: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare avatarUrl: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: boolean;
}