import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QueueComponent } from './queue/queue.component';
import { HomeComponent } from './home/home.component';
import { QueueGuard } from './guards/queue.guard';
import { HostGuard } from './guards/host.guard';
import { HostComponent } from './host/host.component';
import { PlatformComponent } from './platform/platform.component';
import { PlatformGuard } from './guards/platform.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'queue/:code', component: QueueComponent, canActivate: [QueueGuard] },
  { path: 'host/:code', component: HostComponent, canActivate: [HostGuard] },
  { path: 'platform', component: PlatformComponent, canActivate: [PlatformGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
