import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { License, LicenseType, StoredLicenseStatus, SignatureFormat, SearchFiltersDto } from '../models/license.model';

@Injectable({
  providedIn: 'root'
})
export class LicenseService {
  private readonly PRODUCT_IDS = {
    autocad: '550e8400-e29b-41d4-a716-446655440000',
    msOffice: '550e8400-e29b-41d4-a716-446655440001',
    jetbrains: '550e8400-e29b-41d4-a716-446655440002',
    saasApp: '550e8400-e29b-41d4-a716-446655440003',
    infodas: '550e8400-e29b-41d4-a716-446655440004',
    wordpress: '550e8400-e29b-41d4-a716-446655440005',
    slack: '550e8400-e29b-41d4-a716-446655440006',
    github: '550e8400-e29b-41d4-a716-446655440007',
    jira: '550e8400-e29b-41d4-a716-446655440008',
    confluence: '550e8400-e29b-41d4-a716-446655440009',
    figma: '550e8400-e29b-41d4-a716-446655440010',
    notion: '550e8400-e29b-41d4-a716-446655440011'
  };

  private readonly PRODUCT_FAMILY_IDS = {
    microsoft: '550e8400-e29b-41d4-a716-446655550000',
    adobe: '550e8400-e29b-41d4-a716-446655550001',
    jetbrainsTools: '550e8400-e29b-41d4-a716-446655550002',
    atlassian: '550e8400-e29b-41d4-a716-446655550003'
  };

  private licenses: License[] = [];

  constructor() {
    this.licenses = this.generateMockLicenses();
  }

  private generateMockLicenses(): License[] {
    const licenses: License[] = [];
      const productNames = ['AutoCAD 2025', 'Microsoft 365', 'JetBrains IntelliJ IDEA', 'SaaS Application', 
                          'Infodas ERP System', 'WordPress Pro Plugins', 'Slack Enterprise', 'GitHub Copilot',
                          'Jira Cloud', 'Confluence Cloud', 'Figma Team', 'Notion Business'];
    const tiers = ['Basic', 'Professional', 'Enterprise', 'Premium', 'Individual'];
    const features = [
      { name: 'Max Users', dataType: 'int', description: 'Maximale Benutzeranzahl' },
      { name: 'Advanced Features', dataType: 'bool', description: 'Erweiterte Features freigegeben' },
      { name: 'API Access', dataType: 'bool', description: 'API-Zugriff verfügbar' },
      { name: 'Support Level', dataType: 'string', description: 'Art des Supports' },
      { name: 'Storage GB', dataType: 'int', description: 'Speicher in GB' },
      { name: 'Custom Branding', dataType: 'bool', description: 'Benutzerdefiniertes Branding' },
      { name: 'SSO', dataType: 'bool', description: 'Single Sign-On aktiviert' },
      { name: 'Audit Logs', dataType: 'bool', description: 'Detaillierte Audit-Protokolle' }
    ];

    for (let i = 1; i <= 50; i++) {
      const productIdx = i % productNames.length;
      const productName = productNames[productIdx];
      const createdDate = new Date(2023 + Math.floor(i / 25), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      
      const statusOptions = [StoredLicenseStatus.Active, StoredLicenseStatus.Expired, StoredLicenseStatus.Revoked, StoredLicenseStatus.Suspended];
      const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      const typeOptions = [LicenseType.Perpetual, LicenseType.Subscription, LicenseType.Timed, LicenseType.Tiered, LicenseType.Freemium];
      const type = typeOptions[Math.floor(Math.random() * typeOptions.length)];

      let expiresAt: Date | null = null;
      if (type !== LicenseType.Perpetual) {
        const futureDate = new Date(createdDate);
        futureDate.setFullYear(futureDate.getFullYear() + 1 + Math.floor(Math.random() * 3));
        expiresAt = futureDate;
      }

      const selectedFeatures = [];
      for (let f = 0; f < Math.floor(Math.random() * 4) + 2; f++) {
        selectedFeatures.push(features[Math.floor(Math.random() * features.length)]);
      }

      licenses.push({
        id: i,
        productId: Object.values(this.PRODUCT_IDS)[i % Object.values(this.PRODUCT_IDS).length],
        productName: productName,
        productFamilyId: i % 3 === 0 ? Object.values(this.PRODUCT_FAMILY_IDS)[i % Object.values(this.PRODUCT_FAMILY_IDS).length] : null,
        productFamilyName: i % 3 === 0 ? Object.keys(this.PRODUCT_FAMILY_IDS)[i % Object.keys(this.PRODUCT_FAMILY_IDS).length] : '',
        type: type,
        signatureFormat: i % 2 === 0 ? SignatureFormat.JWS : SignatureFormat.JSF,
        status: status,
        createdAt: createdDate,
        expiresAt: expiresAt,
        fileSize: Math.floor(Math.random() * 8000) + 256,
        tier: tiers[Math.floor(Math.random() * tiers.length)],
        features: selectedFeatures.map((feat, idx) => ({
          id: `${i}-${idx}`,
          value: feat.dataType === 'bool' ? (Math.random() > 0.5 ? 'true' : 'false') :
                  feat.dataType === 'int' ? (Math.floor(Math.random() * 100) + 1).toString() :
                  ['Basic', 'Professional', 'Enterprise'][Math.floor(Math.random() * 3)],
          feature: {
            id: `f-${i}-${idx}`,
            name: feat.name,
            dataType: feat.dataType as 'bool' | 'int' | 'string',
            description: feat.description
          }
        }))
      });
    }

    return licenses;
  }


  getLicenses(): Observable<License[]> {
    return of([...this.licenses]);
  }

  searchLicenses(filters: SearchFiltersDto): Observable<License[]> {
    let results = [...this.licenses];

    if (filters.searchText) {
      const term = filters.searchText.toLowerCase();
      results = results.filter(license => {
        const licenseId = license.id.toString().toLowerCase();
        const productName = license.productName.toLowerCase();
        const productFamily = license.productFamilyName?.toLowerCase() || '';
        const tier = license.tier.toLowerCase();

        const matchesBasic =
          licenseId.includes(term) ||
          productName.includes(term) ||
          productFamily.includes(term) ||
          tier.includes(term);

        const matchesFeatures = license.features.some(f =>
          f.feature.name.toLowerCase().includes(term) ||
          f.feature.description.toLowerCase().includes(term) ||
          f.value.toLowerCase().includes(term)
        );

        return matchesBasic || matchesFeatures;
      });
    }

    // 2. Filter by product ID
    if (filters.productId) {
      results = results.filter(l => l.productId === filters.productId);
    }

    // 3. Filter by product family ID
    if (filters.productFamilyId) {
      results = results.filter(l => l.productFamilyId === filters.productFamilyId);
    }

    // 4. Filter by status (numeric enum)
    if (filters.status !== undefined && filters.status !== null) {
      results = results.filter(l => l.status === filters.status);
    }

    // 5. Filter by license type
    if (filters.licenseType !== undefined && filters.licenseType !== null) {
      results = results.filter(l => l.type === filters.licenseType);
    }

    // 6. Filter by signature format
    if (filters.signatureFormat) {
      results = results.filter(l => l.signatureFormat === filters.signatureFormat);
    }

    // 7. Filter by created date range
    if (filters.createdAfter) {
      const fromDate = new Date(filters.createdAfter);
      results = results.filter(l => new Date(l.createdAt) >= fromDate);
    }

    if (filters.createdBefore) {
      const toDate = new Date(filters.createdBefore);
      results = results.filter(l => new Date(l.createdAt) <= toDate);
    }

    return of(results);
  }

  getAvailableProducts(): Observable<Array<{ id: string; name: string }>> {
    const products = Array.from(new Map(
      this.licenses.map(l => [l.productId, { id: l.productId, name: l.productName }])
    ).values());
    return of(products);
  }

  getAvailableProductFamilies(): Observable<Array<{ id: string; name: string }>> {
    const families = Array.from(new Map(
      this.licenses
        .filter(l => l.productFamilyId)
        .map(l => [l.productFamilyId, { id: l.productFamilyId!, name: l.productFamilyName }])
    ).values());
    return of(families);
  }

  getAllAvailableFeatures(): string[] {
    const features = new Set<string>();
    this.licenses.forEach(license => {
      license.features.forEach(feature => {
        features.add(feature.feature.name);
      });
    });
    return Array.from(features).sort();
  }
}
