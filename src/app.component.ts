import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NpkReadingsComponent } from './components/npk-readings/npk-readings.component';
import { TankMonitorComponent } from './components/tank-monitor/tank-monitor.component';
import { FertilizerGeneratorComponent } from './components/fertilizer-generator/fertilizer-generator.component';
import { SoilExplorerComponent } from './components/soil-explorer/soil-explorer.component';
import { CropGuideComponent } from './components/crop-guide/crop-guide.component';
import { ReferencesComponent } from './components/references/references.component';
import { MotorControlComponent } from './components/motor-control/motor-control.component';

type Section = 'npk' | 'tank' | 'generator' | 'soils' | 'crops' | 'references' | 'motor';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NpkReadingsComponent,
    TankMonitorComponent,
    FertilizerGeneratorComponent,
    SoilExplorerComponent,
    CropGuideComponent,
    ReferencesComponent,
    MotorControlComponent
  ]
})
export class AppComponent {
  activeSection = signal<Section>('npk');

  sections: { id: Section, label: string, icon: string }[] = [
    { id: 'npk', label: 'NPK Readings', icon: '🧪' },
    { id: 'tank', label: 'Tank Monitor', icon: '🌡️' },
    { id: 'motor', label: 'Motor Control', icon: '⚡' },
    { id: 'generator', label: 'Fertilizer Gen', icon: '🌿' },
    { id: 'soils', label: 'Soil Explorer', icon: '🌱' },
    { id: 'crops', label: 'Crop Guide', icon: '🌾' },
    { id: 'references', label: 'References', icon: '📚' }
  ];

  showSection(sectionId: Section): void {
    this.activeSection.set(sectionId);
  }
}