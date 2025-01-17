import { Injectable, Injector } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { map, switchMap } from "rxjs/operators";

@Injectable()
export class ManageProductsService extends ApiService {
  constructor(injector: Injector) {
    super(injector);
  }

  uploadProductsCSV(file: File): Observable<unknown> {
    if (!this.endpointEnabled('import')) {
      console.warn(
        'Endpoint "import" is disabled. To enable change your environment.ts config'
      );
      return EMPTY;
    }

    return this.getPreSignedUrl(file.name).pipe(
      map(({ signedUrl }) => signedUrl),
      switchMap((url) =>
        this.http.put(url, file, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'text/csv',
          },
        })
      )
    );
  }

  private getPreSignedUrl(fileName: string): Observable<{ signedUrl: string }> {
    const url = this.getUrl('import', 'import');
    const token = localStorage.getItem('token');

    return this.http.get<{ signedUrl: string }>(url, {
      params: {
        name: fileName,
      },
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ...(token && { 'Authorization': `Basic ${token}` })
      }
    });
  }
}
