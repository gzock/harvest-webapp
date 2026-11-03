import { ChangeDetectionStrategy,Component,OnDestroy,OnInit } from '@angular/core';
import { ReplaySubject,Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { GuestPermissions } from '../../../shared/services/projects/action-permissions/permissions/guest-permissions';

import { Platform } from '@angular/cdk/platform';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

import { ImportActionComponent } from './../../../shared/components/import-action/import-action.component';
import { TargetActionsComponent } from './../../../shared/components/target-actions/target-actions.component';

import { AlertService } from './../../../shared/services/alert/alert.service';
import { PhotosService } from './../../../shared/services/photos/photos.service';
import { PlacesService } from './../../../shared/services/places/places.service';
import { Permissions } from './../../../shared/services/projects/action-permissions/permissions/permissions';
import { ProjectsService } from './../../../shared/services/projects/projects.service';
import { TargetsService } from './../../../shared/services/targets/targets.service';
import { Project } from './../projects/project';
import { Place } from './place';
import { Target } from './target';

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-work',
  templateUrl: './work.component.html',
  styleUrls: ['./work.component.scss']
})
export class WorkComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new ReplaySubject<void>(1);
  private placesRequest?: Subscription;
  public currentProject: Project | null = null;
  public currentProjectSubscription?: Subscription;
  public places: Place[] = [];
  public targets: Target[] = [];
  public isMobile: boolean = false;
  public isLoading: boolean = false;
  public filterDatasource: string = "place";
  public filterValue: string = '';

  public placeDataSource = new MatTableDataSource<Place>([]);
  public targetDataSource = new MatTableDataSource<Target>([]);
  public permissions: Permissions = new GuestPermissions();
  public placeHierarchy: any = [];

  constructor(
    private bottomSheet: MatBottomSheet,
    public placesService: PlacesService,
    public targetsService: TargetsService,
    public projectsService: ProjectsService,
    public photosService: PhotosService,
    private alert: AlertService,
    public dialog: MatDialog,
    private platform: Platform
  ) { }

  ngOnInit() {
    if(this.platform.ANDROID || this.platform.IOS) {
      this.isMobile = true;
      this.filterDatasource = "all";
    }
    this.currentProjectSubscription = this.projectsService.currentProjectSubject
      .subscribe(
        project => {
          this.placesRequest?.unsubscribe();
          this.currentProject = project;
          this.places = [];
          this.targets = [];
          this.placeDataSource = new MatTableDataSource<Place>([]);
          this.targetDataSource = new MatTableDataSource<Target>([]);
          this.permissions = this.projectsService.getCurrentPermissions();
          if(project) {
            this.currentProject = project;
            if (this.currentProject) this.placesService.setProjectId(this.currentProject.project_id);
            this.targetsService.setProjectId(this.currentProject.project_id);
            this.photosService.setProjectId(this.currentProject.project_id);

            const place = {
              project_id: this.currentProject.project_id,
              place_id: this.currentProject.project_id,
              name: this.currentProject.name,
              parent_place_id: this.currentProject.project_id,
              hierarchy: "",
              photos: {
                required: 0,
                results: {
                  before: 0,
                  after: 0
                }
              },
              created_at: "",
              updated_at: ""
            }
            this.placesService.select(place);
            this.placesService.placeHistory = [];
            this.placesService.placeHistory.push(place);
            this.getPlaces(this.currentProject.project_id);
            this.permissions = this.projectsService.getCurrentPermissions();
          }
        },
        _error => {

        }
      );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.bottomSheet.dismiss();
    this.placesRequest?.unsubscribe();
    if (this.currentProjectSubscription) {
      this.currentProjectSubscription.unsubscribe();
    }
  }

  openBottomSheet(selected: Place | Target, defaultType = 'place'): void {
    const actionRef = this.bottomSheet.open(TargetActionsComponent, { data: { selected: selected , defaultType: defaultType } });
    actionRef.afterDismissed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if(result) {
        this.getPlaces(this.placesService.getCurrentPlace().place_id);
      }
    });
  }

  displayedPlaceColumns: string[] = ['name', 'photos.required', 'photos.results.before', 'photos.results.after'];
  displayedTargetColumns: string[] = ['name', 'before', 'after'];

  public getPlaces(placeId: string) {
    if (!this.currentProject) return;
    this.placesRequest?.unsubscribe();
    this.isLoading = true;
    this.placesRequest = this.placesService.list(placeId)
      .subscribe(
         response => {
           this.isLoading = false;
           this.places = response.places;
           this.placeDataSource = new MatTableDataSource(this.places);
           this.targets = response.targets;
           this.targetDataSource = new MatTableDataSource(this.targets);
           
           this.currentProject = this.projectsService.getCurrentProject();
           if (this.currentProject) this.placesService.setProjectId(this.currentProject.project_id);
           this.getPlaceHierarchy();
         },
         _err => {
           this.isLoading = false;

           this.openErrorAlert("場所の取得");
         }
      );
  }

  public forwardPlace(place: Place) {
    this.placesService.select(place);
    this.placesService.placeHistory.push(place);
    this.getPlaces(place.place_id);
  }

  public backwardPlace() {
    this.placesService.placeHistory.pop();
    const place = this.placesService.placeHistory[this.placesService.placeHistory.length - 1]
    this.placesService.select(place);
    this.getPlaces(place.place_id);
  }

  public goHome() {
    this.placesService.placeHistory = [this.placesService.placeHistory[0]];
    const place = this.placesService.placeHistory[0];
    this.placesService.select(place);
    this.getPlaces(place.place_id);
  }
  public refresh() {
    this.getPlaces(this.placesService.getCurrentPlace().place_id);
  }

  private openErrorAlert(msg: string) {
    this.alert.openErrorAlert(msg + "に失敗しました。再度、お試しください。");
  }

  public floor(num: number) {
    return Math.floor(num);
  }

  openImportActionDialog() {
    const dialogRef = this.dialog.open(ImportActionComponent, { disableClose: true, width: '600px' });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if(result) {
        this.refresh();
      }
    });
  }

  public applyFilter(filterValue: string) {
    this.filterValue = filterValue;
    switch(this.filterDatasource) {
      case "place":
        this.placeDataSource.filter = filterValue.trim().toLowerCase();
        this.targetDataSource.filter = "";
        break;
      case "target":
        this.targetDataSource.filter = filterValue.trim().toLowerCase();
        this.placeDataSource.filter = "";
        break;
      case "all":
        this.placeDataSource.filter = filterValue.trim().toLowerCase();
        this.targetDataSource.filter = filterValue.trim().toLowerCase();
        break;
    }
  }

  public getPlaceHierarchy() {
    const places = [];
    for(const place of this.placesService.placeHistory) {
      places.push(place.name);
    }
    places.shift();
    this.placeHierarchy = places;
  }

}
