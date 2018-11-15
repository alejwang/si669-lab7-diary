import { Injectable } from '@angular/core';
import { Entry } from '../../models/entry';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';

@Injectable()
export class EntryDataServiceProvider {
  private entries: Entry[] = [];
  private serviceObserver: any;
  private clientObservable: any;
  private nextID: number = 0;

  constructor(private storage: Storage) {
    // this.loadFakeEntries();
    this.clientObservable = Observable.create(observer => {
      this.serviceObserver = observer;
      // console.log('this.serviceObserver', this.serviceObserver);
    });

    this.storage.get("myDiaryEntries").then(data => {
      if (data != undefined && data != null) {
        this.entries = JSON.parse(data);
        this.notifySubscribers();
      }
    }, err => {
      console.log(err);
    });
    this.storage.get("nextID").then(data => {
      if (data != undefined && data != null) {
        this.nextID = data;
        console.log("got nextID: ", this.nextID);
      }
    }, err => {
      console.log(err);
    })
  }

  public getObservable(): Observable<Entry[]> {
    return this.clientObservable;
  }

  private notifySubscribers(): void {
    console.log('arrive here');
    this.serviceObserver.next(true);
  }


  public getEntries():Entry[] {
    let entriesClone = JSON.parse(JSON.stringify(this.entries));
    return entriesClone.sort(function(a, b) {
      if (a.timestamp > b.timestamp) {
        return -1;
      } else {
        return 1;
      }
    });
  }

  public getEntryByID(id: number): Entry {
    for (let e of this.entries) {
      if (e.id === id) {
        let clone = JSON.parse(JSON.stringify(e));
        return clone;
      }
    }
    return undefined;
  }

  private loadFakeEntries() {
    this.entries = [
      {
        id: this.getUniqueID(),
        title: "Latest Entry",
        text: "Today I went to my favorite class, SI 669. It was super great."
      },
      {
        id: this.getUniqueID(),
        title: "Earlier Entry",
        text: "I can't wait for Halloween! I'm going to eat so much candy!!!"
      },
      {
        id: this.getUniqueID(),
        title: "First Entry",
        text: "OMG Project 1 was the absolute suck!"
      }
    ];
  }


  private saveData(): void {
    let key = "myDiaryEntries";
    this.storage.set(key, JSON.stringify(this.entries));
  }

  private getUniqueID(): number {
    let uniqueID = this.nextID++;
    this.storage.set("nextID", this.nextID);
    return uniqueID;
  }

  public addEntry(entry:Entry) {
    entry.id = this.getUniqueID();
    this.entries.push(entry);
    this.notifySubscribers();
    this.saveData();
  }

  public updateEntry(id: number, newEntry: Entry): void {
    let entryToUpdate: Entry = this.findEntryByID(id);
    entryToUpdate.title = newEntry.title;
    entryToUpdate.text = newEntry.text;
    entryToUpdate.timestamp = newEntry.timestamp;
    this.notifySubscribers();
    this.saveData();
  }

  private findEntryByID(id: number): Entry {
    for (let e of this.entries) {
      if (e.id === id) {
        return e;
      }
    }
    return undefined;
  }

  public removeEntry(id: number): void {
    for (let i = 0; i < this.entries.length; i++) {
      let iID = this.entries[i].id;
      if (iID === id) {
        this.entries.splice(i, 1);
        break;
      }
    }
    this.notifySubscribers();
    this.saveData();
  }
}
