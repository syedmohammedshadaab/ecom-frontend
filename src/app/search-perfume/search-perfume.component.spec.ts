import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchPerfumeComponent } from './search-perfume.component';

describe('SearchPerfumeComponent', () => {
  let component: SearchPerfumeComponent;
  let fixture: ComponentFixture<SearchPerfumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchPerfumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchPerfumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
