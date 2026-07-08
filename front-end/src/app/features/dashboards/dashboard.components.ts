@Component({
  selector: 'app-dashboard',
  template: `
    <h2>Dashboard</h2>
    <div *ngFor="let stat of stats?.statusDistribution">
      {{ stat.status }}: {{ stat.count }}
    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get('/api/dashboard/stats').subscribe(res => this.stats = res);
  }
}
