import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { LicenseService } from '../../services/license.service';
import { ProductService } from '../../services/product.service';
import { Product, ProductFamily, FeatureDefinition, LicenseType, StoredLicenseStatus, SignatureFormat, CreateLicenseCommand } from '../../models/license.model';

@Component({
  selector: 'app-create-license',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatExpansionModule
  ],
  templateUrl: './create-license.component.html',
  styleUrls: ['./create-license.component.scss']
})
export class CreateLicenseComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  products: Product[] = [];
  productFamilies: ProductFamily[] = [];
  availableFeatures: FeatureDefinition[] = [];

  licenseTypes = Object.entries(LicenseType)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({ label: key, value }));

  licenseStatuses = Object.entries(StoredLicenseStatus)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({ label: key, value }));

  signatureFormats = Object.values(SignatureFormat);

  tiers = ['Basic', 'Professional', 'Enterprise', 'Premium', 'Individual'];

  constructor(
    private fb: FormBuilder,
    private licenseService: LicenseService,
    private productService: ProductService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadProductFamilies();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      productId: ['', Validators.required],
      type: [LicenseType.Subscription, Validators.required],
      status: [StoredLicenseStatus.Active, Validators.required],
      signatureFormat: [SignatureFormat.JWS, Validators.required],
      tier: ['Professional', Validators.required],
      expiresAt: [null],
      features: this.fb.array([])
    });

    // Listen to product changes to load features
    this.form.get('productId')?.valueChanges.subscribe((productId: string) => {
      if (productId) {
        this.loadFeaturesForProduct(productId);
        this.updateFeatureFormArray();
      }
    });

    // Listen to license type changes to reset expiry if perpetual
    this.form.get('type')?.valueChanges.subscribe((type: LicenseType) => {
      const expiresAtControl = this.form.get('expiresAt');
      if (type === LicenseType.Perpetual) {
        expiresAtControl?.setValue(null);
        expiresAtControl?.disable();
      } else {
        expiresAtControl?.enable();
      }
    });
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe(
      (products: Product[]) => {
        this.products = products;
      },
      (error) => {
        this.errorMessage = 'Failed to load products';
        console.error(error);
      }
    );
  }

  private loadProductFamilies(): void {
    this.productService.getProductFamilies().subscribe(
      (families: ProductFamily[]) => {
        this.productFamilies = families;
      },
      (error) => {
        this.errorMessage = 'Failed to load product families';
        console.error(error);
      }
    );
  }

  private loadFeaturesForProduct(productId: string): void {
    this.productService.getFeaturesForProduct(productId).subscribe(
      (features: FeatureDefinition[]) => {
        this.availableFeatures = features;
      },
      (error) => {
        this.errorMessage = 'Failed to load features for product';
        console.error(error);
      }
    );
  }

  private updateFeatureFormArray(): void {
    const featuresArray = this.form.get('features') as FormArray;
    featuresArray.clear();

    this.availableFeatures.forEach((feature) => {
      featuresArray.push(
        this.fb.group({
          featureId: [feature.id, Validators.required],
          featureName: [feature.name],
          value: ['', Validators.required]
        })
      );
    });
  }

  get featureControls() {
    return (this.form.get('features') as FormArray).controls;
  }

  getSelectedProduct(): Product | undefined {
    const productId = this.form.get('productId')?.value;
    return this.products.find(p => p.id === productId);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const selectedProduct = this.getSelectedProduct();
    if (!selectedProduct) {
      this.errorMessage = 'Product not found';
      this.isLoading = false;
      return;
    }

    const command: CreateLicenseCommand = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productFamilyId: selectedProduct.familyId || null,
      productFamilyName: selectedProduct.familyName || '',
      type: this.form.get('type')?.value,
      status: this.form.get('status')?.value,
      signatureFormat: this.form.get('signatureFormat')?.value,
      tier: this.form.get('tier')?.value,
      expiresAt: this.form.get('expiresAt')?.value || null,
      features: (this.form.get('features') as FormArray).value.map((f: any) => ({
        featureId: f.featureId,
        value: f.value
      }))
    };

    this.licenseService.createLicense(command).subscribe(
      (license) => {
        this.isLoading = false;
        this.successMessage = `License created successfully! License ID: ${license.id}`;
        
        // Reset form
        this.form.reset({ type: LicenseType.Subscription, status: StoredLicenseStatus.Active, signatureFormat: SignatureFormat.JWS, tier: 'Professional' });
        this.availableFeatures = [];
        (this.form.get('features') as FormArray).clear();

        // Navigate back to search after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/search']);
        }, 2000);
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to create license: ' + (error?.message || 'Unknown error');
        console.error(error);
      }
    );
  }

  onCancel(): void {
    this.router.navigate(['/search']);
  }

  getFeaturePlaceholder(feature: FeatureDefinition): string {
    switch (feature.dataType) {
      case 'int':
        return 'Enter a number';
      case 'bool':
        return 'true or false';
      case 'string':
        return 'Enter text';
      default:
        return 'Enter value';
    }
  }
}
