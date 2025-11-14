import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfumedetailsComponent } from './perfumedetails.component';

describe('PerfumedetailsComponent', () => {
  let component: PerfumedetailsComponent;
  let fixture: ComponentFixture<PerfumedetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerfumedetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfumedetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
