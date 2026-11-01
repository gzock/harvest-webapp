import { TestBed } from '@angular/core/testing';
import loadImage from 'blueimp-load-image';
import { describe,expect,it,vi } from 'vitest';
import { DashboardModule } from '../../../private/dashboard/dashboard.module';
import { PhotoCanvasComponent } from './photo-canvas.component';
vi.mock('blueimp-load-image', () => ({ default: vi.fn() }));
describe('JPEG processing contract', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [DashboardModule] }));
  it('preserves orientation correction, 1280px maximum, and JPEG quality', async () => {
    const canvas = document.createElement('canvas');
    const encode = vi.spyOn(canvas, 'toDataURL').mockReturnValue('data:image/jpeg;base64,photo');
    vi.mocked(loadImage).mockResolvedValue({ image: canvas } as never);
    const component = new PhotoCanvasComponent({ markForCheck: vi.fn() } as never);
    const file = new Blob(['jpeg']);
    expect(await component.getDataUrl(file)).toBe('data:image/jpeg;base64,photo');
    expect(loadImage).toHaveBeenCalledWith(file, { canvas: true, orientation: true, maxWidth: 1280, maxHeight: 1280 });
    expect(encode).toHaveBeenCalledWith('image/jpeg', 0.85);
  });
});
