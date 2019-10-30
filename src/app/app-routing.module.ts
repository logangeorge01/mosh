import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QueueComponent } from './queue/queue.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'queue/:code/:uname', component: QueueComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
