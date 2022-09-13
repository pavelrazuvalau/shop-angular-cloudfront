import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest, HttpStatusCode
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { NotificationService } from '../notification.service';
import { catchError, tap } from "rxjs/operators";

@Injectable()
export class ErrorPrintInterceptor implements HttpInterceptor {
  constructor(private readonly notificationService: NotificationService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: unknown) => {
        const url = new URL(request.url);
        let errorTest = `Request to "${url.pathname}" failed. Check the console for the details`;

        if (error instanceof HttpErrorResponse) {
          if (error.status === HttpStatusCode.Unauthorized) {
            errorTest = 'Missing user credentials';
          }

          if (error.status === HttpStatusCode.Forbidden) {
            errorTest = 'Incorrect username or password';
          }
        }

        this.notificationService.showError(errorTest, 0);

        return throwError(error);
      })
    );
  }
}
