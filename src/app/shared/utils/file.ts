import { Observable } from 'rxjs';

/** Read once, surface errors, and abort unfinished reads when the view is destroyed. */
export function readDataUrl(file: Blob): Observable<string> {
  return new Observable(observer => {
    const reader = new FileReader();
    reader.onload = () => { observer.next(String(reader.result)); observer.complete(); };
    reader.onerror = () => observer.error(reader.error || new Error('ファイルを読み込めませんでした。'));
    reader.onabort = () => observer.complete();
    reader.readAsDataURL(file);
    return () => {
      reader.onload = null;
      reader.onerror = null;
      reader.onabort = null;
      if (reader.readyState === FileReader.LOADING) reader.abort();
    };
  });
}
