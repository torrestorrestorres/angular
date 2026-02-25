import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime } from 'rxjs/operators';
import { LicenseService } from '../../services/license.service';
import { License, LicenseType, StoredLicenseStatus, SignatureFormat, SearchFiltersDto } from '../../models/license.model';

// Mapping objects for display
const STATUS_MAP: Record<StoredLicenseStatus, { label: string; cssClass: string }> = {
  [StoredLicenseStatus.Active]: { label: 'Aktiv', cssClass: 'active' },
  [StoredLicenseStatus.Expired]: { label: 'Abgelaufen', cssClass: 'expired' },
  [StoredLicenseStatus.Revoked]: { label: 'Widerrufen', cssClass: 'revoked' },
  [StoredLicenseStatus.Suspended]: { label: 'Ausgesetzt', cssClass: 'suspended' }
};

const TYPE_MAP: Record<LicenseType, string> = {
  [LicenseType.Perpetual]: 'Unbefristet',
  [LicenseType.Fallback]: 'Fallback',
  [LicenseType.Timed]: 'Zeitlich limitiert',
  [LicenseType.Subscription]: 'Abonnement',
  [LicenseType.Tiered]: 'Gestaffelt',
  [LicenseType.Freemium]: 'Freemium'
};

const SIGNATURE_FORMAT_MAP: Record<SignatureFormat, string> = {
  [SignatureFormat.JWS]: 'JSON Web Signature (JWS)',
  [SignatureFormat.JSF]: 'JSON Signature Format (JSF)'
};

@Component({
  selector: 'app-license-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './license-search.component.html',
  styleUrl: './license-search.component.scss'
})
export class LicenseSearchComponent implements OnInit {
  searchControl = new FormControl('');
  allLicenses: License[] = [];
  filteredLicenses: License[] = [];
  lastSearchResults: License[] = [];
  isLoading = false;
  expandedFeatures = new Map<number, boolean>();
  showFilters = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50, 100];
  paginatedLicenses: License[] = [];

  // Status Filter (numeric enum based)
  activeFilter: StoredLicenseStatus | null = null;

  // Dropdown data
  availableProducts: Array<{ id: string; name: string }> = [];
  availableProductFamilies: Array<{ id: string; name: string }> = [];

  // Advanced Filter Controls
  selectedProductId: string | null = null;
  selectedProductFamilyId: string | null = null;
  selectedLicenseType: LicenseType | null = null;
  selectedSignatureFormat: SignatureFormat | null = null;
  createdDateFrom: string | null = null;
  createdDateTo: string | null = null;
  selectedFeatures: string[] = [];
  allFeatures: string[] = [];

  // Quick Expiry Filters (convert to numeric status filters)
  quickFilters = {
    expiring7Days: false,
    expiring30Days: false,
    expired: false
  };

  // Expose enums to template
  StatusEnum = StoredLicenseStatus;
  TypeEnum = LicenseType;
  SignatureFormatEnum = SignatureFormat;
  STATUS_MAP = STATUS_MAP;
  TYPE_MAP = TYPE_MAP;

  constructor(private licenseService: LicenseService) {}

  ngOnInit(): void {
    // Load all licenses
    this.licenseService.getLicenses().subscribe((licenses: License[]) => {
      this.allLicenses = licenses;
      this.filteredLicenses = licenses;
      this.lastSearchResults = licenses;
      // Extract all features for filter
      this.allFeatures = this.licenseService.getAllAvailableFeatures();
    });

    // Load available products and families
    this.licenseService.getAvailableProducts().subscribe(products => {
      this.availableProducts = products;
    });

    this.licenseService.getAvailableProductFamilies().subscribe(families => {
      this.availableProductFamilies = families;
    });

    // Live search with debounce
    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((term: string | null) => {
        this.performSearch(term || '');
      });
  }

  private performSearch(searchText: string): void {
    this.isLoading = true;

    const filters: SearchFiltersDto = {
      searchText: searchText || undefined
    };

    this.licenseService.searchLicenses(filters).subscribe((results: License[]) => {
      this.lastSearchResults = results;
      this.applyAllFilters();
      this.isLoading = false;
    });
  }

  /**
   * Filter by status category button (numeric)
   */
  filterByStatus(status: StoredLicenseStatus | null): void {
    this.activeFilter = status;
    this.applyAllFilters();
  }

  /**
   * Master filter method: applies all active filters in sequence
   */
  private applyAllFilters(): void {
    let results = [...this.lastSearchResults];

    // 1. Filter by status (numeric)
    if (this.activeFilter !== null) {
      results = results.filter(l => l.status === this.activeFilter);
    }

    // 2. Filter by license type
    if (this.selectedLicenseType !== null) {
      results = results.filter(l => l.type === this.selectedLicenseType);
    }

    // 3. Filter by signature format
    if (this.selectedSignatureFormat !== null) {
      results = results.filter(l => l.signatureFormat === this.selectedSignatureFormat);
    }

    // 4. Filter by product ID
    if (this.selectedProductId) {
      results = results.filter(l => l.productId === this.selectedProductId);
    }

    // 5. Filter by product family ID
    if (this.selectedProductFamilyId) {
      results = results.filter(l => l.productFamilyId === this.selectedProductFamilyId);
    }

    // 6. Filter by created date range (createdAt)
    if (this.createdDateFrom) {
      const from = new Date(this.createdDateFrom);
      results = results.filter(l => new Date(l.createdAt) >= from);
    }
    if (this.createdDateTo) {
      const to = new Date(this.createdDateTo);
      results = results.filter(l => new Date(l.createdAt) <= to);
    }

    // 7. Filter by expiry date range (expiresAt) - keep for quick filters
    if (this.quickFilters.expiring7Days) {
      const in7Days = new Date();
      in7Days.setDate(in7Days.getDate() + 7);
      results = results.filter(l => {
        if (!l.expiresAt) return false; // Perpetual licenses don't expire
        const expiry = new Date(l.expiresAt);
        return expiry > new Date() && expiry <= in7Days;
      });
    }

    if (this.quickFilters.expiring30Days) {
      const in30Days = new Date();
      in30Days.setDate(in30Days.getDate() + 30);
      results = results.filter(l => {
        if (!l.expiresAt) return false;
        const expiry = new Date(l.expiresAt);
        return expiry > new Date() && expiry <= in30Days;
      });
    }

    if (this.quickFilters.expired) {
      results = results.filter(l => {
        if (!l.expiresAt) return false; // Perpetual licenses don't expire
        return new Date(l.expiresAt) < new Date();
      });
    }

    // 8. Filter by features (AND logic: must have ALL selected features)
    if (this.selectedFeatures.length > 0) {
      results = results.filter(l => {
        return this.selectedFeatures.every(selectedFeatureName =>
          l.features.some(f => f.feature.name === selectedFeatureName)
        );
      });
    }

    this.filteredLicenses = results;
    this.currentPage = 1; // Reset to first page when filters change
    this.paginateLicenses();
  }

  // ========== Filter Toggle Methods ==========
  toggleFeature(featureName: string): void {
    const idx = this.selectedFeatures.indexOf(featureName);
    if (idx > -1) {
      this.selectedFeatures.splice(idx, 1);
    } else {
      this.selectedFeatures.push(featureName);
    }
    this.applyAllFilters();
  }

  toggleQuickFilter(filterType: 'expiring7Days' | 'expiring30Days' | 'expired'): void {
    this.quickFilters[filterType] = !this.quickFilters[filterType];
    this.applyAllFilters();
  }

  onProductFilterChange(): void {
    this.applyAllFilters();
  }

  onProductFamilyFilterChange(): void {
    this.applyAllFilters();
  }

  onTypeFilterChange(): void {
    this.applyAllFilters();
  }

  onSignatureFormatFilterChange(): void {
    this.applyAllFilters();
  }

  onDateFilterChange(): void {
    this.applyAllFilters();
  }

  /**
   * Clear all filters and reset to initial state
   */
  clearFilters(): void {
    this.searchControl.reset();
    this.activeFilter = null;
    this.selectedProductId = null;
    this.selectedProductFamilyId = null;
    this.selectedLicenseType = null;
    this.selectedSignatureFormat = null;
    this.createdDateFrom = null;
    this.createdDateTo = null;
    this.selectedFeatures = [];
    this.quickFilters = { expiring7Days: false, expiring30Days: false, expired: false };
    this.lastSearchResults = this.allLicenses;
    this.filteredLicenses = this.allLicenses;
  }

  // ========== Helper Methods for Display ==========

  /**
   * Get status label (German) from numeric status enum
   */
  getStatusLabel(status: StoredLicenseStatus): string {
    return STATUS_MAP[status]?.label || 'Unbekannt';
  }

  /**
   * Get CSS class name for status badge
   */
  getStatusCssClass(status: StoredLicenseStatus): string {
    return STATUS_MAP[status]?.cssClass || 'unknown';
  }

  /**
   * Get license type label (German)
   */
  getTypeLabel(type: LicenseType): string {
    return TYPE_MAP[type] || 'Unbekannt';
  }

  /**
   * Get signature format label
   */
  getSignatureFormatLabel(format: SignatureFormat): string {
    return SIGNATURE_FORMAT_MAP[format] || format;
  }

  /**
   * Format date to German format
   */
  formatDate(date: Date | null): string {
    if (!date) return 'Unbefristet';
    return new Date(date).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Toggle feature details table for a license
   */
  toggleFeatures(licenseId: number): void {
    const current = this.expandedFeatures.get(licenseId) ?? false;
    this.expandedFeatures.set(licenseId, !current);
  }

  /**
   * Check if feature table is expanded for a license
   */
  isFeaturesExpanded(licenseId: number): boolean {
    return this.expandedFeatures.get(licenseId) ?? false;
  }

  /**
   * Check if a feature is selected in the filter
   */
  isFeatureSelected(featureName: string): boolean {
    return this.selectedFeatures.includes(featureName);
  }

  /**
   * Get result count for a specific status filter
   */
  getResultCount(status: StoredLicenseStatus | null): number {
    if (status === null) {
      return this.filteredLicenses.length;
    }
    return this.filteredLicenses.filter(l => l.status === status).length;
  }

  // ========== PAGINATION METHODS ==========

  /**
   * Calculate paginated results and update paginatedLicenses
   */
  paginateLicenses(): void {
    const startIdx = (this.currentPage - 1) * this.pageSize;
    const endIdx = startIdx + this.pageSize;
    this.paginatedLicenses = this.filteredLicenses.slice(startIdx, endIdx);
  }

  /**
   * Get total number of pages
   */
  getTotalPages(): number {
    return Math.ceil(this.filteredLicenses.length / this.pageSize);
  }

  /**
   * Check if can go to next page
   */
  canGoNext(): boolean {
    return this.currentPage < this.getTotalPages();
  }

  /**
   * Check if can go to previous page
   */
  canGoPrevious(): boolean {
    return this.currentPage > 1;
  }

  /**
   * Go to next page
   */
  goToNextPage(): void {
    if (this.canGoNext()) {
      this.currentPage++;
      this.paginateLicenses();
    }
  }

  /**
   * Go to previous page
   */
  goToPreviousPage(): void {
    if (this.canGoPrevious()) {
      this.currentPage--;
      this.paginateLicenses();
    }
  }

  /**
   * Go to specific page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.paginateLicenses();
    }
  }

  /**
   * Change page size and reset to first page
   */
  setPageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.paginateLicenses();
  }

  /**
   * Generate array of page numbers for template iteration
   */
  getPageNumbers(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }
}
