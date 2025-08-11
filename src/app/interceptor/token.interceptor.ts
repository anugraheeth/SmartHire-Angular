import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const userData = localStorage.getItem("user");
  if(userData!==null)
  {
    const data = JSON.parse(userData);
    const token = data.token;
    const newReq = req.clone({
      setHeaders:{
        Authorization :`Bearer ${token}`,
      }
    })
    return next(newReq);
  }else
  {
    return next(req);
  }
  
};
