export enum StoredLicenseStatus {
  Active = 0,
  Expired = 1,
  Revoked = 2,
  Suspended = 3
}

export enum LicenseType {
  Perpetual = 0,
  Fallback = 1,
  Timed = 2,
  Subscription = 3,
  Tiered = 4,
  Freemium = 5
}

export enum SignatureFormat {
  JWS = 'JWS',
  JSF = 'JSF'
}

export interface FeatureDefinition {
  id: string;
  name: string;
  dataType: 'string' | 'int' | 'bool';
  description: string;
}

export interface LicenseFeature {
  id: string;
  value: string;
  feature: FeatureDefinition;
}

export interface License {
  id: number;
  productId: string;
  productName: string;
  productFamilyId: string | null;
  productFamilyName: string;
  type: LicenseType;
  signatureFormat: SignatureFormat;
  status: StoredLicenseStatus;
  createdAt: Date;
  expiresAt: Date | null;
  fileSize: number;
  tier: string;
  features: LicenseFeature[];
}

export interface SearchFiltersDto {
  searchText?: string;
  productId?: string;
  productFamilyId?: string;
  status?: StoredLicenseStatus | null;
  licenseType?: LicenseType | null;
  signatureFormat?: SignatureFormat | null;
  createdAfter?: Date | null;
  createdBefore?: Date | null;
}

export interface ProductFamily {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  familyId?: string;
  familyName?: string;
}

export interface CreateLicenseCommand {
  productId: string;
  productName: string;
  productFamilyId?: string | null;
  productFamilyName: string;
  type: LicenseType;
  status: StoredLicenseStatus;
  signatureFormat: SignatureFormat;
  tier: string;
  expiresAt?: Date | null;
  features: Array<{ featureId: string; value: string }>;
}
