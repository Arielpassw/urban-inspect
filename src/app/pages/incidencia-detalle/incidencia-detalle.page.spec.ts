import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncidenciaDetallePage } from './incidencia-detalle.page';

describe('IncidenciaDetallePage', () => {
  let component: IncidenciaDetallePage;
  let fixture: ComponentFixture<IncidenciaDetallePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidenciaDetallePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
