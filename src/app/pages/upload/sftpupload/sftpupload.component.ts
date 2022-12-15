import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, EventEmitter,Output } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from '@angular/router';
import swal from "sweetalert2";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-sftpupload",
  templateUrl: "sftpupload.component.html",
})
export class SftpUploadComponent implements OnInit {
entries: number = 10;
selected: any[] = [];
temp = [];
activeRow: any;
SelectionType = SelectionType;
modalRef: BsModalRef;
_SingleDepartment: any;
submitted = false;
Reset = false;     
BranchList:any;
sMsg: string = '';      
_FilteredList = []; 
TemplateList:any;
_FileList:any;
_Records :any; 
sftpuploadForm: FormGroup;

public message: string;
_HeaderList: any;
_ColNameList = [];
_CSVData: any;
public records: any[] = [];
_DepartmentList:any;
_TempID: any = 0;

myFiles:string [] = [];
_FileDetails:string [][] = [];
first = 0;
rows = 10;

@Output() public onUploadFinished = new EventEmitter();
  constructor(
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private route: ActivatedRoute,
    private router: Router,
  ) {}
  ngOnInit() {
    this.sftpuploadForm = this.formBuilder.group({
      BranchID: ['',],
      DeptID: [""],
      User_Token: localStorage.getItem('User_Token') ,
      CreatedBy: localStorage.getItem('UserID') ,

    });     

    this.Getpagerights();

   // this.getBranchList();
this.GetCountOnly();
this.getDepartmnet();
this.geBranchList(0);

//this.BindHeader( this._FilteredList, this._FilteredList);
  }   


  Getpagerights() {

    var pagename ="Sftp Upload";
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

  getDepartmnet() {

    const apiUrl=this._global.baseAPIUrl+'Department/GetList?user_Token='+ localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
    this._DepartmentList = data;
   // this._DepartmentLists=data;
    //console.log("data : -", data);

    this.sftpuploadForm.controls['DeptID'].setValue(0);
   
    //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
    });

    }

  entriesChange($event) {
    this.entries = $event.target.value;
  }
  filterTable($event) {
    console.log($event.target.value);

    let val = $event.target.value;
    let that = this
    this._FilteredList = this.records.filter(function (d) {
      console.log(d);
      for (var key in d) {
        if (d[key].toLowerCase().indexOf(val) !== -1) {
          return true;
        }
      }
      return false;
    });
  }
  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
  onActivate(event) {
    this.activeRow = event.row;
  }

  OnReset() {
    this.Reset = true;
    this.sftpuploadForm.reset();
    this.sftpuploadForm.controls['User_Token'].setValue(localStorage.getItem('User_Token')); 
    this.sftpuploadForm.controls['UserID'].setValue(localStorage.getItem('UserID'));    
    this.sftpuploadForm.controls['CreatedBy'].setValue(localStorage.getItem('UserID'));    
   // this.getTemplate();
 //  this.sftpuploadForm.controls['TemplateID'].setValue(0);
  }

  // getBranchList() {
  //   //const apiUrl=this._global.baseAPIUrl+'BranchMapping/GetList?user_Token=123123'
  //   const apiUrl =
  //     this._global.baseAPIUrl +
  //     "BranchMapping/GetBranchDetailsUserWise?ID=" +
  //     localStorage.getItem('UserID') +
  //     "&user_Token=" +
  //     this.sftpuploadForm.get("User_Token").value;
  //   this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
  //     this.BranchList = data;
  //    // this._FilteredList = data;
  //     this.sftpuploadForm.controls['BranchID'].setValue(0);
  //     //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
  //   });
  // }

  GetCountOnly() {
    //const apiUrl=this._global.baseAPIUrl+'BranchMapping/GetList?user_Token=123123'
    const apiUrl =
      this._global.baseAPIUrl +
      "FileUpload/GetCountOnly?ID=" +
      localStorage.getItem('UserID') +
      "&user_Token=" +
      this.sftpuploadForm.get("User_Token").value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this._FileList = data;
      this._FilteredList = data;  
      this.prepareTableData( this._FilteredList, this._FilteredList);  
     
    });
  }

  GetFileCount() {

    var bid =this.sftpuploadForm.get("BranchID").value;
    if (bid ==null)
    {

      bid=0;
    }

   

    //const apiUrl=this._global.baseAPIUrl+'BranchMapping/GetList?user_Token=123123'
      const apiUrl =this._global.baseAPIUrl +"FileUpload/GetFileCount?ID="+this.sftpuploadForm.get("DeptID").value+"&user_Token="+this.sftpuploadForm.get("User_Token").value+"&BranchID="+bid;
      this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this._FileList = data;
      this._FilteredList = data;   

      this.prepareTableData( this._FilteredList, this._FilteredList);
     
    });
  }

  geBranchListByUserID(userid: number) {
    //     alert(this.BranchMappingForm.value.UserID);
    this.geBranchList(userid);
  }
 
  geBranchList(userid: any) {
    //const apiUrl=this._global.baseAPIUrl+'BranchMapping/GetList?user_Token=123123'
    const apiUrl =
      this._global.baseAPIUrl +
      "BranchMapping/GetBranchDetailsRegionWise?ID=" +
      userid +
      "&user_Token=" +
      this.sftpuploadForm.get("User_Token").value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this.BranchList = data;
      // this._FilteredList = data;
       this.sftpuploadForm.controls['BranchID'].setValue(0);
      //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
    });
  }


  onSubmit() {

    //     this.submitted = true;
    //     if (this.validation() == false ) {
    //     alert("Please Fill the Fields");
    //     return;  
    // } 

    // this.sftpuploadForm.patchValue({
    //   id: localStorage.getItem('UserID'),
    //   CSVData: this._CSVData,     
    //   User_Token: localStorage.getItem('User_Token')    

    // });
    

    const apiUrl = this._global.baseAPIUrl + 'FileUpload/SftpFileupload';
    this._onlineExamService.postData(this.sftpuploadForm.value, apiUrl)
      // .pipe(first())
      .subscribe(data => {
         
        this.toastr.show(
          '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success!</span> <span data-notify="message"> File Uploaded Succesfully. </span></div>',
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

        var strmsg =data;
        this.downloadFile(data);

      });

    //  }     

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
          "ngx-toastr alert alert-dismissible alert-success alert-notify"
      }
    );


  }

  validation()
  {
    
      if (this.sftpuploadForm.get('TemplateID').value <=0 )
      {
               this.showmessage("Please Select Template ID");
                return false;
      }


      return true;

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
      { field: 'DepartmentName', header: 'CABINET', index: 3 },
      { field: 'TemplateName', header: 'TEMPLATE', index: 2 },
  
       { field: 'BranchName', header: 'FOLDER', index: 3 },
       { field: 'SubfolderName', header: 'SUB FOLDER', index: 3 },
      { field: 'FileCount', header: 'FILE COUNT', index: 3 },
      // { field: 'Ref6', header: 'Ref6', index: 3 },
  //    { field: 'SubfolderName', header: 'SUB FOLDER', index: 3 }
      //,{ field: 'DownloadDate', header: 'DownloadDate', index: 3 },
     // { field: 'SendDate', header: 'SendDate', index: 7 }, { field: 'IsSend', header: 'IsSend', index: 8 },
  
    ];
    console.log("this.formattedData", tableData);
    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'DepartmentName': el.DepartmentName,
         'TemplateName': el.TemplateName,
     
         'BranchName': el.BranchName,
         'SubfolderName': el.SubfolderName,
      'FileCount': el.FileCount
      
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
      { field: 'DepartmentName', header: 'CABINET', index: 3 },
      { field: 'TemplateName', header: 'TEMPLATE', index: 2 },
  
       { field: 'BranchName', header: 'FOLDER', index: 3 },
       { field: 'SubfolderName', header: 'SUB FOLDER', index: 3 },
      { field: 'FileCount', header: 'FILE COUNT', index: 3 },
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
