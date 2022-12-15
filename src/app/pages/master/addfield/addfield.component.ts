import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from "ngx-toastr";
import swal from "sweetalert2";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-addfield",
  templateUrl: "addfield.component.html",
})
export class AddFieldComponent implements OnInit {
  
  AddCustomForm: FormGroup; 
  submitted = false;
  Reset = false;     
  sMsg: string = '';    
  TemplateList :any;
  BranchForm: FormGroup;
  _TempID: any =0;
  _IndexID: any =0;
  _IndexFieldData:any; 

  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private router: Router,
    private route: ActivatedRoute,
  ) {}
  ngOnInit() {
    this.AddCustomForm = this.formBuilder.group({
      TemplateID: [0, Validators.required],
      IndexField: ['', Validators.compose([Validators.required])],
      DisplayName: ['', Validators.required],      
      MinLenght: ['', Validators.required],        
      //CloginPass: ['', Validators.required],
      MaxLenght: ['', Validators.required],
      FieldType: [0, Validators.required],    
      ListData: [''],
      IsMandatory: [''],
      IsAuto: [''], 
      User_Token: localStorage.getItem('User_Token') ,
      CreatedBy: localStorage.getItem('UserID') ,
      id:[0]
    });

    this._IndexID  = localStorage.getItem('_TempID') ;      
    this.getTemplate();
    if (this._IndexID >0)
    {
        this.getindexListData();
    }

  }
  
  getTemplate() {  
    const apiUrl=this._global.baseAPIUrl+'Template/GetTemplate?user_Token='+ localStorage.getItem('User_Token') 
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {     
    this.TemplateList = data;    
    this.AddCustomForm.controls['TemplateID'].setValue(0);
    this.AddCustomForm.controls['FieldType'].setValue(0);    
    //this.AddEditBranchMappingForm.controls['UserIDM'].setValue(0);
    //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
    });
    }

  OnReset() {
    this.Reset = true;
    this.AddCustomForm.reset();
  }

  onSubmit() {
    this.submitted = true;
   // console.log(this.AddCustomForm);
    if (this.AddCustomForm.invalid) {
      alert("Please Fill the Fields");
      return;
    }
    let _IsAuto =0;
    
    if (this.AddCustomForm.get("IsAuto").value)
    {
      _IsAuto =1;
    }

    let _IsMandatory =0;    
    if (this.AddCustomForm.get("IsMandatory").value)
    {
      _IsMandatory =1;
    }

    this.AddCustomForm.patchValue({
      id: this._IndexID ,
      User_Token: localStorage.getItem('User_Token') ,           
      CreatedBy:localStorage.getItem('UserID') ,
      });

      this.AddCustomForm.patchValue({
        id: this._IndexID ,
        User_Token: localStorage.getItem('User_Token') ,           
        CreatedBy:localStorage.getItem('UserID') ,
        IsMandatory:_IsMandatory,
        IsAuto:_IsAuto
        });

   //  alert(this.AddCustomForm.get("IsAuto").value)

    const apiUrl = this._global.baseAPIUrl + 'CustomForms/Create';
    this._onlineExamService.postData(this.AddCustomForm.value,apiUrl).subscribe((data: {}) => {     
    // console.log(data);
     this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success!</span> <span data-notify="message">Field Saved</span></div>',
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass:
          "ngx-toastr alert alert-dismissible alert-success alert-notify"
      }
    );   
     this.OnReset()
      //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
    });

    //this.studentForm.patchValue({File: formData});
  }

  RedirectToView()
  {        
  //this.router.navigate(['/master/view-customform'])

  this.router.navigate(['/master/view-custom-form']);
  }
  getindexListData() { 
   

    const apiUrl=this._global.baseAPIUrl+'CustomForms/GetListFields?ID='+  this._IndexID +'&user_Token='+ localStorage.getItem('User_Token') 
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {     
    var that = this;
    that._IndexFieldData =data;

    //alert(that._UsersList[0].name);
    // if (that._UsersList !="")
    // {
    this.AddCustomForm.controls['TemplateID'].setValue(that._IndexFieldData.TemplateID);
    this.AddCustomForm.controls['IndexField'].setValue(that._IndexFieldData.IndexField);
    this.AddCustomForm.controls['DisplayName'].setValue(that._IndexFieldData.DisplayName);
    this.AddCustomForm.controls['FieldType'].setValue(that._IndexFieldData.FieldType);
    this.AddCustomForm.controls['MinLenght'].setValue(that._IndexFieldData.MinLenght);
    this.AddCustomForm.controls['MaxLenght'].setValue(that._IndexFieldData.MaxLenght);
    this.AddCustomForm.controls['ListData'].setValue(that._IndexFieldData.ListData);
    this.AddCustomForm.controls['IsMandatory'].setValue(that._IndexFieldData.IsMandatory);
    this.AddCustomForm.controls['IsAuto'].setValue(that._IndexFieldData.IsAuto);

    that._IndexFieldData="";
    localStorage.setItem('_TempID','0') ;

//    this._IndexFieldData = localStorage.getItem('UserID');

    //  }


    //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
    });
  }   
}
