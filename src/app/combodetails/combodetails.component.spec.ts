import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombodetailsComponent } from './combodetails.component';

describe('CombodetailsComponent', () => {
  let component: CombodetailsComponent;
  let fixture: ComponentFixture<CombodetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CombodetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CombodetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
