import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

//import { TabsPage } from '../pages/tabs/tabs';
import { HomePage } from '../pages/home/home';

declare var cordova: any;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  //rootPage = TabsPage;
  rootPage = HomePage;
  
  constructor(platform: Platform) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();

      if (cordova.platformId == 'android') {
          StatusBar.backgroundColorByHexString("#9c0303");
      } else {
          StatusBar.backgroundColorByName("red");
      }
      
      Splashscreen.hide();
    });
  }
}
