import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript';

export interface DocumentCreationAttributes {
  id?: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileName: string;
  fileType: string;
  sortOrder?: number;
  isActive?: boolean;
}

@Table({
  tableName: 'documents',
})
export class DocumentModel extends Model<
  DocumentModel,
  DocumentCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  // Название документа на сайте
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  // Описание документа
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  // URL загруженного файла
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare fileUrl: string;

  // Оригинальное имя файла
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare fileName: string;

  // Расширение файла: pdf, doc, docx
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare fileType: string;

  // Порядок отображения
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare sortOrder: number;

  // Показывать ли документ на сайте
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare updatedAt: Date;
}