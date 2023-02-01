import { Component, OnInit } from "@angular/core";
import { Globalconstants } from "../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../Services/online-exam-service.service";

import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators, FormArray } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from "ngx-toastr";
import { HttpEventType, HttpClient } from '@angular/common/http';
import swal from "sweetalert2";
import {AuthenticationService} from '../../Services/authentication.service';
import { DxiConstantLineModule } from "devextreme-angular/ui/nested";
//
@Component({
  selector: 'app-login-new',
  templateUrl: './login-new.component.html',
  styleUrls: ['./login-new.component.scss']
})
export class LoginNewComponent implements OnInit {

  loginForm: FormGroup;
  submitted = false;
  _LogData:any;

  public captchaIsLoaded = false;
  public captchaSuccess = false;
  public captchaIsExpired = false;
  public captchaResponse?: string;

  public theme: 'light' | 'dark' = 'light';
  public size: 'compact' | 'normal' = 'normal';
  public lang = 'en';
  public type: 'image' | 'audio';
  siteKey: string;
  
  constructor(
        
        
        public toastr: ToastrService,
        private formBuilder: FormBuilder,
        private _onlineExamService: OnlineExamServiceService,
        private _global: Globalconstants,
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthenticationService,
        private http: HttpClient,
        private httpService: HttpClient
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required])],
      password: ['', Validators.required],
      // recaptcha: ['', Validators.required]
    });
    this.siteKey="6LeOZ4YUAAAAAJ8clQYNtOXNDHsd58KZHyJeILk6"

    localStorage.clear();
  }

  onSubmit() {

    this.submitted = true;
     // stop here if form is invalid
     if (this.loginForm.invalid) {
      return;
  }  

  const apiUrl = this._global.baseAPIUrl + 'UserLogin/Create';
    this.authService.userLogin(this.loginForm.value,apiUrl).subscribe( data => {
      
    //console.log("that._LogData ",data); 
    //console.log("that._LogData ",data[0]);  
      if(data.length > 0  && data[0].id !=0)         
      {        
        var that = this;
        that._LogData =data[0];
       console.log("that._LogData ",that._LogData.Days);      
       if (that._LogData.Days <=15 )
       {
       //  alert(that._LogData.Days);
       var mess= " Your password expires in  " + that._LogData.Days  + "  days. Change the password as soon as possible to prevent login problems"
         //var mess="Your password will be expired in  Days" 
        this.Message(mess);
       }


for (var index1 in data[0]) {
 // alert(index1.User_Token);
 // console.log(index1); // prints indexes: 0, 1, 2, 3
  //console.log(data[0].index1); // prints indexes: 0, 1, 2, 3

  localStorage.setItem('UserID',that._LogData.id) ;
  localStorage.setItem('currentUser',that._LogData.id) ;        
  localStorage.setItem('sysRoleID',that._LogData.sysRoleID) ;
  localStorage.setItem('User_Token',that._LogData.User_Token) ;
  localStorage.setItem('UserName',this.loginForm.get("username").value) ;
  localStorage.setItem('Fname',that._LogData.FileNo) ;    

}

     //  return ;
            
    //  console.log("UN",this.loginForm.get("username").value);
      //console.log("ID",that._LogData.id);     
       
      
        if (this.loginForm.get("username").value == "admin")
        {
          this.router.navigate(['dashboards/dashboard']);
      }
      else if(this.loginForm.get("username").value == "upload") {
        this.router.navigate(['upload/file-upload']);
      } else {
        this.router.navigate(['dashboards/Userdashboard']);       

      }

      }
    else
    {

          this.ErrorMessage(data[0].userid);
//      alert("Invalid userid and password.");     
    }

  });
  }

  handleSuccess(data) {
   // console.log(data);
  }

  get f(){
    return this.loginForm.controls;
  }

  ErrorMessage(msg:any)
  {

    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title"></span> <span data-notify="message"> '+msg+' </span></div>',
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass:
          "ngx-toastr alert alert-dismissible alert-danger alert-notify"
      }
    );
  }

  Message(msg:any)
  {

    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title"></span> <span data-notify="message"><h4 class="text-white"> '+msg+' <h4></span></div>',
      "",
      {
        timeOut: 7000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass:
          "ngx-toastr alert alert-dismissible alert-danger alert-notify"
      }
    );
  }  
  
}
