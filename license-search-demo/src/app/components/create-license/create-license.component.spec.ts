import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLicenseComponent } from './create-license.component';

describe('CreateLicenseComponent', () => {
  let component: CreateLicenseComponent;
  let fixture: ComponentFixture<CreateLicenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateLicenseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateLicenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
