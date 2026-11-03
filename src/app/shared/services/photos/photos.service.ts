import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,defer,of } from 'rxjs';
import { switchMap,tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { UploadCompletion,UploadCompletionRequest,UploadRequest,UploadSession } from '../../../api/dto';

@Injectable({ providedIn: 'root' })
export class PhotosService {
  private projectId = '';
  constructor(private http: HttpClient) {}
  setProjectId(projectId: string): void { this.projectId = projectId; }
  private base(targetId: string): string {
    return environment.base_url + '/projects/' + encodeURIComponent(this.projectId) + '/targets/' + encodeURIComponent(targetId);
  }
  show(targetId: string, photoId: string): Observable<{ data: string }> {
    return this.http.get<{ data: string }>(this.base(targetId) + '/photos/' + encodeURIComponent(photoId));
  }
  /** The API reserves a photo slot before bytes are uploaded and finalizes it idempotently. */
  create(targetId: string, type: UploadRequest['type'], photoData: string): Observable<UploadCompletion> {
    const base = this.base(targetId) + '/upload-sessions';
    // Keep the reservation across retries of this operation. A lost completion
    // response must never reserve a second photo slot or upload the bytes again.
    let reservation: UploadSession | undefined;
    let uploaded = false;
    let completed: UploadCompletion | undefined;
    return defer(() => {
      if (completed) return of(completed);
      const bytes = Uint8Array.from(atob(photoData), character => character.charCodeAt(0));
      if (bytes.length > 4 * 1024 * 1024) throw new Error('写真は4MB以内にしてください。');
      const file = new Blob([bytes], { type: 'image/jpeg' });
      const session = reservation ? of(reservation) : this.http.post<UploadSession>(base,
        { type, content_type: 'image/jpeg', size: file.size } satisfies UploadRequest,
      ).pipe(tap(value => { reservation = value; }));
      return session.pipe(switchMap(value => {
        const complete = () => this.http.post<UploadCompletion>(
          base + '/' + encodeURIComponent(value.session_id) + '/complete', {} satisfies UploadCompletionRequest,
        ).pipe(tap(result => { completed = result; }));
        if (uploaded) return complete();
        const form = new FormData();
        for (const [name, field] of Object.entries(value.upload.fields)) form.append(name, field);
        form.append('file', file, 'photo.jpg');
        return this.http.post(value.upload.url, form, { responseType: 'text' }).pipe(
          tap(() => { uploaded = true; }),
          switchMap(complete),
        );
      }));
    });
  }

  delete(targetId: string, photoId: string): Observable<unknown> {
    return this.http.delete(this.base(targetId) + '/photos/' + encodeURIComponent(photoId));
  }
  adopt(targetId: string, type: string, photoId: string): Observable<unknown> {
    return this.http.put(this.base(targetId) + '/photos/' + encodeURIComponent(photoId), { type });
  }
}
