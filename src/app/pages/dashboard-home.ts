
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LuzMonitor } from '../components/luz-monitor/luz-monitor';
import { UltimaFotoComponent } from '../components/ultima-foto/ultima-foto';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    UltimaFotoComponent,
    LuzMonitor
  ],
  templateUrl: './dashboard-home.html',
  styleUrls: ['./dashboard-home.css']
})
export class DashboardHome {}
