import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY,Observable,concat,defer,of,timer } from 'rxjs';
import { exhaustMap,switchMap,takeWhile } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { GenerationAccepted,GenerationJob,GenerationStatus,toGenerationRequest } from '../../../api/dto';
import { Generated } from '../../../private/dashboard/generate/generated';
import { Order } from '../../../private/dashboard/generate/order';

export type { GenerationJob } from '../../../api/dto';
@Injectable({ providedIn: 'root' })
export class GenerateService {
  constructor(private http: HttpClient) {}
  private base(projectId: string): string {
    return environment.base_url + '/projects/' + encodeURIComponent(projectId);
  }
  list(projectId: string): Observable<Generated[]> {
    return this.http.get<Generated[]>(this.base(projectId) + '/generate');
  }
  /** Unsubscribing stops polling; the durable server job remains available in history. */
  generate(projectId: string, order: Order): Observable<GenerationJob> {
    const idempotencyKey = crypto.randomUUID();
    return defer(() => {
      const url = this.base(projectId) + '/generation-jobs';
      return this.http.post<GenerationAccepted>(url, toGenerationRequest(order), { headers: { 'Idempotency-Key': idempotencyKey } }).pipe(
        switchMap(job => concat(
          // Replayed submissions can already be terminal but omit result details.
          // Read the status resource before terminating the polling operation.
          job.status === 'queued' || job.status === 'running' ? of(job) : EMPTY,
          timer(0, 2500).pipe(exhaustMap(() => this.http.get<GenerationStatus>(url + '/' + encodeURIComponent(job.job_id)))),
        )),
        takeWhile(job => job.status === 'queued' || job.status === 'running', true),
      );
    });
  }
  generateDownloadUrl(projectId: string, generatedFileName: string): Observable<Generated> {
    return this.http.put<Generated>(this.base(projectId) + '/generate/' + encodeURIComponent(generatedFileName) + '/download', {});
  }
}
