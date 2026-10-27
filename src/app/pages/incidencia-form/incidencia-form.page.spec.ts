import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncidenciaFormPage } from './incidencia-form.page';

describe('IncidenciaFormPage', () => {
  let component: IncidenciaFormPage;
  let fixture: ComponentFixture<IncidenciaFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidenciaFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
