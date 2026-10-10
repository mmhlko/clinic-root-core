import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ClinicTenantContextStore } from '../tenant/tenant-context.store.js';
import { ClinicModel } from '../models/clinic.model.js';
import { ClinicLocationModel } from '../models/clinic-location.model.js';
import { ClinicSocialLinkModel } from '../models/clinic-social-link.model.js';
import { ClinicStatisticModel } from '../models/clinic-statistic.model.js';
import { ClinicFeatureModel } from '../models/clinic-feature.model.js';
import { ServiceDirectionModel } from '../../services/directions/service-direction.model.js';
import { ServiceModel } from '../../services/service.model.js';
import { DoctorModel } from '../../doctors/doctor.model.js';
import { ReviewModel } from '../../reviews/review.model.js';
import { FaqModel } from '../../faq/faq.model.js';
import { ReviewStatus } from '../../reviews/review-status.enum.js';
import { MediaService } from '../../media/media.service.js';
import { PromotionModel } from '../../promotions/promotion.model.js';
import { ClinicImportDto } from './clinic-import.dto.js';
import { DocumentModel } from '../../documents/document.model.js';
import { CLINIC_IMPORT_SCHEMA_VERSION } from './clinic-import-version.js';

const ENTITY_KEYS = [
  'locations', 'socialLinks', 'statistics', 'features', 'directions', 'doctors', 'reviews', 'promotions', 'faq', 'documents',
] as const;
@Injectable()
export class ClinicImportService {
  constructor(
    @InjectModel(ClinicModel) private readonly clinicModel: typeof ClinicModel,
    @InjectModel(ClinicLocationModel) private readonly locationModel: typeof ClinicLocationModel,
    @InjectModel(ClinicSocialLinkModel) private readonly socialLinkModel: typeof ClinicSocialLinkModel,
    @InjectModel(ClinicStatisticModel) private readonly statisticModel: typeof ClinicStatisticModel,
    @InjectModel(ClinicFeatureModel) private readonly featureModel: typeof ClinicFeatureModel,
    @InjectModel(ServiceDirectionModel) private readonly directionModel: typeof ServiceDirectionModel,
    @InjectModel(ServiceModel) private readonly serviceModel: typeof ServiceModel,
    @InjectModel(DoctorModel) private readonly doctorModel: typeof DoctorModel,
    @InjectModel(ReviewModel) private readonly reviewModel: typeof ReviewModel,
    @InjectModel(FaqModel) private readonly faqModel: typeof FaqModel,
    @InjectModel(PromotionModel) private readonly promotionModel: typeof PromotionModel,
    @InjectModel(DocumentModel) private readonly documentModel: typeof DocumentModel,
    @InjectConnection() private readonly sequelize: Sequelize,
    private readonly tenantContext: ClinicTenantContextStore,
    private readonly mediaService: MediaService,
  ) {}

  async preview(dto: ClinicImportDto) {
    this.assertVersion(dto);
    const entities = Object.fromEntries(ENTITY_KEYS.map((key) => [key, dto[key]?.length ?? 0]));
    const nestedServices = (dto.directions ?? []).reduce((sum, direction) => sum + (direction.services?.length ?? 0), 0);
    const changes = { created: {} as Record<string, number>, updated: {} as Record<string, number> };
    const classify = async <T,>(key: string, items: T[], find: (item: T) => Promise<unknown>) => {
      for (const item of items) this.count(await find(item) ? changes.updated : changes.created, key);
    };
    if (Object.keys(dto.clinic).length) changes.updated.clinic = Object.keys(dto.clinic).length;
    await classify('locations', dto.locations ?? [], (item) => this.locationModel.findOne({ where: { name: item.name, address: item.address } }));
    await classify('socialLinks', dto.socialLinks ?? [], (item) => this.socialLinkModel.findOne({ where: { platform: item.platform } }));
    await classify('statistics', dto.statistics ?? [], (item) => this.statisticModel.findOne({ where: { label: item.label } }));
    await classify('features', dto.features ?? [], (item) => this.featureModel.findOne({ where: { title: item.title } }));
    for (const direction of dto.directions ?? []) {
      const currentDirection = await this.directionModel.findOne({ where: { name: direction.name } });
      this.count(currentDirection ? changes.updated : changes.created, 'directions');
      for (const service of direction.services ?? []) {
        const current = currentDirection
          ? await this.serviceModel.findOne({ where: { directionId: currentDirection.id, name: service.name } })
          : null;
        this.count(current ? changes.updated : changes.created, 'services');
      }
    }
    await classify('doctors', dto.doctors ?? [], (item) => this.doctorModel.findOne({ where: { firstName: item.firstName, lastName: item.lastName, specialization: item.specialization } }));
    await classify('reviews', dto.reviews ?? [], (item) => this.reviewModel.findOne({ where: { authorName: item.authorName, text: item.text } }));
    await classify('promotions', dto.promotions ?? [], (item) => this.promotionModel.findOne({ where: { title: item.title } }));
    await classify('faq', dto.faq ?? [], (item) => this.faqModel.findOne({ where: { question: item.question } }));
    await classify('documents', dto.documents ?? [], (item) => this.documentModel.findOne({ where: { title: item.title } }));
    const mediaDownloads = (dto.features ?? []).filter((item) => item.imageUrl).length +
      (dto.doctors ?? []).filter((item) => item.photoUrl).length +
      (dto.promotions ?? []).filter((item) => item.photoUrl).length +
      (dto.documents ?? []).length;
    return {
      schemaVersion: dto.schemaVersion,
      clinicSlug: this.tenantContext.require().clinicSlug,
      entities: { clinic: Object.keys(dto.clinic).length, ...entities, services: nestedServices, mediaDownloads },
      changes,
      policy: 'upsert-keep-missing',
    };
  }

  async import(dto: ClinicImportDto) {
    this.assertVersion(dto);
    const { clinicId, clinicSlug } = this.tenantContext.require();
    const importedFileUrls: string[] = [];
    let mediaDownloaded = 0;
    try {
      return await this.sequelize.transaction(async (transaction) => {
      const result = {
        clinic: 'updated',
        created: {} as Record<string, number>,
        updated: { clinic: Object.keys(dto.clinic).length } as Record<string, number>,
        clinicSlug,
      };
      const clinic = await this.clinicModel.findByPk(clinicId, { transaction });
      if (!clinic) throw new BadRequestException('Clinic does not exist');
      const profile = dto.clinic as Record<string, unknown>;
      for (const [key, value] of Object.entries(profile)) {
        if (value !== undefined) (clinic as unknown as Record<string, unknown>)[key] = value;
      }
      if (profile.licenseDate !== undefined) {
        clinic.licenseDate = profile.licenseDate ? new Date(String(profile.licenseDate)) : null;
      }
      await clinic.save({ transaction });

      for (const item of dto.locations ?? []) {
        const existing = await this.locationModel.findOne({ where: { name: item.name, address: item.address }, transaction });
        const values = { ...item, clinicId };
        if (existing) { await existing.update(values, { transaction }); this.count(result.updated, 'locations'); }
        else { await this.locationModel.create(values, { transaction }); this.count(result.created, 'locations'); }
      }
      for (const item of dto.socialLinks ?? []) {
        const existing = await this.socialLinkModel.findOne({ where: { platform: item.platform }, transaction });
        if (existing) { await existing.update(item, { transaction }); this.count(result.updated, 'socialLinks'); }
        else { await this.socialLinkModel.create({ ...item, clinicId }, { transaction }); this.count(result.created, 'socialLinks'); }
      }
      for (const item of dto.statistics ?? []) {
        const existing = await this.statisticModel.findOne({ where: { label: item.label }, transaction });
        if (existing) { await existing.update(item, { transaction }); this.count(result.updated, 'statistics'); }
        else { await this.statisticModel.create({ ...item, clinicId }, { transaction }); this.count(result.created, 'statistics'); }
      }
      for (const item of dto.features ?? []) {
        const existing = await this.featureModel.findOne({ where: { title: item.title }, transaction });
        const importedImage = item.imageUrl ? await this.mediaService.saveImportedImage(item.imageUrl, transaction) : undefined;
        if (importedImage) { importedFileUrls.push(importedImage.url); mediaDownloaded += 1; }
        const values = {
          ...item,
          ...(item.imageUrl !== undefined ? { imageUrl: importedImage?.url ?? item.imageUrl } : {}),
        };
        if (existing) { await existing.update(values, { transaction }); this.count(result.updated, 'features'); }
        else { await this.featureModel.create({ ...values, clinicId }, { transaction }); this.count(result.created, 'features'); }
      }
      for (const item of dto.directions ?? []) {
        const existing = await this.directionModel.findOne({ where: { name: item.name }, transaction });
        const direction = existing
          ? await existing.update(item, { transaction })
          : await this.directionModel.create({ ...item, clinicId }, { transaction });
        this.count(existing ? result.updated : result.created, 'directions');
        for (const service of item.services ?? []) {
          const serviceRow = await this.serviceModel.findOne({ where: { directionId: direction.id, name: service.name }, transaction });
          if (serviceRow) { await serviceRow.update(service, { transaction }); this.count(result.updated, 'services'); }
          else { await this.serviceModel.create({ ...service, directionId: direction.id, clinicId }, { transaction }); this.count(result.created, 'services'); }
        }
      }
      for (const item of dto.doctors ?? []) {
        const where = { firstName: item.firstName, lastName: item.lastName, specialization: item.specialization };
        const existing = await this.doctorModel.findOne({ where, transaction });
        const importedImage = item.photoUrl ? await this.mediaService.saveImportedImage(item.photoUrl, transaction) : undefined;
        if (importedImage) { importedFileUrls.push(importedImage.url); mediaDownloaded += 1; }
        const { photoUrl: _photoUrl, ...doctorData } = item;
        if (existing) { await existing.update({ ...doctorData, ...(importedImage ? { photoMediaId: importedImage.id } : {}) }, { transaction }); this.count(result.updated, 'doctors'); }
        else { await this.doctorModel.create({ ...doctorData, isActive: item.isActive ?? true, clinicId, photoMediaId: importedImage?.id ?? null }, { transaction }); this.count(result.created, 'doctors'); }
      }
      for (const item of dto.reviews ?? []) {
        const existing = await this.reviewModel.findOne({ where: { authorName: item.authorName, text: item.text }, transaction });
        const { reviewDate, ...reviewData } = item;
        const values = {
          ...reviewData,
          ...(reviewDate !== undefined ? { reviewDate: reviewDate ? new Date(reviewDate) : null } : {}),
        };
        if (existing) { await existing.update(values, { transaction }); this.count(result.updated, 'reviews'); }
        else { await this.reviewModel.create({ ...values, isActive: item.isActive ?? true, clinicId, status: ReviewStatus.PUBLISHED }, { transaction }); this.count(result.created, 'reviews'); }
      }
      for (const item of dto.promotions ?? []) {
        const { photoUrl, directionName, serviceName, validFrom, validTo, ...promotionData } = item;
        let serviceId: string | null | undefined;
        if (serviceName) {
          if (!directionName) throw new BadRequestException(`Укажите направление для услуги акции: ${serviceName}`);
          const direction = await this.directionModel.findOne({ where: { name: directionName }, transaction });
          if (!direction) throw new BadRequestException(`Направление не найдено: ${directionName}`);
          const service = await this.serviceModel.findOne({
            where: { name: serviceName, directionId: direction.id },
            transaction,
          });
          if (!service) throw new BadRequestException(`Promotion service not found: ${serviceName}`);
          serviceId = service.id;
        }
        const importedImage = photoUrl ? await this.mediaService.saveImportedImage(photoUrl, transaction) : undefined;
        if (importedImage) { importedFileUrls.push(importedImage.url); mediaDownloaded += 1; }
        const existing = await this.promotionModel.findOne({ where: { title: item.title }, transaction });
        const values = {
          ...promotionData,
          ...(serviceId ? { serviceId } : {}),
          ...(importedImage ? { photoMediaId: importedImage.id } : {}),
          ...(validFrom !== undefined ? { validFrom: validFrom ? new Date(validFrom) : null } : {}),
          ...(validTo !== undefined ? { validTo: validTo ? new Date(validTo) : null } : {}),
        };
        if (existing) { await existing.update(values, { transaction }); this.count(result.updated, 'promotions'); }
        else { await this.promotionModel.create({ ...values, clinicId, serviceId: serviceId ?? null, photoMediaId: importedImage?.id ?? null }, { transaction }); this.count(result.created, 'promotions'); }
      }
      for (const item of dto.faq ?? []) {
        const existing = await this.faqModel.findOne({ where: { question: item.question }, transaction });
        if (existing) { await existing.update(item, { transaction }); this.count(result.updated, 'faq'); }
        else { await this.faqModel.create({ ...item, clinicId }, { transaction }); this.count(result.created, 'faq'); }
      }
      for (const item of dto.documents ?? []) {
        const importedFile = await this.mediaService.saveImportedDocument(item.sourceUrl, transaction);
        importedFileUrls.push(importedFile.url);
        mediaDownloaded += 1;
        const existing = await this.documentModel.findOne({ where: { title: item.title }, transaction });
        const values = {
          title: item.title,
          description: item.description,
          fileUrl: importedFile.url,
          fileName: item.fileName ?? item.title,
          fileType: importedFile.fileType,
          sortOrder: item.sortOrder,
          isActive: item.isActive,
        };
        if (existing) { await existing.update(values, { transaction }); this.count(result.updated, 'documents'); }
        else { await this.documentModel.create({ ...values, clinicId }, { transaction }); this.count(result.created, 'documents'); }
      }
      return { ...result, mediaDownloaded };
      });
    } catch (error) {
      for (const url of importedFileUrls) this.mediaService.removeImportedFileAfterRollback(url);
      throw error;
    }
  }

  private assertVersion(dto: ClinicImportDto) {
    if (dto.schemaVersion !== CLINIC_IMPORT_SCHEMA_VERSION) throw new BadRequestException(`Unsupported clinic import schema version: ${dto.schemaVersion}`);
    if (!dto.clinic || Object.keys(dto.clinic).length === 0) throw new BadRequestException('Import must contain at least one clinic field');
  }

  private count(bucket: Record<string, number>, key: string) {
    bucket[key] = (bucket[key] ?? 0) + 1;
  }
}
