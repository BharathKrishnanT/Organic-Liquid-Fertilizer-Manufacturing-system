import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Esp32Service, NpkReadings } from '../../services/esp32.service';
import { DataService } from '../../services/data.service';
import { finalize } from 'rxjs/operators';

interface Deficiency {
  nutrient: 'N' | 'P' | 'K';
  level: 'Very Deficient' | 'Deficient';
  weight: number;
}

interface RecipeItem {
  name: string;
  amount: number;
}

@Component({
  selector: 'app-fertilizer-generator',
  templateUrl: './fertilizer-generator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class FertilizerGeneratorComponent {
  private esp32Service = inject(Esp32Service);
  private dataService = inject(DataService);
  
  organicsData = this.dataService.getData().organics;

  readings = signal<NpkReadings | null>(null);
  isLoading = signal(false);
  statusMessage = signal('Get soil readings to begin.');
  quantity = signal<number>(10);
  unit = signal<'kg' | 'L'>('kg');
  
  deficiencies = computed<Deficiency[]>(() => {
    const r = this.readings();
    if (!r) return [];

    const defs: Deficiency[] = [];
    if (r.n < 50) defs.push({ nutrient: 'N', level: 'Very Deficient', weight: 2 });
    else if (r.n < 100) defs.push({ nutrient: 'N', level: 'Deficient', weight: 1 });

    if (r.p < 50) defs.push({ nutrient: 'P', level: 'Very Deficient', weight: 2 });
    else if (r.p < 100) defs.push({ nutrient: 'P', level: 'Deficient', weight: 1 });

    if (r.k < 50) defs.push({ nutrient: 'K', level: 'Very Deficient', weight: 2 });
    else if (r.k < 100) defs.push({ nutrient: 'K', level: 'Deficient', weight: 1 });
    
    return defs.sort((a, b) => b.weight - a.weight);
  });
  
  recipe = computed<RecipeItem[] | null>(() => {
    const defs = this.deficiencies();
    if (defs.length === 0 || !this.quantity()) return null;

    const totalQuantity = this.quantity();
    const recipeItems: RecipeItem[] = [];

    const baseAmount = totalQuantity * 0.6;
    recipeItems.push({ name: 'Cow Dung Base', amount: baseAmount });

    const additivesTotalAmount = totalQuantity * 0.4;
    const totalWeight = defs.reduce((sum, d) => sum + d.weight, 0);

    for (const def of defs) {
      // FIX: Cast Object.values to a typed array to resolve TypeScript errors about properties not existing on type 'unknown'.
      const additiveInfo = (Object.values(this.organicsData.additives) as { nutrient: string; name: string }[]).find(a => a.nutrient === def.nutrient);
      if (additiveInfo) {
        const amount = (def.weight / totalWeight) * additivesTotalAmount;
        recipeItems.push({ name: additiveInfo.name, amount: amount });
      }
    }
    
    return recipeItems;
  });

  getReadings(): void {
    this.isLoading.set(true);
    this.readings.set(null);
    this.statusMessage.set('Getting soil readings...');
    
    this.esp32Service.getNpkReadings()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.readings.set(data);
          this.statusMessage.set(this.deficiencies().length > 0 ? 'Analysis complete.' : 'Soil is well-balanced.');
        },
        error: () => {
          this.statusMessage.set('Failed to connect to sensor.');
        }
      });
  }

  getAdditive(nutrient: 'N' | 'P' | 'K'): string {
    // FIX: Cast Object.values to a typed array to resolve TypeScript errors about properties not existing on type 'unknown'.
    const additive = (Object.values(this.organicsData.additives) as { nutrient: string; name: string }[]).find(a => a.nutrient === nutrient);
    return additive ? additive.name : 'Unknown';
  }
}
