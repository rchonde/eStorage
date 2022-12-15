import { Routes } from "@angular/router";
import { StatusComponent } from "./status/status.component";
import { LogsComponent } from "./logs/logs.component";
import { MetadataComponent } from "./metadata/metadata.component";
import { TagReportComponent } from "./TagReport/TagReport.component";
import { SpaceComponent } from "./Space/Space.component";
import { EmailLogComponent } from "./EmailLog/EmailLog.component";
import { PrintBarcodeComponent } from "./print-barcode/print-barcode.component";
import { FilestatusComponent } from "./Filestatus/Filestatus.component";

export const reportRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "status",
        component: StatusComponent
      },    
      {
        path: "logs",
        component: LogsComponent
      },
      {
        path: "meta-data",
        component: MetadataComponent
      },   
      {
        path: "DocumentStatus",
        component: TagReportComponent
      },
      {
        path: "space",
        component: SpaceComponent
      }, 
      {
        path: "EmailLog",
        component: EmailLogComponent
      },
      {
        path: "print-barcode",
        component: PrintBarcodeComponent
      }
      ,
      {
        path: "Filestatus",
        component: FilestatusComponent
      },      
      
    ]

  }
];
