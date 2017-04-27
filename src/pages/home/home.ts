import { Component } from '@angular/core';
import { NavController, Platform, AlertController } from 'ionic-angular';
import { File } from 'ionic-native';
import X2JS from 'x2js';
import { ContactPage } from '../contact/contact';

declare var cordova: any;
/*declare var console: require("console-browserify")*/

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  consoleList = [];
  

  showList = false;
  items = [];
  pSearch = "";
  xmlCodes : any;
  result1 : any;
  result2 : any;

  constructor(public navCtrl: NavController, public platform: Platform, public alertCtrl: AlertController) {
    this.showList = false;

    let parser : any = new X2JS({
      attributePrefix : "$"
    });

/*      let content = "<?xml version=\"1.0\" encoding=\"utf-8\" ?> " +
      "<Codes> " +
      "<item brend=\"Schneider Electric\" order=\"ATV12H018M2\" type=\"\" custom=\"132F0002\" model=\"FC-051PK37S2E20H3XXCXXXSXXX\" series=\"VLT Micro Drive FC 51\" /> " +
      "<item brend=\"Schneider Electric\" order=\"ATV12H037M2\" type=\"\" custom=\"132F0002\" model=\"FC-051PK37S2E20H3XXCXXXSXXX\" series=\"VLT Micro Drive FC 51\" /> " +
      "<item brend = \"Vacon\" order = \"-\" type = \"Vacon 0010-1L-0001-2\" custom = \"132F0001\" model = \"FC-051PK18S2E20H3XXCXXXSXXX\" series = \"VACON 10\" />" +
      "<item brend = \"Vacon\" order = \"134X0263\" type = \"Vacon 0010-1L-0002-2\" custom = \"132F0002\" model = \"FC-051PK37S2E20H3XXCXXXSXXX\" series = \"VACON 10\" />" +
      "</Codes>";
      
      this.xmlCodes = parser.xml2js(content);*/


    this.platform.ready().then((readySource) => {

     //this.consoleList.push(cordova.file.applicationDirectory);

     File.readAsText(cordova.file.applicationDirectory + "/www/assets/xml", "codes.xml")
      .then((content)=>{

        //let d = new Date().getTime();
        
        this.xmlCodes = parser.xml2js(content);

        //this.consoleList.push((new Date().getTime() - d) / 1000);
        
      })
      .catch((err)=>{
        this.consoleList.push("Ошибка:" + err);
      });
    }); 

  }

  presentAlert() {
    let alert = this.alertCtrl.create({
      title: 'О программе',
      subTitle: 'Данное приложение позволяет подбирать аналогичные по функционалу конкурентам преобразователи  частоты Danfoss марок VLT и VACON. Подобрать аналоги можно для следующих брендов: ABB, Siemens, Schneider Electric, Mitsubishi Electric, Delta Electronics, Omron и Веспер. Для подбора необходимо ввести в строку поиска заказной или типовой код преобразователя частоты указанных брендов. После ввода кода вам на выбор будут предложены аналогичные преобразователи частоты VLT или VACON',
      buttons: ['OK']
    });
    alert.present();
  }

  getItems(ev) {
   
    // Reset items back to all of the items
    this.items = [];

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {

      this.items = this.xmlCodes.Codes.item.filter((item) => {
          return (item.$order.toLowerCase().indexOf(val.toLowerCase()) > -1 || item.$type.toLowerCase().indexOf(val.toLowerCase()) > -1);
      }).map(function(el) {
          return (el.$order || "") + (el.$order !== "" && el.$type !== "" ? " | " : "") + (el.$type || "");
      }).slice(0,20);

     /* this.consoleList.push("get items:" + new Date().getTime())
      this.consoleList.push("items length:" + this.items.length)
      */
      if (this.items.length > 0)
      {
        // Show the results
        this.showList = true;
      }
      else
      {
        //hide if empty
        this.showList = false;
      }
    }
    else
    {
      //hide if empty
      this.showList = false;
    }

  }

  onClear(ev) { 
    this.removeData();
    ev.stopPropagation();
  }

  clickItem(ev){
   
    this.showList = false;
    this.pSearch = ev;

    let findItem = this.xmlCodes.Codes.item.filter((item) => {
        var d = [];
        if (ev.toString().indexOf("|") > -1)
        {
          d = ev.toString().split('|').map(function(r){ return r.trim();});
        }
        else
        {
          d.push('');
          d.push(ev.trim());
        }

        return (
                (item.$order.toLowerCase().indexOf(d[0].toLowerCase()) > -1 && item.$type.toLowerCase().indexOf(d[1].toLowerCase()) > -1) ||
                (item.$order.toLowerCase().indexOf(d[1].toLowerCase()) > -1 && item.$type.toLowerCase().indexOf(d[0].toLowerCase()) > -1)
          );
      }).map(function(el) {
          return el;
      });

    if (findItem[0] !== undefined)
    {
      var isVacon = (findItem[0].$brend == "Vacon" ? true : false);

      findItem[0].$series = isVacon ? "Micro Drive" : findItem[0].$series;

      this.result1 = findItem[0];

      if (!isVacon)
      {
          let findItem2 = this.xmlCodes.Codes.item.filter((item) => {
          return item.$brend.toLowerCase() == "vacon" && item.$custom.toLowerCase() == findItem[0].$custom.toLowerCase() &&
              item.$series.toLowerCase() != "vacon 10" && item.$series.toLowerCase() != "vacon nxl";
        }).map(function(el) {
            return el;
        });

          if (findItem2 && findItem2.length > 0)
          {
            this.result2 = findItem2;
          }
     }
    }
  

  }

  removeData(){
    this.pSearch = "";
    this.result1 = null;
    this.result2 = null;
    this.showList = false;
  }

  btnAdd(ev){
    var dt = new Date();
     this.consoleList.unshift(dt.toLocaleDateString() + " " + dt.toLocaleTimeString());
  }

  btnClear(ev){
     this.consoleList.splice(0, this.consoleList.length);
  }

  onPrepareSend(){

    var phtml = "";
    if (this.result1 != null)
    {
          phtml+="<tr><td colspan=2 style='background-color:#3F729B;font-weight:bold;padding:3px;'>Аналог марки VLT</td></tr>";
          phtml+="<tr><td style='font-weight:bold;padding:3px;'>Бренд</td><td style='padding:3px;'>"+this.result1.$brend+"</td></tr>";
          phtml+="<tr><td style='font-weight:bold;padding:3px;'>Серия</td><td style='padding:3px;'>"+this.result1.$series+"</td></tr>";
          phtml+="<tr><td style='font-weight:bold;padding:3px;'>Заказной код</td><td style='padding:3px;'>"+this.result1.$custom+"</td></tr>";
          phtml+="<tr><td style='font-weight:bold;padding:3px;'>Типовой код</td><td style='padding:3px;'>"+this.result1.$model+"</td></tr>";
    }
     if (this.result2 != null && this.result2.length > 0)
    {
        phtml+="<tr><td colspan=2 style='background-color:#3F729B;font-weight:bold;padding:3px;'>Аналог марки Vacon</td></tr>";
        for(var i=0;i<this.result2.length;i++)
        {
            phtml+="<tr><td style='font-weight:bold;padding:3px;'>Серия</td><td style='padding:3px;'>"+this.result2[i].$series+"</td></tr>";
            phtml+="<tr><td style='font-weight:bold;padding:3px;'>Заказной код</td><td style='padding:3px;'>"+this.result2[i].$order+"</td></tr>";
            phtml+="<tr><td style='font-weight:bold;padding:3px;'>Типовой код</td><td style='padding:3px;'>"+this.result2[i].$type+"</td></tr>";
            phtml+="<tr><td colspan=2 height=1></td></tr>";
        }
     }
    
      this.navCtrl.push(ContactPage, {
        code: this.pSearch,
        codeInfo: phtml
      });
    
  }

  onAbout(){
      this.presentAlert();
  }
}
