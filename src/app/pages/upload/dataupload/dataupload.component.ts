import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, EventEmitter,Output } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import swal from "sweetalert2";
import { Router, ActivatedRoute } from '@angular/router';

export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-dataupload",
  templateUrl: "dataupload.component.html",
})
export class DataUploadComponent implements OnInit {
entries: number = 10;
selected: any[] = [];
temp = [];
activeRow: any;
SelectionType = SelectionType;
modalRef: BsModalRef;
_SingleDepartment: any;
submitted = false;
Reset = false;     
sMsg: string = '';      
_FilteredList = []; 
TemplateList:any;
_IndexList:any;
_Records :any; 
DataUploadForm: FormGroup;
isFileInvalid = true;
public message: string;
_HeaderList: any;
_ColNameList = [];
_CSVData: any;
public records: any[] = [];
papa: any;
_TempID: any = 0;

myFiles:string [] = [];
_FileDetails:string [][] = [];
isValidationError: any;

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
    this.DataUploadForm = this.formBuilder.group({
      TemplateName: ['', Validators.required],
      User_Token: localStorage.getItem('User_Token') ,
      CreatedBy: localStorage.getItem('UserID') ,
      id:[0],
      UplaodBy:[],
      TemplateID: [0, Validators.required],
       CSVData:[""]
    });     

    this.geTTempList();

    this.Getpagerights();
  }



  Getpagerights() {

    var pagename ="CSV Upload";
    const apiUrl = this._global.baseAPIUrl + 'Admin/Getpagerights?userid=' + localStorage.getItem('UserID')+' &pagename=' + pagename + '&user_Token=' + localStorage.getItem('User_Token');

    // const apiUrl = this._global.baseAPIUrl + 'Template/GetTemplate?user_Token=' + this.FileStorageForm.get('User_Token').value
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
    //  this.TemplateList = data;    
     
    // if (data <=0)
    // {
    //   localStorage.clear();
    //   this.router.navigate(["/Login"]);

    // } 
    
    });
  }
   

  entriesChange($event) {
    this.entries = $event.target.value;
  }
  filterTable($event) {
 //   console.log($event.target.value);

    let val = $event.target.value;
    let that = this
    this._FilteredList = this.records.filter(function (d) {
    //  console.log(d);
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
    this.DataUploadForm.reset();
    this.DataUploadForm.controls['User_Token'].setValue(localStorage.getItem('User_Token')); 
    this.DataUploadForm.controls['UserID'].setValue(localStorage.getItem('UserID'));    
    this.DataUploadForm.controls['CreatedBy'].setValue(localStorage.getItem('UserID'));    
   // this.getTemplate();
   this.DataUploadForm.controls['TemplateID'].setValue(0);
  }

  // getTemplate() {

  //   const apiUrl = this._global.baseAPIUrl + 'Template/GetTemplate?user_Token='+this.DataUploadForm.get('User_Token').value;
  //   this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
  //     this.TemplateList = data;
  //     this.DataUploadForm.controls['TemplateID'].setValue(0);
  //     //this.AddEditBranchMappingForm.controls['UserIDM'].setValue(0);
  //     //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
  //   });
  // }

  geTTempList() {

    //const apiUrl=this._global.baseAPIUrl+'Template/GetTemplate?user_Token='+ this.DataEntryForm.get('User_Token').value;
    const apiUrl = this._global.baseAPIUrl + 'TemplateMapping/GetTemplateMappingListByUserID?UserID=' + localStorage.getItem('UserID') + '&user_Token='+this.DataUploadForm.get('User_Token').value  
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
    this.TemplateList = data;
    this.DataUploadForm.controls['TemplateID'].setValue(0);
    // console.log("this._TemplateLis", data)
    //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
    });

    }

  GetDisplayField(TID: number) {

    const apiUrl = this._global.baseAPIUrl + 'DataUpload/GetFieldsName?ID=' + TID + '&user_Token='+this.DataUploadForm.get('User_Token').value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data) => {

      this._ColNameList = data;
      this.GetHeaderNames();
//console.log(data);

      // this.DataUploadForm.controls['TemplateID'].setValue(0);
      //this.AddEditBranchMappingForm.controls['UserIDM'].setValue(0);
      //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
    });
  }

  handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    //console.log(this.DataUploadForm);
    
    if(this.DataUploadForm.valid && files.length>0) {
      var file = files[0];
      var reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (event: any) => {
        var csv = event.target.result; // Content of CSV file
        this.papa.parse(csv, {
          skipEmptyLines: true,
          header: true,
          complete: (results) => {
            for (let i = 0; i < results.data.length; i++) {
              let orderDetails = {
                order_id: results.data[i].Address,
                age: results.data[i].Age
              };
              this._Records.push(orderDetails);
            }
            // console.log(this.test);
            // console.log('Parsed: k', results.data);
          }
        });
      }
    } else {
      this.toastr.show(
        '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Please Select <br> <b>Csv File</b><br><b>Template</b><br> before uploading!</span></div>',
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
  }

  uploadListener($event: any): void {

    let text = [];
    let files = $event.srcElement.files;

    if (this.isValidCSVFile(files[0]) && this.DataUploadForm.get('TemplateID').value > 0) {
      
      let input = $event.target;
      let reader = new FileReader();
     // console.log(input.files[0]);
      reader.readAsText(input.files[0]);
      $(".selected-file-name").html(input.files[0].name);
      reader.onload = () => {
        let csvData = reader.result;
        let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);

        let headersRow = this.getHeaderArray(csvRecordsArray);

        this._CSVData = csvRecordsArray;
        this._IndexList = csvRecordsArray;

        // alert(headersRow);
        // alert(this._ColNameList);
        //let ColName = 
        let validFile = this.getDisplayNames(csvRecordsArray);
        if (validFile == false) {
        //  console.log('Not Valid File', csvRecordsArray);
          this.isFileInvalid = true;
          this.fileReset();
        } else {
          this.isFileInvalid = false;
          this.records = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
       

          // let isValidDateFormat = true;
          // let textFieldRequiredValidation = true;
          // let NumericFieldValidation = true;
          // let textFieldLetterValidation = true;

          // this._ColNameList.forEach((el, index) => {
          //   if(el.FieldType === '3') { // Date Format check
          //     this.records.forEach(record => {
          //       if(!this.checkDateFormat(record[index])) {
          //         isValidDateFormat = false;
          //         this.toastr.show(
          //           '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message"><b>' + el.DisplayName + '</b> : Please select date in dd-mm-yyyy format</span></div>',
          //           "",
          //           {
          //             timeOut: 5000,
          //             closeButton: true,
          //             enableHtml: true,
          //             tapToDismiss: false,
          //             titleClass: "alert-title",
          //             positionClass: "toast-top-center",
          //             toastClass:
          //               "ngx-toastr alert alert-dismissible alert-danger alert-notify"
          //           }
          //         );
          //       }
          //     });
          //   }
          //   if(el.FieldType === '1' && el.IsMandatory === '1') { // Text field required validation check
          //     this.records.forEach(record => {
          //       if(record[index] === '') {
          //         textFieldRequiredValidation = false;
          //         this.toastr.show(
          //           '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message"><b>' + el.DisplayName + '</b> : This field is required</span></div>',
          //           "",
          //           {
          //             timeOut: 5000,
          //             closeButton: true,
          //             enableHtml: true,
          //             tapToDismiss: false,
          //             titleClass: "alert-title",
          //             positionClass: "toast-top-center",
          //             toastClass:
          //               "ngx-toastr alert alert-dismissible alert-danger alert-notify"
          //           }
          //         );
          //       }
          //     });
          //   }

          //   if(el.FieldType === '1') { // Text field letter validation check
          //     this.records.forEach(record => {
          //       if(!(/^[a-z][a-z\s]*$/.test(record[index]))) {
          //         textFieldLetterValidation = false;
          //         this.toastr.show(
          //           '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message"><b>' + el.DisplayName + '</b> : Only letters are allowed</span></div>',
          //           "",
          //           {
          //             timeOut: 5000,
          //             closeButton: true,
          //             enableHtml: true,
          //             tapToDismiss: false,
          //             titleClass: "alert-title",
          //             positionClass: "toast-top-center",
          //             toastClass:
          //               "ngx-toastr alert alert-dismissible alert-danger alert-notify"
          //           }
          //         );
          //       }
          //     });
          //   }

          //   if(el.FieldType === '2') { // Numeric field validation check
          //     this.records.forEach(record => {
          //       if(isNaN(record[index])) {
          //         NumericFieldValidation = false;
          //         this.toastr.show(
          //           '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message"><b>' + el.DisplayName + '</b> : Please enter numbers only </span></div>',
          //           "",
          //           {
          //             timeOut: 5000,
          //             closeButton: true,
          //             enableHtml: true,
          //             tapToDismiss: false,
          //             titleClass: "alert-title",
          //             positionClass: "toast-top-center",
          //             toastClass:
          //               "ngx-toastr alert alert-dismissible alert-danger alert-notify"
          //           }
          //         );
          //       }
          //     });
          //   }
          // });
          // if(isValidDateFormat && textFieldRequiredValidation && NumericFieldValidation && textFieldLetterValidation) {
          //   this._FilteredList = this.records
          // }
          this._FilteredList = this.records;
          (<HTMLInputElement>document.getElementById('csvReader')).value = '';
        //  console.log('Records', this._FilteredList);
        }
  

      };

      reader.onerror = function () {
       // console.log('error is occurred while reading file!');
      };

    } else {
      this.toastr.show(
        '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Please Select A Valid CSV File And Template</span></div>',
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
      this.fileReset();
    }
    this._FilteredList = this.records
  }

  checkDateFormat(date) {
  //  console.log("Date",date);

    if (date !="")
    {
    let dateArr = date.split('-');
    const dateString = dateArr[1] + '/' + dateArr[0] + '/' + dateArr[2];
    if(isNaN(dateArr[0]) || isNaN(dateArr[1]) || isNaN(dateArr[2])) {
      return false;
    }
    if(isNaN(new Date(dateString).getTime())) {
      return false;
    }
    return true;
  }
  else
  {
    return true;
  }
  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    let csvArr = [];

    for (let i = 1; i < csvRecordsArray.length; i++) {
      let curruntRecord = (<string>csvRecordsArray[i]).split(',');
      if (curruntRecord.length == headerLength) {
        const single = []
        for (let i = 0; i < this._ColNameList.length; i++) {
          single.push(curruntRecord[i].toString().trim())
        }
        csvArr.push(single)
      }
    }
    return csvArr;
  }

  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }

  getHeaderArray(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split(',');
    let headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }

  fileReset() {
    //this.csvReader.nativeElement.value = "";  
    this.records = [];
  }

  onSubmit() {

        this.submitted = true;
        if (this.validation() == false ) {
        //alert("Please Fill the Fields");
        // this.ShowErrormessage("Please Fill the Fields");

        return;  
    } 

    let _UplaodBy =0;    
    if (this.DataUploadForm.get("UplaodBy").value)
    {
      _UplaodBy =1;
    }

    this.DataUploadForm.patchValue({
      id: localStorage.getItem('UserID'),
      CSVData: this._CSVData,     
      User_Token: localStorage.getItem('User_Token')    ,
      UplaodBy: _UplaodBy   

    });
    

    const apiUrl = this._global.baseAPIUrl + 'DataUpload/Create';
    this._onlineExamService.postData(this.DataUploadForm.value, apiUrl)
      // .pipe(first())
      .subscribe(data => {
         
        this.toastr.show(
          '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success!</span> <span data-notify="message"> '+ data +' </span></div>',
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


      });

    //  }     

  }

  ShowErrormessage(data:any)
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

  geTemplateNameListByTempID(TID: number) {
    this.GetDisplayField(TID);

  // console.log(this.DataUploadForm.get('TemplateID').);

  }

  onFormat(csvRecordsArr: any) {
    //   let dt;



  }

  getDisplayNames(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split(',');
    let headerArray = [];
//console.log(this._ColNameList);
//console.log(headers);

    if (headers.length != this._ColNameList.length) {
     // alert('Invalid No. of Column Expected :- ' + this._ColNameList.length);
     var msg= 'Invalid No. of Column Expected :- ' + this._ColNameList.length; 
     //this.showmessage(msg);
     this.ShowErrormessage(msg);

      return false
    }

    for (let j = 0; j < headers.length; j++) {
      if (headers[j].toLowerCase() != this._ColNameList[j].DisplayName.toLowerCase()) {
        //alert('In Valid Column Name :-- ' + headers[j] + ' --Expected: ' + this._ColNameList[j].DisplayName);
        var msg= 'In Valid Column Name :-- ' + headers[j] + ' --Expected: ' + this._ColNameList[j].DisplayName; 
     this.showmessage(msg);
        
        return false;
      }
      // headerArray.push(headers[j]);  
    }
    return true;
  }


  GetHeaderNames() {
    this._HeaderList = "";
    for (let j = 0; j < this._ColNameList.length; j++) {

      this._HeaderList += this._ColNameList[j].DisplayName + ',';

     // console.log(this._ColNameList[j].FieldType); 
      //console.log("ddddddd"); 


      // headerArray.push(headers[j]);  
    }

  }

  downloadFile() {
    if (this.validation() == true)    {
    const filename = this.TemplateList.find(el => el.TemplateID == this.DataUploadForm.controls.TemplateID.value).TemplateName;
    let csvData = this._HeaderList;    
    //console.log(csvData)
    let blob = new Blob(['\ufeff' + csvData], {
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
  }
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
    
      if (this.DataUploadForm.get('TemplateID').value <=0 )
      {
               this.ShowErrormessage("Please Select Template ID");
                return false;
      }
            return true;

  }
 
  getCellClass = ({ row, column, value }): any => {
    // return {
    //   'date-field': this._ColNameList.filter((el, index) => el.DisplayName === column.name)[0].FieldType === '3'
    // }
  //  console.log(row, column);
    const field = this._ColNameList.filter((el, index) => el.DisplayName === column.name)[0];
    const fieldIndex = this._ColNameList.findIndex(el => el.DisplayName === column.name);
    let cssClass = '';
   // console.log(field.Ref1);
  // alert(field.IsMandatory);
    switch(field.FieldType) {
      case ('1') : // Text field
        if(field.IsMandatory ==1 && row[fieldIndex] === '') { // Required field check
          cssClass += ' error text-required';
        }
        else if(field.IsMandatory ==0 && row[fieldIndex] === '') { // Required field check
             break;
         }

       else if(!(/^[a-zA-Z\s]*$/.test(row[fieldIndex]))) { // Letter validation check
          cssClass += ' error letter-only';
        }
        break;

      case ('2') :

        if(field.IsMandatory ==1 && row[fieldIndex] === '') { // Required field check
          cssClass += ' error text-required';
        }
        else if(field.IsMandatory ==0 && row[fieldIndex] === '') { // Required field check
        
         break;
        }
        else if (isNaN(row[fieldIndex])) {
          cssClass = ' error numeric-only';
        }
        break;

        if(field.IsMandatory ==1 && isNaN(row[fieldIndex])) {
          cssClass = ' error numeric-only';
        }
        break;

      case ('3') :
        if(!this.checkDateFormat(row[fieldIndex])) {
          cssClass = ' error date-only';
        }
        break;

      case ('5') :
      //  console.log('row');
      //console.log(row);
     // console.log(fieldIndex);
        
     
     if (fieldIndex==0)
        {
          if(row[fieldIndex] === '') { // Required field check
            cssClass += ' error text-required';
          }
        }
        else if(field.IsMandatory ==0 && row[fieldIndex] === '') { // Required field check
        
          break;
         }

        else if(!(/^[\w\s]+$/.test(row[fieldIndex]))) { // Alpha-Numeric validation check
         
          if (fieldIndex !=8)
          {
         // cssClass = ' error alpha-numeric-only';
          }
         
         // cssClass = ' error alpha-numeric-only';
        }
        break;
        
    }
    return cssClass;
  }

  getTooltipDate(tooltipRef, rowIndex, colIndex) {
    if(!tooltipRef) {
      return;
    }
    
    let tooltipData = '';
    if(tooltipRef.parentElement.parentElement.classList.contains('text-required')) {
      tooltipData = 'This field is required';
    } else if(tooltipRef.parentElement.parentElement.classList.contains('letter-only')) {
      tooltipData = 'Only letters are allowed';
    } else if(tooltipRef.parentElement.parentElement.classList.contains('numeric-only')) {
      tooltipData = 'Only numeric fields are allowed';
    } else if(tooltipRef.parentElement.parentElement.classList.contains('date-only')) {
      tooltipData = 'Date required in dd-mm-yyyy format';
    } else if(tooltipRef.parentElement.parentElement.classList.contains('alpha-numeric-only')) {
      tooltipData = 'Only letters and digits are allowed';
    }
    if(tooltipData !== '') {
      this.isValidationError = true;
    }
    return tooltipData;
  }

  hasDataError() {
    if(this.isFileInvalid || document.querySelectorAll('.datatable-body-cell.error').length > 0) {
      return true;
    }
    return false;
  }

}
