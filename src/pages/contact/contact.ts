import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import {Http, Request, RequestMethod, Headers} from "@angular/http";

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  http: Http;
  mailgunUrl: string;
  mailgunApiKey: string;
  loader: any;
 
  code = ""; codeInfo = ""; 
  pFIO = ""; pORG = ""; pEmail= ""; pPhone = ""; pComment ="";

  constructor(private navCtrl: NavController, private navParams: NavParams, http: Http, private alertCtrl: AlertController, private loadingCtrl: LoadingController) {

      this.code = navParams.get('code');
      this.codeInfo = navParams.get('codeInfo');
  
      this.http = http;
      this.mailgunUrl = "sandboxb1a1dea219074854968d846b450db391.mailgun.org";
      this.mailgunApiKey = window.btoa("api:key-aaa212cae0791c60f81c38d632a66bfc");

      this.pFIO = ""; this.pORG = ""; this.pEmail = ""; this.pPhone = ""; this.pComment = "";
  }

  onSend() {

      if (this.pFIO == "") { this.sendError("Вы не указали ваше ФИО!"); return; }
      if (this.pEmail == "" && this.pPhone == "" ) { this.sendError("Вы не указали контактные данные Email или телефон!"); return; }
      
      try {
        this.showLoading()

        var phtml = "<html><head><title>Заявка по коду</title></head><body><table cellpadding=\"0\" cellspacing=\"0\" border=\"1\" style='width: 400px;'>";
        phtml+="<tr><td colspan=2 style='background-color:#3F729B;font-weight:bold;padding:3px;'>Контактная информация</td></tr>";
        phtml+="<tr><td style='font-weight:bold;padding:3px;'>ФИО</td><td style='padding:3px;'>"+this.pFIO+"</td></tr>";
        if (this.pORG != "") phtml+="<tr><td style='font-weight:bold;padding:3px;'>Организация</td><td style='padding:3px;'>"+this.pORG+"</td></tr>";
        if (this.pEmail != "") phtml+="<tr><td style='font-weight:bold;padding:3px;'>Email</td><td style='padding:3px;'>"+this.pEmail+"</td></tr>";
        if (this.pPhone != "") phtml+="<tr><td style='font-weight:bold;padding:3px;'>Телефон</td><td style='padding:3px;'>"+this.pPhone+"</td></tr>";
        if (this.pComment != "") phtml+="<tr><td style='font-weight:bold;padding:3px;'>Комментарий</td><td style='padding:3px;'>"+this.pComment+"</td></tr>";
        phtml+= this.codeInfo
        phtml+="<table></body></html>";

        var requestHeaders = new Headers();
        requestHeaders.append("Authorization", "Basic " + this.mailgunApiKey);
        requestHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        this.http.request(new Request({
            method: RequestMethod.Post,
            url: "https://api.mailgun.net/v3/" + this.mailgunUrl + "/messages",
            body: "from=pfedotov19282@gmail.com&to=fedotov@danfoss.ru&subject=Запрос информации по коду " + this.code + " (Competitor Tool)&html=" + phtml,
            headers: requestHeaders //luckychel@mail.ru
        }))
        .subscribe(
            success => {
                setTimeout(() => {
                    this.loader.dismiss();
                });
                this.sendOK(JSON.stringify(success));
            }, 
            error => {
                setTimeout(() => {
                    this.loader.dismiss();
                });
                this.sendError(JSON.parse(error._body).message);
            }
        );
    
    } catch (error) {
        this.showError(error);
    }   
  }

  sendOK(msg) {
        let alert = this.alertCtrl.create({
            title: 'Информация',
            message: 'Заявка по коду ' + this.code + ' успешно отправлена',
            buttons: [
                {
                    text: 'OK',
                    handler: () => {
                        this.navCtrl.pop();
                    }
                }
            ]
        });
        alert.present();
    }

    sendError(err) {
        let alert = this.alertCtrl.create({
            title: 'Ошибка',
            message: err,
            buttons: [
                {
                    text: 'Отмена',
                    role: 'cancel'
                }
            ]
        });
        alert.present();
    }

  showLoading() {
    this.loader = this.loadingCtrl.create({
      content: 'Пожалуйста подождите...'
    });
    this.loader.present();
  }
 
  showError(text) {
    setTimeout(() => {
      this.loader.dismiss();
    });
 
    let prompt = this.alertCtrl.create({
      title: 'Fail',
      subTitle: text,
      buttons: ['OK']
    });
    prompt.present();
  }
}
