import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployerappComponent } from './employerapp.component';

describe('EmployerappComponent', () => {
  let component: EmployerappComponent;
  let fixture: ComponentFixture<EmployerappComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployerappComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployerappComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
