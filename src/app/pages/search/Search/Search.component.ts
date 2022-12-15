import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef,EventEmitter,Output } from "@angular/core";
//import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';

import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from "@angular/forms";
import { Router, ActivatedRoute } from '@angular/router';

import { ToastrService } from "ngx-toastr";
import { HttpEventType, HttpClient } from '@angular/common/http';
import swal from "sweetalert2";
import { saveAs } from 'file-saver';
//import { Console } from "console";

declare var $: any;

export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-Search.component",
  templateUrl: "Search.component.html",
  styleUrls: ["Search.component.css"]
})
export class SearchComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;  
  _FilteredList :any; 
  _TemplateList :any;  
  TemplateList:any;
  SearchForm: FormGroup;
  submitted = false;
  Reset = false;     
  sMsg: string = '';  
  //UploadDocForm: FormGroup;  
  _SingleDepartment:any
  _ColNameList:any;
  BranchList: any;
  _BranchList: any;
  _FileNo: any = "";
  _PageNo: number = 1;
  FilePath:any="../assets/1.pdf";  
  _TempFilePath:any;
  _isDownload: any = localStorage.getItem('Download');
  _isDelete: any = localStorage.getItem('Delete');
  _TotalPages: any = 0;
  _SearchByList: any;
  userID = 1;
  TempField:any =localStorage.getItem('FileNo');
  _isEmail: any = false;
  _ShareLink: any = false;
  _isEdit: any = false;
  _DocTypeList: any;
  _FileList: any;
  _DocName: any;
  myFiles: string[] = [];
  _DocID: any;
  _MDList:any;
  _IndexList:any;
  _TempD:any;

  _FileDetails:string [][] = [];

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  
  get filters() { return this.SearchForm.get('filters') as FormArray; }

  @Output() public onUploadFinished = new EventEmitter();
      
    constructor(
      private modalService: BsModalService,
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
      document.body.classList.add('CS');
      this.SearchForm = this.formBuilder.group({
      FileNo: ['', Validators.required],
      TemplateID: [0, Validators.required],                
      _ColNameList: this._ColNameList,
      User_Token: localStorage.getItem('User_Token') ,
      CreatedBy: localStorage.getItem('UserID') ,
      Viewer: [''],
      currentPage: [0],      
      PageCount: [0],
      //tickets: new FormArray([]),
      SerchBy: [''],
      DocID: ['0'],
      SearchByID: [],
      userID: localStorage.getItem('UserID') ,
      ACC: [''],
      BranchID:['0'],
      MFileNo: [''],
      DocuemntType: [''],
      AccNo: [''],     
      ToEmailID:[''],
      ValidDate:[''],
      IsAttachment:[''],
      filters: this.formBuilder.array([]),
  
      });
      this.getTemplate();
      this._PageNo = 1;
     // this.getSearchResult(1);
      this.getSearchParameterList(1);
     
      this.geBranchList();


  this._isDownload =localStorage.getItem('Download');
  this._isDelete =localStorage.getItem('Delete');
  this._isEmail= localStorage.getItem('Email');
  this._ShareLink= localStorage.getItem('Link');
  this._isEdit= localStorage.getItem('Edit');   
    }
    

    geBranchList() {
      //const apiUrl=this._global.baseAPIUrl+'BranchMapping/GetList?user_Token=123123'
      const apiUrl =
        this._global.baseAPIUrl +
        "BranchMapping/GetBranchDetailsUserWise?ID=" +
        localStorage.getItem('UserID') +
        "&user_Token=" +
        this.SearchForm.get("User_Token").value;
      this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
        this.BranchList = data;
        this._FilteredList = data;
        //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
      });
    }
    onAddFilterRow() {
      let fg = this.formBuilder.group({
        Condition: ['0'],
        SearchByID: ['0'],
        Operation: ['0'],
        FileNo: [''],
        FieldType: [''],
        DateRange: [''],
        DateRangePicker: ['']
      })
      this.filters.push(fg)
    }
    onRemoveRow(indx) {
      this.filters.removeAt(indx)
    }
    onSearchBySelected(i){
      // console.log('SearchByID in form',this.SearchForm.get('SearchByID'));
      let selectedVal = this.filters.at(i).value.SearchByID
      // console.log('selectedVal',selectedVal);
      let selectedDataType = this._SearchByList.find(s=>s.SID == selectedVal)
      //this.SearchForm.get('FieldType').setValue(selectedDataType.FieldType)
      // console.log('Filter Array',this.filters.at(i), selectedDataType);
      
      this.filters.at(i).patchValue({"FieldType": selectedDataType.FieldType})
      // console.log("FieldType",selectedDataType.FieldType, this.filters.at(i));
    }

    onDateOperationChange(i) {
      this.filters.at(i).patchValue({"DateRange": this.filters.at(i).value.Operation});
    }

    
    onFilterSubmited() {
     // console.log(this.SearchForm.value)

      //SearchFileStatus/getSearchDataByFolderStructure

      const apiUrl = this._global.baseAPIUrl + 'SearchFileStatus/OnDynamicFilterData';
   
      this._onlineExamService.postData(this.SearchForm.value, apiUrl)
        .subscribe(data => {

     // console.log("FilterData",data);

      this._FileList = data;
      this._FilteredList = data;
      this.GetDisplayField(this.SearchForm.get('TemplateID').value);
  
        }); 

    }
    
    OnLoad()
    {
      this.getSearchResult(this._isEdit);
    }
    
    entriesChange($event) {
      this.entries = $event.target.value;
    }
    filterTable($event) {
     // console.log($event.target.value);
  
      let val = $event.target.value;
      this._FilteredList = this._FileList.filter(function (d) {
      //  console.log(d);
        for (var key in d) {
          if (key == "AccNo" || key == "BranchName" || key == "DocType" ) {
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
      this.SearchForm.reset();  

      }
      // refreshPage() {
      //   window.location.reload(); 
      // } 

      getSearchParameterList(TID:any) {
    
        const apiUrl = this._global.baseAPIUrl + 'SearchFileStatus/getSearchParameterList?ID=' + TID + '&user_Token='+ localStorage.getItem('User_Token')
    
        //  const apiUrl=this._global.baseAPIUrl+'SearchFileStatus/getSearchParameterList?user_Token=123123'
        this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
          this._SearchByList = data;
          
        this.SearchForm.controls['SearchByID'].setValue(0);
          //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
        });
      }

      getDoctypeListByTempID(TID:any) {
    
        //const apiUrl=this._global.baseAPIUrl+'BranchMapping/GetList?user_Token=123123'
        const apiUrl = this._global.baseAPIUrl + 'DocTypeMapping/getDoctypeListByTempID?ID=' + localStorage.getItem('UserID') + '&TemplateID='+ TID +'&user_Token='+this.SearchForm.get('User_Token').value
//      console.log("apiUrl",apiUrl);      
        this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
          this._DocTypeList = data;
         this.SearchForm.controls['DocID'].setValue("0");
        //  console.log("_DeptList",this._DeptList);

          //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
        });
      }


      geTemplateNameListByTempID(TID: number) {      
        
        this.getSearchParameterList(TID);
        this.getDoctypeListByTempID(TID);
        this.getSearchResult(TID);
      
      }

      GetFilterSearch(tid:any)
      {
        this.GetFilterData(this.SearchForm.get('TemplateID').value);


      }

      getTemplate() {

        const apiUrl = this._global.baseAPIUrl + 'TemplateMapping/GetTemplateMappingListByUserID?UserID=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token');
    
        // const apiUrl = this._global.baseAPIUrl + 'Template/GetTemplate?user_Token=' + this.FileStorageForm.get('User_Token').value
        this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
          this.TemplateList = data;
       
          this.SearchForm.controls['TemplateID'].setValue(data[0].TemplateID);
          //this.AddEditBranchMappingForm.controls['UserIDM'].setValue(0);
          //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
        console.log("TempID",data[0].TemplateID);
        this._TempD = data[0].TemplateID;
     //    this.getSearchResult(data[0].TemplateID);
        this.geTemplateNameListByTempID(this._TempD);

        });
      }
      // getSearchResult() {
    
      //   const apiUrl = this._global.baseAPIUrl + 'SearchFileStatus/getSearchData';
      //   //this._onlineExamService.postData(this.AdvancedSearchForm.value,apiUrl)
    
      //   //  const apiUrl=this._global.baseAPIUrl+'SearchFileStatus/getSearchData?FileNo='+ __FileNo + '&user_Token=123123'
      //   this._onlineExamService.getAllDataWithFormValue(this.AdvancedSearchForm.value, apiUrl).subscribe((data: {}) => {
      //     //this._TagDetailsList = data;  
      //     this._FileList = data;
      //     this._FilteredList = data;
      //     //let len= this._FileList.length;
      //     if (this._FileList.length <= 0) {
      //       alert("Record Not Found.");
      //     }
    
      //   });
      //   //this.FileTaggingForm.controls['DocID'].setValue(0);
      // }
    
      getSearchResult(tempID:any) {

     //   const apiUrl = this._global.baseAPIUrl + 'TaggingDetails/GetPendingData?UserID=' + localStorage.getItem('UserID') + '&user_Token='+ localStorage.getItem('User_Token');
     
      //    const apiUrl = this._global.baseAPIUrl + 'SearchFileStatus/getSearchDataByFolderStructure?UserID=' + localStorage.getItem('UserID') + '&user_Token='+ localStorage.getItem('User_Token');
      const apiUrl = this._global.baseAPIUrl + 'SearchFileStatus/getSearchDataByFolderStructure?UserID=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token') + '&TemplateID=' + tempID  
     
      // const apiUrl="https://demo2993066.mockable.io/getAllData";
    this._onlineExamService.getAllData(apiUrl).subscribe((data: [any]) => {
          this._FileList = data;
          this._FilteredList = data;
          this.GetDisplayField(tempID);

         // console.log("Loggg",data);
        });
      }
      
    GetDisplayField(TID:number) {
      const apiUrl=this._global.baseAPIUrl+'DataUpload/GetFieldsName?ID='+TID+'&user_Token='+ localStorage.getItem('User_Token') 
      this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {     
        this._ColNameList = data;
        this.prepareTableData(this._FilteredList, this._ColNameList);
      });
    }

    
    formattedData: any;
    headerList: any;
    immutableFormattedData: any;
    loading: boolean = true;
    prepareTableData(tableData, headerList) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        // { field: 'accId', header: 'Acc ID', index: 2 },
        { field: 'branch', header: 'CUSTOMER', index: 2 },
        // { field: 'TemplateName', header: 'TemplateName', index: 3 },
      //  { field: 'department', header: 'Department', index: 4 },
        // { field: 'docType', header: 'Doc Type', index: 5 },
        { field: 'pageCount', header: 'PAGE COUNT', index:36 }
      ];
      headerList.forEach((el, index) => {
        tableHeader.push({
          field: 'metadata-' + parseInt(index+1), header: el.DisplayName, index: parseInt(7+index)
        })
      })
      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'accId': el.Ref1,
          'branch': el.BranchName,
          'TemplateName': el.TemplateName,
        //  'department': el.DepartmentName,
          // 'docType': el.DocType,
          'pageCount': el.DocCount,
          'AccNo': el.AccNo,
          'TemplateID': el.TemplateID,
          // 'RelPath': el.RelPath,
          // 'FilePath': el.FilePath,
          'ACC': el.ACC,
          // 'DocID': el.DocID,
          // 'profileImg': el.PhotoPath
        });
        headerList.forEach((el1, i) => {
          formattedData[index]['metadata-' + parseInt(i + 1)] = el['Ref'+ parseInt(i+1)]
        });
      });
      this.headerList = tableHeader;
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


    
      // DownloadFileAll(_FileNo: any, _FilePath: any) {

      //   const apiUrl = this._global.baseAPIUrl + 'SearchFileStatus/DownloadFile_Test?ID=' + localStorage.getItem('UserID') + '&_filePath= '+ _FilePath +' &user_Token='+ localStorage.getItem('User_Token');
      //   this._onlineExamService.downloadDoc(apiUrl).subscribe(res => {
      //     if (res) {         
   
      // //      var __FilePath = _TempFilePath ;    
      //     //  console.log("Final FP-- res ", res);   
      //       saveAs(res, _FileNo + '.pdf');

      //     }
      //   });
    
      // }



      DownloadFileAll(_FileNo: any) {

        
        const apiUrl = this._global.baseAPIUrl + 'SearchFileStatus/DownloadFileFromDB?ID=' + localStorage.getItem('UserID') + '&FileNo= ' + _FileNo + ' &user_Token=' + localStorage.getItem('User_Token');
        this._onlineExamService.downloadDoc(apiUrl).subscribe(res => {
          if (res) {
    
            //      var __FilePath = _TempFilePath ;    
            // console.log("Final FP-- res ", res);
            saveAs(res, _FileNo + '.pdf');
    
          }
        });
        
      }

    
//       downloadFile(_fileName: any) {
       
//         const apiUrl = this._global.baseAPIUrl + 'SearchFileStatus/DownloadFile_Test?ID=' + localStorage.getItem('UserID') + '&_fileName= '+ _fileName +' &user_Token='+ localStorage.getItem('User_Token');
//         this._onlineExamService.downloadDoc(apiUrl).subscribe(res => {
//           if (res) {
             
// //      var __FilePath = _TempFilePath ;    
//   console.log("Final FP-- res ", res);   
//       saveAs(res, _fileName + '.pdf');
//     // saveAs(__FilePath, _fileName + '.pdf');
           
//         //     var url1 = window.URL.createObjectURL(res);
//         // window.open(url1);
//         // console.log("download result ", res);


//             //alert(res);
//          //   console.log("Res",this._onlineExamService.DownloadFile() + res.FileName);

//           //   var oReq = new XMLHttpRequest();
//           //   oReq.open("GET", this._onlineExamService.DownloadFile() + res.FileName, true);
//           //   oReq.responseType = "blob";

//           //   var file = new Blob([oReq.response], { 
//           //     type: 'application/pdf' 
//           // });

//           // saveAs(file, "mypdffilename.pdf");

//             // const link = document.createElement('a');
//             // link.href =this._onlineExamService.DownloadFile() + res.FileName; //window.URL.createObjectURL(blob);
//             // link.download = res.FileName;
//             // link.click();



//             // if(this._StatusList.length>0) {
//             //   let blob = new Blob(['\ufeff' +  csvData], { 
//             //       type: 'text/csv;charset=utf-8;'
//             //   }); 
//               // let dwldLink = document.createElement("a"); 
//               // let url =this._onlineExamService.DownloadFile() + res.FileName // URL.createObjectURL(this._onlineExamService.DownloadFile() + res.FileName); 
//               // let isSafariBrowser =-1;
//               // let isSafariBrowser = navigator.userAgent.indexOf( 'Safari') != -1 & amp; & amp; 
//               // navigator.userAgent.indexOf('Chrome') == -1; 
              
//               //if Safari open in new window to save file with random filename. 
//               // if (isSafariBrowser) {  
//               //     dwldLink.setAttribute("target", "_blank"); 
//               // } 
//               // dwldLink.setAttribute("href", url); 
//               // dwldLink.setAttribute("download",  "PDFFile" + ".pdf"); 
//               // dwldLink.style.visibility = "hidden"; 
//               // document.body.appendChild(dwldLink); 
//               // dwldLink.click(); 
//               // document.body.removeChild(dwldLink); 

//            // window.open(this._onlineExamService.DownloadFile() + res.FileNamel, '_blank', '', true);
//                 //             let headers = new HttpHeaders();
//                 // headers = headers.set('Accept', 'application/pdf');
//                 // return this.http.get(this._onlineExamService.DownloadFile() + res.FileNamel, { headers: headers, responseType: 'blob' });

//            // window.location.assign(this._onlineExamService.DownloadFile() + res.FileNamel);
//             //window.location.href = this._onlineExamService.DownloadFile() + res.FileName;
//             console.log("L----");
//            // FileSaver.saveAs(pdfUrl, pdfName);
//            // file saveAs(this._onlineExamService.DownloadFile() + res.FileName,_fileName);
//             //window.open(this._onlineExamService.DownloadFile() + res.FileName);
//           }
//         });
    
//       }


      downloadFile(row: any) {

        const apiUrl = this._global.baseAPIUrl + 'SearchFileStatus/DownloadTagFile?ID='+localStorage.getItem('UserID')+'&DocID='+row.DocID+'&_fileName='+row.AccNo+'&user_Token='+localStorage.getItem('User_Token');
        this._onlineExamService.downloadDoc(apiUrl).subscribe(res => {
          if (res) {
          
              saveAs(res, row.ACC + '.pdf');

          }
        });
    
      }
        
      Setfavourite(FileName: any) {

        this.SearchForm.patchValue({
          ACC: FileName,
          User_Token: localStorage.getItem('User_Token'),
          userID: localStorage.getItem('UserID')
        });
    
        const apiUrl = this._global.baseAPIUrl + 'SearchFileStatus/Setfavourite';
        this._onlineExamService.postData(this.SearchForm.value, apiUrl)
        .subscribe( data => {
          swal.fire({
            title: "Favourite!",
            text: "Doc Type has been favourite",
            type: "success",
            buttonsStyling: false,
            confirmButtonClass: "btn btn-primary",
          });
          
        });
    
      }
    
      DeleteFile(Row: any) {
        swal
          .fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            type: "warning",
            showCancelButton: true,
            buttonsStyling: false,
            confirmButtonClass: "btn btn-danger",
            confirmButtonText: "Yes, delete it!",
            cancelButtonClass: "btn btn-secondary",
          })
          .then((result) => {
            if (result.value) {
              this.SearchForm.patchValue({
                ACC: Row.AccNo,
                User_Token: localStorage.getItem('User_Token'),
                userID: localStorage.getItem('UserID'),
                DocID: Row.DocID
              });

              const that = this;
              const apiUrl = this._global.baseAPIUrl + 'SearchFileStatus/Delete';
              this._onlineExamService.postData(this.SearchForm.value,apiUrl)     
              .subscribe( data => {
                  swal.fire({
                    title: "Deleted!",
                    text: "Doc Type has been deleted.",
                    type: "success",
                    buttonsStyling: false,
                    confirmButtonClass: "btn btn-primary",
                  });
                  that.getSearchResult(that.SearchForm.get('TemplateID').value);
                });

            }
          });
       
      }

      // Model Popup For Docuemnt Inserstion 
    
      showModal(Row: any): void {
    
        if (Row != null) {
          this._FileNo = Row.AccNo;
          this._DocID = Row.DocID;
          this._DocName = Row.ACC
          this.SearchForm.controls['MFileNo'].setValue(this._FileNo);
          this.SearchForm.controls['DocuemntType'].setValue(this._DocName);
        }
        // 
       $("#myModal").modal('show');
    
    
      }
      sendModal(): void {
        //do something here
        this.hideModal();
      }
      hideModal(): void {
        document.getElementById('close-modal').click();
        //this.getSearchResult();
      }

      ClosePopup(): void {
      //  document.getElementById('close-modal').click();
        //this.getSearchResult();
      //  this.modalRef.hide();
       // this.getSearchResult(this.SearchForm.get('TemplateID').value);

      }

      getFileDetails(e) {
        //console.log (e.target.files);
        for (var i = 0; i < e.target.files.length; i++) {
          this.myFiles.push(e.target.files[i]);
        //  console.log("File",this.myFiles);

        }
        let selectedFileNames = '';
        this.myFiles.forEach(el => {
          selectedFileNames += el['name'] + '<br />';
        })
        $(".selected-file-name").html(selectedFileNames);
        //this._IndexList = e.target.files;
      }
    
      
    
    
      EditRowData(Row: any) {
        
        localStorage.setItem('FileNo', Row.AccNo);
        localStorage.setItem('TemplateID', Row.TemplateID);
        
        //this.localStorage.setItem('_TempID') =_TempID;
        this.router.navigate(['/process/EditIndexing']);
      }


      MetaData(template: TemplateRef<any>, row: any)
      {
        //FileNo: localStorage.getItem('FileNo'),
      //  TemplateID:localStorage.getItem('TemplateID')  
      let  __FileNo =row.AccNo;
      let  __TempID = row.TemplateID;

      const apiUrl=this._global.baseAPIUrl+'DataEntry/GetNextFile?id='+__TempID+'&FileNo='+__FileNo+'&user_Token='+ localStorage.getItem('User_Token');
  
      //const apiUrl=this._global.baseAPIUrl+'DataEntry/GetNextFile?id'+  + '' FileNo='+ __FileNo + '&user_Token=123123'
      this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
  
         this._IndexList = data;           
         //console.log("Index",data);
      });
      // this.modalRef = this.modalService.show(template);
      }
    hidepopup()
    {
    // this.modalService.hide;
      this.modalRef.hide();
      //this.modalRef.hide
    }

     

    ViewDocument(template: TemplateRef<any>, row: any, indexTemplate: TemplateRef<any>) {
      this.MetaData(indexTemplate, row);
     // this.FilePath = row.RelPath;
     // this._TempFilePath =row.RelPath;
      this.modalRef = this.modalService.show(template);
      $(".modal-dialog").css('max-width', '1330px');
      this.GetDocumentDetails(row);
      this.GetFullFile(row.AccNo);
    }

    GetFullFile(FileNo:any) {

      const apiUrl = this._global.baseAPIUrl + 'SearchFileStatus/GetFullFile?ID='+localStorage.getItem('UserID')+'&&_fileName='+ FileNo +'&user_Token='+localStorage.getItem('User_Token');
      this._onlineExamService.getDataById(apiUrl).subscribe(res => {
        if (res) {
  
      //  console.log("9090res",res);
          this.FilePath = res;
           /// saveAs(res, row.ACC + '.pdf');
           this._TempFilePath = res;
  
        }
      });
    }
    

    profileImg: any;
    documentDetails: any;
    GetDocumentDetails(row: any) {      
      this.profileImg = row.profileImg;
     // console.log("row.Photopath",row);
      const apiUrl = this._global.baseAPIUrl + 'SearchFileStatus/GetDocumentDetails?FileNo=' + row.AccNo + '&UserID=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token')

      // const apiUrl="https://demo2993066.mockable.io/getAllData";

      this._onlineExamService.getAllData(apiUrl).subscribe((data: [any]) => {

        // this._IndexList = data;
        // this._FilteredList = data;
        this.documentDetails = data;
      });
    }

    showDocument(doc) {

     /// this.FilePath = doc.RelPath;
      //console.log("Row**",doc);
      const apiUrl = this._global.baseAPIUrl + 'SearchFileStatus/GetTagFile?ID='+localStorage.getItem('UserID')+'&DocID='+doc.DocID+'&_fileName='+doc.AccNo+'&user_Token='+localStorage.getItem('User_Token');
      this._onlineExamService.getDataById(apiUrl).subscribe(res => {
        if (res) {
  
      //    console.log("res",res);
          this.FilePath = res;


           /// saveAs(res, row.ACC + '.pdf');
  
        }
      });
    }

    ngOnDestroy() {
      document.body.classList.remove('CS');
    }

    selectAllRows = false;
    selectAllRow(e) {
      this.selectedRows = [];
      this.selectedRowsForMetadata = [];
      if (e.checked) {
        this.selectAllRows = true;
        this.formattedData.forEach(el => {
          this.selectedRows.push(el.AccNo);
          this.selectedRowsForMetadata.push(el.AccNo);
        })
      } else {
        this.selectAllRows = false;
    }
  }

  selectedRows = [];
  selectedRowsForMetadata = [];
  selectRow(e, row) {
    this.selectAllRows = false;
    e.originalEvent.stopPropagation();
    if (e.checked) {
     // this.selectedRows.push(row.AccNo +"_" + row.DocID);
     this.selectedRows.push(row.AccNo);
      this.selectedRowsForMetadata.push(row.AccNo);
    } else {
    //  var index = this.selectedRows.indexOf(row.AccNo +"_" + row.DocID);
    var index = this.selectedRows.indexOf(row.AccNo);
      this.selectedRows.splice(index, 1);
      var indexMetadata = this.selectedRows.indexOf(row.AccNo);
      this.selectedRows.splice(indexMetadata, 1);
    }
  }

  

  DownloadBulkFiles() {
   // console.log("DownloadBulkFiles", this.selectedRows);

    let _CSVData= "";
    for (let j = 0; j < this.selectedRows.length; j++) {          
      _CSVData += this.selectedRows[j] + ',';
      // headerArray.push(headers[j]);  
     // console.log("CSV Data", _CSVData);
    }
   // console.log("CSV Data", _CSVData);
    this.downloadBulkFileBYCSV(_CSVData) ;
  }

  downloadBulkFileBYCSV(_CSVData:any) {
       
    const apiUrl = this._global.baseAPIUrl + 'SearchFileStatus/SearchBulkFile?ID=' + localStorage.getItem('UserID') + '&_fileName= '+  _CSVData +' &user_Token='+ localStorage.getItem('User_Token');
    this._onlineExamService.downloadDoc(apiUrl).subscribe(res => {
      if (res) {

      
      saveAs(res, "Files" + '.zip');  
       
      }
      // console.log("Final FP-- res ", res);  
    });

  }
  _HeaderList: any;
  GetHeaderNames()
{
  this._HeaderList="";
  for (let j = 0; j < this._ColNameList.length; j++) {  
       
      this._HeaderList += this._ColNameList[j].DisplayName +((j <= this._ColNameList.length-2)?',':'') ;
    // headerArray.push(headers[j]);  
  }
  this._HeaderList += '\n';
  let that = this;
  this._MDList.forEach(stat => {
    // if ( that.selectedRows.indexOf(stat['Ref1']) > -1 ) {
      for (let j = 0; j < this._ColNameList.length; j++) {
        this._HeaderList += (j==0?(stat['Ref'+(j+1)]+''):stat['Ref'+(j+1)]) + ((j <= this._ColNameList.length-2)?',':'') ;
      }
    // }
    this._HeaderList += '\n'
  });
  

}


GetFilterData(tempID:any) {

  //   const apiUrl = this._global.baseAPIUrl + 'TaggingDetails/GetPendingData?UserID=' + localStorage.getItem('UserID') + '&user_Token='+ localStorage.getItem('User_Token');
  
   //    const apiUrl = this._global.baseAPIUrl + 'SearchFileStatus/getSearchDataByFolderStructure?UserID=' + localStorage.getItem('UserID') + '&user_Token='+ localStorage.getItem('User_Token');
   const apiUrl = this._global.baseAPIUrl + 'SearchFileStatus/getSearchDataByFilter?UserID=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token') + '&TemplateID='+this.SearchForm.get('TemplateID').value+'&BranchID='+this.SearchForm.get('BranchID').value+'&SearchParamterID='+this.SearchForm.get('SearchByID').value+'&SearchValues='+this.SearchForm.get('FileNo').value  
  
   // const apiUrl="https://demo2993066.mockable.io/getAllData";
 this._onlineExamService.getAllData(apiUrl).subscribe((data: [any]) => {
       this._FileList = data;
       this._FilteredList = data;
       this.GetDisplayField(tempID);

      // console.log("Loggg1111",data);
     });
   }

  DownloadMetadata() {
    let _CSVData = "";
    for (let j = 0; j < this.selectedRowsForMetadata.length; j++) {          
      _CSVData += this.selectedRowsForMetadata[j] + ',';
    }
        const apiUrl = this._global.baseAPIUrl + 'Status/GetMetaDataReportByFileNo?FileNo=' + _CSVData + '&user_Token=' + localStorage.getItem('User_Token')+'&UserID='+localStorage.getItem('UserID')
   // const apiUrl = this._global.baseAPIUrl + 'Status/GetMetaDataReportByFileNo?FileNo=' + _CSVData + '&user_Token=' + localStorage.getItem('User_Token')
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._MDList = data;
      this.GetHeaderNames();
      let csvData = this._HeaderList; 
      // alert(this._HeaderList);
      // console.log("Data",csvData) 
      let blob = new Blob(['\ufeff' + csvData], { 
          type: 'text/csv;charset=utf-8;'
      }); 
      let dwldLink = document.createElement("a"); 
      let url = URL.createObjectURL(blob);
      
      let isSafariBrowser =-1;
      // let isSafariBrowser = navigator.userAgent.indexOf( 'Safari') != -1 & amp; & amp; 
      // navigator.userAgent.indexOf('Chrome') == -1; 
      
      //if Safari open in new window to save file with random filename. 
      if (isSafariBrowser) {  
          dwldLink.setAttribute("target", "_blank"); 
      } 
      dwldLink.setAttribute("href", url); 
      dwldLink.setAttribute("download", 'Metadata' + ".csv"); 
      dwldLink.style.visibility = "hidden"; 
      document.body.appendChild(dwldLink); 
      dwldLink.click(); 
      document.body.removeChild(dwldLink);
    });

  }


  ShareLink(template: TemplateRef<any>)
  {
    var that = this;
  //console.log("Email", this.selectedRows);
    let _CSVData= "";
    for (let j = 0; j < this.selectedRows.length; j++) {          
      _CSVData += this.selectedRows[j] + ',';
      // headerArray.push(headers[j]);  
     // console.log("CSV Data", _CSVData);
    }
    this.SearchForm.controls['ACC'].setValue(_CSVData);
    this.SearchForm.controls['FileNo'].setValue(_CSVData);
  
    // if (_CSVData != null) {
     
    // }

    this.modalRef = this.modalService.show(template);

  }

  onSendEmailByShare() {

    const apiUrl = this._global.baseAPIUrl + 'Mail/SendEmailBulkFiles';
   
    this._onlineExamService.postData(this.SearchForm.value, apiUrl)
      .subscribe(data => {
        swal.fire({
          title: "Email!",
          text: "Email send successfully",
          type: "success",
          buttonsStyling: false,
          confirmButtonClass: "btn btn-primary",
        });

      }); 
      this.modalRef.hide();
 
     
  }
  SendBulkEmail(template: TemplateRef<any>)
  {
    var that = this;
  //console.log("Email", this.selectedRows);
    let _CSVData= "";
    for (let j = 0; j < this.selectedRows.length; j++) {          
      _CSVData += this.selectedRows[j] + ',';
      // headerArray.push(headers[j]);  
     // console.log("CSV Data", _CSVData);
    }
    this.SearchForm.controls['ACC'].setValue(_CSVData);
    this.SearchForm.controls['FileNo'].setValue(_CSVData);
  
    // if (_CSVData != null) {
     
    // }
    this.modalRef = this.modalService.show(template);

  }

  onSendEmail() {

  const apiUrl = this._global.baseAPIUrl + 'Mail/SendEmail';
  //  const apiUrl = this._global.baseAPIUrl + 'SearchFileStatus/SendBulkTagFileOnMail?ID='+localStorage.getItem('UserID')+'&DocID='+1+'&_fileName='+ this.SearchForm.controls['FileNo'].value +'&user_Token='+localStorage.getItem('User_Token');
    
    this._onlineExamService.postData(this.SearchForm.value, apiUrl)
      .subscribe(data => {
        swal.fire({
          title: "Email!",
          text: "Email send successfully",
          type: "success",
          buttonsStyling: false,
          confirmButtonClass: "btn btn-primary",
        });

      }); 
      this.modalRef.hide();
     // this.getSearchResult();   
  }
  
      
}
