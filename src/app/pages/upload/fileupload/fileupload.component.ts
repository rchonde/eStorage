import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef,EventEmitter,Output } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from "ngx-toastr";
import { HttpEventType, HttpClient } from '@angular/common/http';
import swal from "sweetalert2";
import { Alert } from "selenium-webdriver";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-fileupload",
  templateUrl: "fileupload.component.html",
  styleUrls: ["fileupload.component.css"]
})
export class FileUploadComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  _FilteredList :any; 
  _DeptList:any;
  _IndexList:any;
  EntityList:any;
  _DepartmentList:any;
  _DSConfigList:any;
  BranchList:any;
  _Records :any; 
  _StatusList :any; 
  FileUPloadForm: FormGroup;
  submitted = false;
  Reset = false;     
  sMsg: string = '';    
  public progress: number;
  public message: string;
  _TemplateList:any; 
  myFiles:string [] = [];
  _FileDetails:string [][] = [];
  first = 0;
  rows = 10;
  @Output() public onUploadFinished = new EventEmitter();
    
  
    constructor(
      private _onlineExamService: OnlineExamServiceService,
      private _global: Globalconstants,
      private formBuilder: FormBuilder,
      private http: HttpClient,
      private httpService: HttpClient,
      public toastr: ToastrService,
      private route: ActivatedRoute,
      private router: Router,
  
    ) { }
  
    ngOnInit() {
      this.FileUPloadForm = this.formBuilder.group({         
        
        DeptID:[0],        
        DocID:[1],
        DSConfigName:[0],
        BranchID:['0', Validators.required],
        SubfolderID:[0, Validators.required],        
        TemplateID:[0, Validators.required],
        // TemplateID:[1],
        UplaodBy: [''],
        TemplateName: [''],
        User_Token: localStorage.getItem('User_Token') ,
        CreatedBy: localStorage.getItem('UserID') ,
        id:[0],
        CSVData:""
      });
  
     this.Getpagerights();
  
     // this.geBranchList();  
    //  this.getDeparmenList();
      this.geTTempList();
      //this.GetEntityList();
      this.GetDS();
      this.getDepartmentList();
    //  this.geDoctypeList();

    this.BindHeader(this._IndexList,this._IndexList);
     
    }


    Getpagerights() {

      var pagename ="File Upload";
      const apiUrl = this._global.baseAPIUrl + 'Admin/Getpagerights?userid=' + localStorage.getItem('UserID')+' &pagename=' + pagename + '&user_Token=' + localStorage.getItem('User_Token');
  
      // const apiUrl = this._global.baseAPIUrl + 'Template/GetTemplate?user_Token=' + this.FileStorageForm.get('User_Token').value
      this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      //  this.TemplateList = data;    
       
      if (data <=0)
      {
        localStorage.clear();
        this.router.navigate(["/Login"]);
  
      } 
      
      });
    }
    
    GetDS() {

      const apiUrl=this._global.baseAPIUrl+'DSConfig/GetDSConfig?user_Token='+this.FileUPloadForm.get('User_Token').value
      this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {     
      this._DSConfigList = data;
      this.FileUPloadForm.controls['DSConfigName'].setValue(0);
   //   this._FilteredList = data
      //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
      });
      }
      getDepartmentList() {
        const apiUrl=this._global.baseAPIUrl+'DepartmentMapping/GetDepartmentByUser?ID='+ localStorage.getItem('UserID')+'&user_Token='+localStorage.getItem('User_Token') 
        this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {     
          this._DepartmentList = data;
         // console.log("DepList",data);
        //  this._FilteredList = data
          //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
        });
      }

    entriesChange($event) {
      this.entries = $event.target.value;
    }
    filterTable($event) {
     // console.log($event.target.value);
  
      let val = $event.target.value;
      this._FilteredList = this._StatusList.filter(function (d) {
      //  console.log(d);
        for (var key in d) {
          if (key == "Department" || key == "BranchName" || key == "FileNo" ) {
            if (d[key].toLowerCase().indexOf(val) !== -1) {
              return true;
            }
          }
        }
        return false;
      });
    }
    onSelect({ selected }) {
      this.selected.splice(0, this.selected.length);
      this.selected.push(selected);
    }
    onActivate(event) {
      this.activeRow = event.row;
    }
      OnReset() {  
      this.Reset = true;
      this.FileUPloadForm.reset();   
      // this.FileUPloadForm.controls['DocID'].setValue(0);
   //   this.FileUPloadForm.controls['BranchID'].setValue(0);
     // this.FileUPloadForm.controls['TemplateID'].setValue(0);  
     // this.FileUPloadForm.controls['SubfolderID'].setValue(0);    

      this.FileUPloadForm.controls['User_Token'].setValue(localStorage.getItem('User_Token')); 
     // this.FileUPloadForm.controls['UserID'].setValue(localStorage.getItem('UserID'));    
      this.FileUPloadForm.controls['CreatedBy'].setValue(localStorage.getItem('UserID'));    

      }
  
      // geBranchList() {    
      // const apiUrl=this._global.baseAPIUrl+'BranchMaster/GetBranchList?user_Token='+localStorage.getItem('User_Token');
      // this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {     
      // this.BranchList = data;
      // this.FileUPloadForm.controls['BranchID'].setValue(0);
      // //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
      // });
      // }


      geBranchList() {
        //const apiUrl=this._global.baseAPIUrl+'BranchMapping/GetList?user_Token=123123'
        const apiUrl =
          this._global.baseAPIUrl +
          "BranchMapping/GetBranchDetailsUserWise?ID=" +
          localStorage.getItem('UserID') +
          "&user_Token=" +
          this.FileUPloadForm.get("User_Token").value;
        this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
          this.BranchList = data;
          this._FilteredList = data;
          //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
        });
      }

      // GetEntityList() {
      //   //const apiUrl=this._global.baseAPIUrl+'BranchMapping/GetList?user_Token=123123'
      //   const apiUrl =
      //     this._global.baseAPIUrl +
      //     "SubfolderController/GetSubfolderList?ID=" +
      //     localStorage.getItem('UserID') +
      //     "&user_Token=" +
      //     this.FileUPloadForm.get("User_Token").value;
      //   this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      //     this.EntityList = data;
      //    // this._EntityFilteredList = data;
      //     //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
      //   });
      // }

      

      GetEntityList() {
        //const apiUrl=this._global.baseAPIUrl+'BranchMapping/GetList?user_Token=123123'
        const apiUrl =
          this._global.baseAPIUrl +
          "SubFolderMapping/GetSubFolderDetailsUserWise?ID=" +
          localStorage.getItem('UserID')  +
          "&user_Token=" +
          this.FileUPloadForm.get("User_Token").value;
        this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
          this.EntityList = data;
          this.FileUPloadForm.controls['SubfolderID'].setValue(0);
          //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
        });
      }
  

      GetBranchByDepartment(DepartmentID:any)
      {
    //const apiUrl=this._global.baseAPIUrl+'BranchMapping/GetList?user_Token=123123'
        const apiUrl =
        this._global.baseAPIUrl +"BranchMapping/GetBranchByDeptUserWise?ID="+localStorage.getItem('UserID')+"&user_Token="+localStorage.getItem('User_Token')+"&DeptID="+this.FileUPloadForm.get("DeptID").value;
        this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
        this.BranchList = data;
  //  this._FilteredList = data;
    //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
  });
}
  
      // getDeparmenList() {  
  
      // const apiUrl=this._global.baseAPIUrl+'Department/GetList?user_Token='+localStorage.getItem('User_Token');
      // this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {     
      // this._DeparmentList = data;
      // this.FileUPloadForm.controls['DeptID'].setValue(0);
      // //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
      // });
      // }

      // geTemplateNameListByTempID(temp:any)
      // {

      //   console.log("apiUrl");
      //   this.getDoctypeListByTempID();
      // }


      geTemplateNameListByTempID(n:any) {
         //  console.log("apiUrl");
        this.getDoctypeListByTempID();
      }

  
      getDeptList() {  
  
      const apiUrl=this._global.baseAPIUrl+'DocMaster/GetDocList?user_Token='+localStorage.getItem('User_Token');
      this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {     
      this._DeptList = data;
      this.FileUPloadForm.controls['DocID'].setValue(0);
      //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
      });
      }

      geTTempList() {

        //const apiUrl=this._global.baseAPIUrl+'Template/GetTemplate?user_Token='+ this.DataEntryForm.get('User_Token').value;
      //  const apiUrl = this._global.baseAPIUrl + 'TemplateMapping/GetTemplateMappingListByUserID?UserID=' + localStorage.getItem('UserID') + '&user_Token='+this.FileUPloadForm.get('User_Token').value  
        const apiUrl = this._global.baseAPIUrl + 'TemplateMapping/GetTemplateMappingListByUserID?UserID=' + localStorage.getItem('UserID') + '&user_Token='+this.FileUPloadForm.get('User_Token').value  
          
        this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
        this._TemplateList = data;
        this.FileUPloadForm.controls['TemplateID'].setValue(0);
        //    console.log("this._TemplateLis", data)
        //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
        });
    
        }

      // geDoctypeList() {
    
      //   //const apiUrl=this._global.baseAPIUrl+'BranchMapping/GetList?user_Token=123123'
      //   const apiUrl = this._global.baseAPIUrl + 'DocTypeMapping/GetDocTypeDetailsUserWise?ID=' + localStorage.getItem('UserID') + '&user_Token='+this.FileUPloadForm.get('User_Token').value
      //   this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      //     this._DeptList = data;
      //     this.FileUPloadForm.controls['DocID'].setValue(0);
      //   //  console.log("_DeptList",this._DeptList);

      //     //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
      //   });
      // }

      getDoctypeListByTempID() {
    
        //const apiUrl=this._global.baseAPIUrl+'BranchMapping/GetList?user_Token=123123'
        const apiUrl = this._global.baseAPIUrl + 'DocTypeMapping/getDoctypeListByTempID?ID=' + localStorage.getItem('UserID') + '&TemplateID='+this.FileUPloadForm.get('TemplateID').value +'&user_Token='+this.FileUPloadForm.get('User_Token').value
//      console.log("apiUrl",apiUrl);
      
        this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
          this._DeptList = data;
          this.FileUPloadForm.controls['DocID'].setValue(0);
        //  console.log("_DeptList",this._DeptList);

          //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
        });
      }
  
      getFileDetails (e) {
        //console.log (e.target.files);
        var maxsize=0;
        this.myFiles = [];
      if (e.files.length >=1000)
      {
            this.showmessage("You can not upload more than 1000 files.");
            return ;
      }
      //  e.files.length
        for (var i = 0; i < e.files.length; i++) {
          this.myFiles.push(e.files[i]);
       //   console.log(e.files[i].size);
        //  alert(e.files[i].FileSize);
       //   maxsize = maxsize + e.files[i].length;
        }
        this._IndexList = e.files;
        //console.log(e.files);
      //  console.log("this.myFiles",this.myFiles);
       this.prepareTableData(this.myFiles,this.myFiles);
        this.FileSizeValidation();
//alert(this.myFiles.length);

      }

      FileSizeValidation()
      {

        let allFilesSize = 0;
        for (var i = 0; i < this.myFiles.length; i++) { 
          allFilesSize += this.myFiles[i]['size'];
        }
        if((allFilesSize / (1024*1024)) > 500) {
          this.toastr.show(
            '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Maximum 500MB is allowed to upload</span></div>',
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
          return;
        }


      }

      
  
      public uploadFile = (files) => {
        if (files.length === 0) {
          return;
        }

        if (this.validation()  ==false)
        {
          return;
        }
        
       
        let filesToUpload : File[] = files;
        const formData = new FormData();        
          
        Array.from(filesToUpload).map((file, index) => {

          return formData.append('file'+index, file, file.name);
        });      
  
        formData.append('BranchID',this.FileUPloadForm.controls['BranchID'].value);
        formData.append('DSConfigName',this.FileUPloadForm.controls['DSConfigName'].value);        
        formData.append('DeptID',this.FileUPloadForm.controls['DeptID'].value);
        formData.append('DocID',"0");
        formData.append('TemplateID',this.FileUPloadForm.controls['TemplateID'].value);
        formData.append('UserID',localStorage.getItem('UserID'));
        formData.append('SubfolderID',this.FileUPloadForm.controls['SubfolderID'].value);    
        
        
     //   this.DataUploadForm.controls['BranchID'].value;
        //const apiUrl=this._global.baseAPIUrl+'DocMaster/GetDocList?user_Token=123123'
        const apiUrl = this._global.baseAPIUrl + 'FileUpload/UploadFiles';
        this.http.post(apiUrl, formData, {reportProgress: true, observe: 'events'})
          .subscribe(event => {


          //  alert(event.type);
            if (event.type === HttpEventType.UploadProgress)
            
              this.progress = Math.round(100 * event.loaded / event.total);
            else if (event.type === HttpEventType.Response) {
            //  alert(event.type);
             // alert(HttpEventType.Response);
              this.message = 'Upload success.';
            this.onUploadFinished.emit(event.body);
            } else {
              this.message = 'in Else Event'+event.type;
            }
          });
      }
      
      uploadFiles(fileUpload) {
      //  console.log(this.FileUPloadForm);
        //console.log(this.FileUPloadForm.valid);

//console.log("Branch",this.FileUPloadForm.controls['BranchID'].value);
//console.log("TemplateID",this.FileUPloadForm.controls['TemplateID'].value);
          

if (this.myFiles.length >=1000)
{
      this.showmessage("You can not upload more than 1000 files.");
      return ;
}
          let allFilesSize = 0;
          for (var i = 0; i < this.myFiles.length; i++) { 
            allFilesSize += this.myFiles[i]['size'];

            // alert(this.myFiles[i]['size']);
            //   alert(this.myFiles[i]);
            //   alert(this.myFiles[i]['length']);
             // return ;
//             this.myFiles = [];
//             let strmsg =JSON.stringify(data);
// let x = strmsg.split(',');

          }
          if((allFilesSize / (1024*1024)) > 500) {
            this.toastr.show(
              '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Maximum 500MB is allowed to upload</span></div>',
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
            return;
          }
          if (this.FileUPloadForm.controls['BranchID'].value <= 0)
          {
            this.showmessage("Select folder");
             // return;

          }
          if (this.FileUPloadForm.controls['TemplateID'].value <= 0)
          {
            this.showmessage("Select Template");
              return;

          }
          if (this.FileUPloadForm.controls['SubfolderID'].value <= 0)
          {
            this.showmessage("Select SubfolderID");
            //  return;

          }
          var _UplaodBy ='0';
    //      alert(this.FileUPloadForm.get("UplaodBy").value);          
          
          if (this.FileUPloadForm.get("UplaodBy").value !="")
          {
            _UplaodBy ='1';

  //          alert(_UplaodBy); 
          }
         // alert(_UplaodBy); 
      
//return;


        
        if(this.FileUPloadForm.invalid) {
          this.toastr.show(
            '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Please Select <br> <b>Branch</b><br><b>Department</b><br><b>Document Type</b><br> before uploading!</span></div>',
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
        } else {
          const frmData = new FormData();
  

          for (var i = 0; i < this.myFiles.length; i++) { 
          //  console.log("FileSize",this.myFiles[i]);
            frmData.append("fileUpload", this.myFiles[i]);
           // frmData.append("FileSize", this.myFiles[i].);
          }
          frmData.append('BranchID',this.FileUPloadForm.controls['BranchID'].value);
          frmData.append('UplaodBy',_UplaodBy);
          frmData.append('DSConfigName',this.FileUPloadForm.controls['DSConfigName'].value);        
          frmData.append('DeptID',this.FileUPloadForm.controls['DeptID'].value);
          frmData.append('DocID',"0");
          frmData.append('TemplateID',this.FileUPloadForm.controls['TemplateID'].value);
          frmData.append('UserID',localStorage.getItem('UserID'));  
          frmData.append('SubfolderID',this.FileUPloadForm.controls['SubfolderID'].value);        
         
          const apiUrl = this._global.baseAPIUrl + 'FileUpload/UploadFiles';
          this.httpService.post(apiUrl, frmData).subscribe(
            data => {
              // SHOW A MESSAGE RECEIVED FROM THE WEB API.
          //    const splitted: string[] = toSplit.split(",");
       //   const splitted: string[] = data.split("$");
       //const splitted: string[] = strmsg.split("$");
       //const splitted: string[] = toSplit.split(",");
              fileUpload.clear();
              this.myFiles = [];
              let strmsg =JSON.stringify(data);
let x = strmsg.split(',');


//console.log(x[0]);

           //   let strmsg =data;
         //     this.myFiles = strmsg.split('-');
              
//               const stringToSplit =strmsg;
// var  ccc = stringToSplit.split('-')

            
//               var splitted = strmsg.split('-'); 

              this.toastr.show(
                '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success!</span> <span data-notify="message">' +x[0]+ ' </span></div>',
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
            //  console.log (this.sMsg);()
         //     var strmsg =data;
          this.downloadFile(data);
              this.OnReset();    
              this.myFiles = [];                   
            },
             
          );
        }

        
        }



        downloadFile(strmsg:any) {
          const filename = 'File upload status';
          
         // let csvData = "FileNo,";    
          //console.log(csvData)
          let blob = new Blob(['\ufeff' + strmsg], {
            type: 'text/csv;charset=utf-8;'
          });
          let dwldLink = document.createElement("a");
          let url = URL.createObjectURL(blob);
          let isSafariBrowser = -1;
          // let isSafariBrowser = navigator.userAgent.indexOf( 'Safari') != -1 & amp; & amp; 
          // navigator.userAgent.indexOf('Chrome') == -1; 
      
          //if Safari open in new window to save file with random filename. 
          if (isSafariBrowser) {
            dwldLink.setAttribute("target", "_blank");
          }
  
  
          dwldLink.setAttribute("href", url);
          dwldLink.setAttribute("download", filename + ".csv");
          dwldLink.style.visibility = "hidden";
          document.body.appendChild(dwldLink);
          dwldLink.click();
          document.body.removeChild(dwldLink);
        //}
        }  

        showmessage(data:any)
        {
          this.toastr.show(
            '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Validation ! </span> <span data-notify="message"> '+ data +' </span></div>',
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
      
        validation()
        {
            // if (this.FileUPloadForm.get('BranchID').value <=0 )
            // {
            //          this.showmessage("Please Select Branch");
            //           return false;
            // }

            if (this.FileUPloadForm.get('DeptID').value <=0 )
            {
                     this.showmessage("Please Select Department");
                      //return false;
            }
            return true;
      
        }  
        
        
        GetSubfolderByBranchID(BranchID:any) {
          //const apiUrl=this._global.baseAPIUrl+'BranchMapping/GetList?user_Token=123123'
          const apiUrl =this._global.baseAPIUrl +'SubfolderController/GetSubFolderByBranchID?UserID='+localStorage.getItem('UserID')+'&BrnachID='+BranchID+'&user_Token='+localStorage.getItem('User_Token');
          this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
            this.EntityList = data;
            this.FileUPloadForm.controls['SubfolderID'].setValue(0);
            //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
          });
        }


        formattedData: any = [];
        headerList: any;
        immutableFormattedData: any;
        loading: boolean = true;
        prepareTableData(tableData, headerList) {
          let formattedData = [];
         // alert(this.type);
        
        // if (this.type=="Checker" )
        //{
          let tableHeader: any = [
            { field: 'srNo', header: "SR NO", index: 1 },
            { field: 'name', header: 'File Name', index: 3 },
            { field: 'size', header: 'File Size', index: 2 },
        
             { field: 'type', header: 'File Type', index: 3 },
            // { field: 'Ref4', header: 'Ref4', index: 3 },
            // { field: 'Ref5', header: 'Ref5', index: 3 },
            // { field: 'Ref6', header: 'Ref6', index: 3 },
        //    { field: 'SubfolderName', header: 'SUB FOLDER', index: 3 }
            //,{ field: 'DownloadDate', header: 'DownloadDate', index: 3 },
           // { field: 'SendDate', header: 'SendDate', index: 7 }, { field: 'IsSend', header: 'IsSend', index: 8 },
        
          ];
          console.log("this.formattedData", tableData);
          tableData.forEach((el, index) => {
            formattedData.push({
              'srNo': parseInt(index + 1),
              'name': el.name,
               'size': el.size,
           
               'type': el.type,
              // 'Ref5': el.Ref5,
              // 'Ref6': el.Ref6
            
            });
         
          });
          this.headerList = tableHeader;
        //}
        
          this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
          this.formattedData = formattedData;
          this.loading = false;
        
         // console.log("this.formattedData", this.formattedData);
        }
        
        BindHeader(tableData, headerList) {
          let formattedData = [];
         // alert(this.type);
        
        // if (this.type=="Checker" )
        //{
          let tableHeader: any = [
            { field: 'srNo', header: "SR NO", index: 1 },
            { field: 'name', header: 'File Name', index: 3 },
            { field: 'size', header: 'File Size', index: 2 },
        
             { field: 'type', header: 'File Type', index: 3 },
            // { field: 'Ref4', header: 'Ref4', index: 3 },
            // { field: 'Ref5', header: 'Ref5', index: 3 },
            // { field: 'Ref6', header: 'Ref6', index: 3 },
        //    { field: 'SubfolderName', header: 'SUB FOLDER', index: 3 }
            //,{ field: 'DownloadDate', header: 'DownloadDate', index: 3 },
           // { field: 'SendDate', header: 'SendDate', index: 7 }, { field: 'IsSend', header: 'IsSend', index: 8 },
        
          ];
         
          
          this.headerList = tableHeader;
        //}
        
          this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
          this.formattedData = formattedData;
          this.loading = false;
        
        }
        
        
        searchTable($event) {
          // console.log($event.target.value);
        
          let val = $event.target.value;
          if(val == '') {
            this.formattedData = this.immutableFormattedData;
          } else {
            let filteredArr = [];
            const strArr = val.split(',');
            this.formattedData = this.immutableFormattedData.filter(function (d) {
              for (var key in d) {
                strArr.forEach(el => {
                  if (d[key] && el!== '' && (d[key]+ '').toLowerCase().indexOf(el.toLowerCase()) !== -1) {
                    if (filteredArr.filter(el => el.srNo === d.srNo).length === 0) {
                      filteredArr.push(d);
                    }
                  }
                });
              }
            });
            this.formattedData = filteredArr;
          }
        }

        
  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }
        
}
