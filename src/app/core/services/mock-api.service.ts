import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MockApiService {
    private api = inject(ApiService);

    private templateResponses: Record<string, string> = {
        'who is the strongest in solo leveling': `The strongest character in **Solo Leveling** is **Sung Jin-Woo** after he becomes the **Shadow Monarch**.

Here are the **Power Level Rankings** for the top characters:

| Rank | Character | Title | Power Level |
| ---- | --------- | ----- | ----------- |
| 1 | Sung Jin-Woo | Shadow Monarch (Final) | 10,000,000 |
| 2 | Ashborn | Original Shadow Monarch | 9,500,000 |
| 3 | Antares | Dragon King | 8,200,000 |
| 4 | Bellion | Grand Marshal | 4,500,000 |
| 5 | Beru | Ant King | 3,800,000 |
| 6 | Igris | Blood-Red Commander | 3,200,000 |

<chart>{"type": "power-levels", "title": "Solo Leveling Power Levels", "data": [{"name": "Jin-Woo", "value": 10000000}, {"name": "Ashborn", "value": 9500000}, {"name": "Antares", "value": 8200000}, {"name": "Bellion", "value": 4500000}, {"name": "Beru", "value": 3800000}, {"name": "Igris", "value": 3200000}]}</chart>`,
    };
}
