import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { DoctorModel } from '../doctors/doctor.model.js';
import { ReviewStatus } from './review-status.enum.js';

export interface ReviewCreationAttributes {
  id?: string;
  authorName: string;
  text: string;
  rating: number;
  reviewDate?: Date | null;
  doctorId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  status: ReviewStatus;
}

@Table({
  tableName: 'reviews',
})
export class ReviewModel extends Model<
  ReviewModel,
  ReviewCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare authorName: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare text: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare rating: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare reviewDate: Date | null;

  @ForeignKey(() => DoctorModel)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    references: {
      model: 'doctors',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  declare doctorId: string | null;

  @BelongsTo(() => DoctorModel)
  declare doctor: DoctorModel | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare sortOrder: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(ReviewStatus)),
    allowNull: false,
    defaultValue: ReviewStatus.PENDING,
  })
  declare status: ReviewStatus;
}