import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Entry } from '../../models/entry'
import { EntryDataServiceProvider } from '../../providers/entry-data-service/entry-data-service'
import { AlertController } from 'ionic-angular';

/**
 * Generated class for the EntryDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-entry-detail',
  templateUrl: 'entry-detail.html'
})

export class EntryDetailPage {

  private entry: Entry;

  constructor(public navCtrl: NavController, public navParams: NavParams, private entryDataService: EntryDataServiceProvider, public alertController: AlertController) {
    let entryID = this.navParams.get("entryID");

    if (entryID === undefined) {
      this.entry = new Entry();
      this.entry.title = "";
      this.entry.text = "";
      this.entry.id = -1; // placeholder for 'temporary' entry
    } else {
      this.entry = this.entryDataService.getEntryByID(entryID);
    }

    console.log("retrieved entry:", this.entry);
  }

  async presentAlertRadio() {
    const alert = await this.alertController.create({
      title: 'Update timestamp?',
      message: 'Do you want to keep the timestamp, or update to the current time?',
      inputs: [
        {
          name: 'radio1',
          type: 'radio',
          label: 'Keep (' + new Date(this.entry.timestamp).toLocaleString() + ')',
          value: 'keep'
          // checked: true
        },
        {
          name: 'radio2',
          type: 'radio',
          label: 'Update (' + new Date().toLocaleString() + ')',
          value: 'update'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('cancelled');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            console.log(data);
            if (data === 'update') {
              this.entry.timestamp = new Date();
              console.log(new Date(this.entry.timestamp).toLocaleString());
            }
            console.log('this.entry is', this.entry);
            this.entryDataService.updateEntry(this.entry.id, this.entry);
            this.navCtrl.pop();
          }
        }
      ]
    });

    await alert.present();
  }

  private saveEntry() {
    if (this.entry.id === -1) {
      this.entry.timestamp = new Date();
      this.entryDataService.addEntry(this.entry);
      this.navCtrl.pop();
    } else {
      this.presentAlertRadio();
      // this.entryDataService.updateEntry(this.entry.id, this.entry);
    }

  }
  private cancel() {
    this.navCtrl.pop();
  }
}
