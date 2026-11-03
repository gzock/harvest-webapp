import { firstValueFrom,of,Subject } from 'rxjs';
import { describe,expect,it,vi } from 'vitest';
import { NotificationsService } from './notifications.service';
describe('Notifications', () => {
  it('waits for user resolution before constructing the request URL', async () => {
    const user = new Subject<{ username: string }>();
    const http = { get: vi.fn(() => of([])) };
    const service = new NotificationsService({ getData: () => user, signedOut: new Subject() } as never, http as never);
    const result = firstValueFrom(service.list());
    expect(http.get).not.toHaveBeenCalled();
    user.next({ username: 'user-id' });
    await result;
    expect(http.get).toHaveBeenCalledWith(expect.stringContaining('/users/user-id/notifications'));
  });
  it('publishes empty responses to clear stale notifications', async () => {
    const http = { get: vi.fn().mockReturnValueOnce(of([{ notification_id: 'n' }])).mockReturnValueOnce(of([])) };
    const service = new NotificationsService({ getData: () => of({ username: 'u' }), signedOut: new Subject() } as never, http as never);
    await firstValueFrom(service.list()); await firstValueFrom(service.list());
    expect(service.notifications).toEqual([]);
  });
});
