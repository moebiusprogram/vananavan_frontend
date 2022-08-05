import { Directive, OnInit, Output, EventEmitter, ElementRef } from "@angular/core";



@Directive({
  selector: '[google-school-autocomplete]'
})
export class GoogleSchoolAutocomplete implements OnInit {
  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  private element: HTMLInputElement;

  constructor(elRef: ElementRef) {
    this.element = elRef.nativeElement;
  }


  ngOnInit() {
    let options = {
      types: ["establishment"]
    }
    const autocomplete = new google.maps.places.Autocomplete(this.element, options);
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      this.onSelect.emit(this.getFormatedAddress(autocomplete.getPlace()));
    });
  }

  private getFormatedAddress(place) {
    let location_obj = {};
    for (let i in place.address_components) {
      let item = place.address_components[i];
      location_obj['formatted_address'] = place.name + ', ' + place.formatted_address;
      location_obj['lat'] = place.geometry.location.lat();
      location_obj['long'] = place.geometry.location.lng();
      if (item['types'].indexOf("locality") > -1) {
        location_obj['locality'] = item['long_name']
      } else if (item['types'].indexOf("administrative_area_level_1") > -1) {
        location_obj['admin_area_l1'] = item['short_name']
      } else if (item['types'].indexOf("street_number") > -1) {
        location_obj['street_number'] = item['short_name']
      } else if (item['types'].indexOf("route") > -1) {
        location_obj['route'] = item['long_name']
      } else if (item['types'].indexOf("country") > -1) {
        location_obj['country'] = item['long_name']
      } else if (item['types'].indexOf("postal_code") > -1) {
        location_obj['postal_code'] = item['short_name']
      }
    }
    return location_obj;
  }

}