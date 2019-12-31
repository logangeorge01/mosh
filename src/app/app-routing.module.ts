import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QueueComponent } from './queue/queue.component';
import { HomeComponent } from './home/home.component';
import { QueueGuard } from './guards/queue.guard';
import { HostGuard } from './guards/host.guard';
import { HostComponent } from './host/host.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'queue/:code', component: QueueComponent, canActivate: [QueueGuard] },
  { path: 'host/:code', component: HostComponent, canActivate: [HostGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
