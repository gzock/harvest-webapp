import { firstValueFrom,of,throwError } from 'rxjs';
import { describe,expect,it,vi } from 'vitest';
import { PhotosService } from './photos.service';
describe('Photo upload session', () => {
  it('reserves, sends fields and binary file to S3, then finalizes the same session', async () => {
    const post = vi.fn().mockReturnValueOnce(of({ session_id: 's', photo_id: 'p', upload: { url: 'https://s3.example.test/upload', fields: { key: 'quarantine/p', policy: 'signed' } } }))
      .mockReturnValueOnce(of('')).mockReturnValueOnce(of({ photo_id: 'p' }));
    const service = new PhotosService({ post } as never); service.setProjectId('project');
    await firstValueFrom(service.create('target', 'before', btoa('jpeg')));
    expect(post.mock.calls[0][1]).toEqual({ type: 'before', content_type: 'image/jpeg', size: 4 });
    const body = post.mock.calls[1][1] as FormData;
    expect([...body.keys()]).toEqual(['key', 'policy', 'file']);
    expect((body.get('file') as File).type).toBe('image/jpeg');
    expect(post.mock.calls[2][0]).toMatch(/\/upload-sessions\/s\/complete$/);
  });
  it('does not finalize an unsuccessful binary upload', async () => {
    const post = vi.fn().mockReturnValueOnce(of({ session_id: 's', upload: { url: 'https://s3.example.test', fields: {} } })).mockReturnValueOnce(throwError(() => new Error('upload failed')));
    const service = new PhotosService({ post } as never); service.setProjectId('p');
    await expect(firstValueFrom(service.create('t', 'before', btoa('jpeg')))).rejects.toThrow('upload failed');
    expect(post).toHaveBeenCalledTimes(2);
  });
  it('retries only completion with the same session after the completion response is lost', async () => {
    const post = vi.fn()
      .mockReturnValueOnce(of({ session_id: 'same-session', upload: { url: 'https://s3.example.test', fields: {} } }))
      .mockReturnValueOnce(of(''))
      .mockReturnValueOnce(throwError(() => new Error('Response lost')))
      .mockReturnValueOnce(of({ photo_id: 'same-photo', message: 'successfully' }));
    const service = new PhotosService({ post } as never); service.setProjectId('p');
    const operation = service.create('t', 'before', btoa('jpeg'));
    await expect(firstValueFrom(operation)).rejects.toThrow('Response lost');
    await expect(firstValueFrom(operation)).resolves.toMatchObject({ photo_id: 'same-photo' });
    expect(post).toHaveBeenCalledTimes(4);
    expect(post.mock.calls[2][0]).toBe(post.mock.calls[3][0]);
    expect(post.mock.calls[3][0]).toMatch(/same-session\/complete$/);
    // Re-observing a successful operation does not create another photo either.
    await firstValueFrom(operation);
    expect(post).toHaveBeenCalledTimes(4);
  });

});
