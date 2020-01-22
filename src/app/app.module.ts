import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {NgForm, FormsModule} from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { QueueComponent } from './queue/queue.component';
import { HomeComponent } from './home/home.component';
import { HostComponent } from './host/host.component';
import { QueueGuard } from './guards/queue.guard';
import { HostGuard } from './guards/host.guard';

@NgModule({
  declarations: [
    AppComponent,
    QueueComponent,
    HomeComponent,
    HostComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule
  ],
  providers: [QueueGuard, HostGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
