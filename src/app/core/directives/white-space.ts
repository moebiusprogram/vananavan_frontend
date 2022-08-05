import { ElementRef, Directive, HostListener } from '@angular/core';



@Directive({
  selector: 'input[noWhiteSpace]'
})
export class WhiteSpace {
  constructor(
    private elem: ElementRef
  ) { }
  
  @HostListener('input', ['$event']) onInputChange(event) {
    const initialValue = this.elem.nativeElement.value;
    this.elem.nativeElement.value = initialValue.trim();
  }
}