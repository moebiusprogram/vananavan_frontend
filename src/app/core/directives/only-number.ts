import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'input[onlyNumber]'
})
export class OnlyNumber {
  constructor(private elem: ElementRef) { }
  
  @HostListener('input', ['$event']) onInputChange(event) {
    const initialValue = this.elem.nativeElement.value;
    this.elem.nativeElement.value = initialValue.replace(/[^0-9]*/g, '');
    if (this.elem.nativeElement.value !== initialValue) {
      event.stopPropagation();
    }
  }
}