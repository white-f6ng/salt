import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {

  console.log('Intercepting request:', req);

  const modifiedReq = req.clone({
    setHeaders: {
      'Access-Control-Allow-Origin': '*'
    }
  });

  return next(modifiedReq).pipe(
    tap((event) => console.log('Response:', event)),
    catchError((error) => {
      console.error('Error:', error);
      return throwError(() => new Error(error.message));
    })
  );
};
