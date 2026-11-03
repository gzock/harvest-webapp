import { firstValueFrom,of,Subject } from 'rxjs';
import { beforeEach,describe,expect,it } from 'vitest';
import { Project } from '../../../private/dashboard/projects/project';
import { ProjectsService } from './projects.service';
const project = (id: string, role = 'worker') => ({ project_id: id, name: 'same', role } as Project);
describe('Project selection', () => {
  const signedOut = new Subject<void>();
  let response: Project[];
  let username: string;
  let service: ProjectsService;
  beforeEach(() => {
    localStorage.clear(); response = []; username = 'alice';
    service = new ProjectsService({ get: () => of(response) } as never, { getData: () => of({ username }), signedOut } as never);
  });
  it('does not publish an empty object as a selected project', () => expect(service.getCurrentProject()).toBeNull());
  it('restores only an ID belonging to the authenticated user and current server response', async () => {
    localStorage.setItem('harvest.selectedProject.alice', 'b');
    response = [project('a'), project('b', 'admin')];
    await firstValueFrom(service.list());
    expect(service.getCurrentProject()?.project_id).toBe('b');
    expect(service.getCurrentPermissions().generate.execute).toBe(true);
  });
  it('refreshes all project data even when name and role did not change', async () => {
    response = [project('a')]; await firstValueFrom(service.list());
    response = [{ ...project('a'), start_on: '2026-10-23' }]; await firstValueFrom(service.list());
    expect(service.getCurrentProject()?.start_on).toBe('2026-10-23');
  });
  it('clears selection and permissions when membership disappears', async () => {
    response = [project('a', 'owner')]; await firstValueFrom(service.list());
    response = []; await firstValueFrom(service.list());
    expect(service.getCurrentProject()).toBeNull();
    expect(service.getCurrentPermissions().photo.create).toBe(false);
  });
  it('clears all in-memory state when signing out', async () => {
    response = [project('a')]; await firstValueFrom(service.list()); signedOut.next();
    expect(service.getCurrentProject()).toBeNull(); expect(service.joinedProjects).toEqual([]);
  });
  it('does not restore a previous account selection for another user', async () => {
    localStorage.setItem('harvest.selectedProject.alice', 'b');
    username = 'bob'; response = [project('a'), project('b')]; await firstValueFrom(service.list());
    expect(service.getCurrentProject()?.project_id).toBe('a');
  });
  it('cancels an earlier refresh so stale membership cannot overwrite the latest list', () => {
    const oldResponse = new Subject<Project[]>();
    const newResponse = new Subject<Project[]>();
    let request = 0;
    service = new ProjectsService({ get: () => request++ === 0 ? oldResponse : newResponse } as never,
      { getData: () => of({ username: 'alice' }), signedOut } as never);
    const oldResult: Project[][] = [];
    service.list().subscribe(items => oldResult.push(items));
    service.list().subscribe();
    expect(oldResponse.observed).toBe(false);
    newResponse.next([project('new')]);
    oldResponse.next([project('old', 'owner')]);
    expect(service.getCurrentProject()?.project_id).toBe('new');
    expect(oldResult).toEqual([]);
  });

});
