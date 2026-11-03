import { firstValueFrom,of,throwError } from 'rxjs';
import { afterEach,describe,expect,it,vi } from 'vitest';
import { Order } from '../../../private/dashboard/generate/order';
import { GenerateService,GenerationJob } from './generate.service';
const order: Order = { type: 'excel', title: 'Report', template_id: 'basic_1.xlsx', by_name: true, needs_include_hierarchy: false, needs_make_dir: true, needs_all_photos: false, needs_date: false, needs_print_settings: true, needs_sort: false, force_download: false, char_enc: 'utf_8' };
describe('Durable generation jobs', () => {
  afterEach(() => vi.useRealTimers());
  it('uses an idempotency key and stops polling after success', async () => {
    vi.useFakeTimers();
    const http = {
      post: vi.fn(() => of({ job_id: 'j', status: 'queued' })),
      get: vi.fn().mockReturnValueOnce(of({ job_id: 'j', status: 'running' })).mockReturnValueOnce(of({ job_id: 'j', status: 'succeeded', result: { name: 'report', download_url: 'https://example.test/report' } })),
    };
    const states: GenerationJob[] = [];
    new GenerateService(http as never).generate('p', order).subscribe(job => states.push(job));
    await vi.advanceTimersByTimeAsync(5000);
    expect(states.map(job => job.status)).toEqual(['queued', 'running', 'succeeded']);
    expect(http.get).toHaveBeenCalledTimes(2);
    expect(http.post).toHaveBeenCalledWith(expect.stringContaining('/p/generation-jobs'), order, { headers: { 'Idempotency-Key': expect.any(String) } });
  });
  it('reports failed as a terminal status rather than polling indefinitely', async () => {
    vi.useFakeTimers();
    const http = { post: () => of({ job_id: 'j', status: 'queued' }), get: vi.fn(() => of({ job_id: 'j', status: 'failed', error_code: 'INVALID_TEMPLATE' })) };
    const completed = vi.fn();
    new GenerateService(http as never).generate('p', order).subscribe({ complete: completed });
    await vi.advanceTimersByTimeAsync(10000);
    expect(http.get).toHaveBeenCalledOnce(); expect(completed).toHaveBeenCalledOnce();
  });
  it('stops network requests when the owning view cancels its subscription', async () => {
    vi.useFakeTimers();
    const http = { post: () => of({ job_id: 'j', status: 'queued' }), get: vi.fn(() => of({ job_id: 'j', status: 'running' })) };
    const subscription = new GenerateService(http as never).generate('p', order).subscribe();
    await vi.advanceTimersByTimeAsync(0); subscription.unsubscribe();
    await vi.advanceTimersByTimeAsync(10000);
    expect(http.get).toHaveBeenCalledOnce();
  });
  it('reuses one idempotency key when retrying a lost job response', async () => {
    const post = vi.fn().mockReturnValueOnce(throwError(() => new Error('Response lost')))
      .mockReturnValueOnce(of({ job_id: 'same-job', status: 'queued' }));
    const http = { post, get: vi.fn() };
    const operation = new GenerateService(http as never).generate('p', order);
    await expect(firstValueFrom(operation)).rejects.toThrow('Response lost');
    await expect(firstValueFrom(operation)).resolves.toMatchObject({ job_id: 'same-job' });
    expect(post.mock.calls[0][2]).toEqual(post.mock.calls[1][2]);
  });

  it.each(['succeeded', 'failed'] as const)('fetches terminal details when an idempotent POST replays %s', async status => {
    vi.useFakeTimers();
    const result = { job_id: 'existing', status, result: status === 'succeeded' ? { name: 'report', download_url: 'https://example.test/report' } : undefined, error_code: status === 'failed' ? 'INVALID_TEMPLATE' : undefined };
    const http = { post: () => of({ job_id: 'existing', status }), get: vi.fn(() => of(result)) };
    const states: GenerationJob[] = [];
    new GenerateService(http as never).generate('p', order).subscribe(job => states.push(job));
    await vi.advanceTimersByTimeAsync(10000);
    expect(http.get).toHaveBeenCalledOnce();
    expect(states).toEqual([result]);
  });

});
