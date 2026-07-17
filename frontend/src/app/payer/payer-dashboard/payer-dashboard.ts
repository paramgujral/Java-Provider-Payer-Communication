import {
  Component,
  HostListener,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { RequestService } from '../../services/request.service';

@Component({
  selector: 'app-payer-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payer-dashboard.html',
  styleUrls: ['./payer-dashboard.scss']
})
export class PayerDashboard implements OnInit {

  requests: any[] = [];

  notifications: string[] = [];
  showNotifications = false;

  constructor(
    private router: Router,
    private requestService: RequestService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {

    this.requestService
      .getAllRequests()
      .subscribe({

        next: (data: any) => {

          console.log(
            'FHIR Bundle Response:',
            data
          );

          if (data.entry) {

            this.requests =
              data.entry.map(
                (entry: any) => ({

                  id:
                    entry.resource.id,

                  patientName:
                    entry.resource.patient?.display || '',

                  diagnosis:
                    entry.resource.diagnosis?.[0]
                      ?.diagnosisCodeableConcept?.text || '',

                  treatment:
                    entry.resource.item?.[0]
                      ?.productOrService?.text || '',
                  estimatedCost:
  entry.resource.total?.value || 0,

                  provider:
                    entry.resource.provider?.display || '',

                  status:
                    entry.resource.status || ''

                })
              );

          } else {

            this.requests = [];

          }

          console.log(
            'Requests loaded successfully:',
            this.requests
          );

          const pendingRequests =
            this.requests.filter(
              (request: any) =>
                request.status === 'draft'
            );

          this.notifications = [];

          if (pendingRequests.length > 0) {

            this.notifications.push(
              `${pendingRequests.length} authorization requests available for review`
            );

          } else {

            this.notifications.push(
              'No pending authorization requests.'
            );

          }

        },

        error: (err) => {

          console.error(
            'Failed to load requests',
            err
          );

          alert(
            'Failed to load requests'
          );

        }

      });

  }

  approveRequest(request: any) {

    this.requestService
      .approveRequest(request.id)
      .subscribe({

        next: (response: any) => {

          console.log(
            'Approve Response:',
            response
          );

          request.status =
            response.status;

          this.loadRequests();

          alert(
            `Request ${request.id} approved successfully`
          );

        },

        error: (err) => {

          console.error(err);

          alert(
            'Failed to approve request'
          );

        }

      });

  }

  rejectRequest(request: any) {

    this.requestService
      .rejectRequest(request.id)
      .subscribe({

        next: (response: any) => {

          console.log(
            'Reject Response:',
            response
          );

          request.status =
            response.status;

          this.loadRequests();

          alert(
            `Request ${request.id} rejected successfully`
          );

        },

        error: (err) => {

          console.error(err);

          alert(
            'Failed to reject request'
          );

        }

      });

  }

  toggleNotifications() {

    this.showNotifications =
      !this.showNotifications;

  }

  @HostListener(
    'document:click',
    ['$event']
  )
  clickOutside(event: Event) {

    const target =
      event.target as HTMLElement;

    if (
      !target.closest(
        '.notification-container'
      )
    ) {

      this.showNotifications =
        false;

    }

  }

  logout() {

    localStorage.clear();

    this.router.navigateByUrl(
      '/'
    );

  }

}