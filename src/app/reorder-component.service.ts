import { Injectable } from '@angular/core';

import { fromEvent, Observable, Subscription } from 'rxjs';
import { map, takeUntil, finalize, mergeMap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ReorderComponentService {

  mouseup: Observable<MouseEvent>

  mousemove: Observable<MouseEvent>

  subscription!: Subscription

  constructor() {

    this.mouseup = fromEvent<MouseEvent>(document, 'mouseup')
    this.mousemove = fromEvent<MouseEvent>(document, 'mousemove')
  }

  unregister() {
    this.subscription?.unsubscribe()
  }

  register(element: HTMLElement, className: string, zoom: number) {

    const mousedown = fromEvent<MouseEvent>(element, 'mousedown')

    let proxy: HTMLElement | undefined

    let top = 0, left = 0
    
    const mousedrag = mousedown.pipe(

      mergeMap((md: MouseEvent) => {

        // Are local coordinates to Element
        let startX = md.offsetX / zoom
        let startY = md.offsetY / zoom

        return this.mousemove.pipe(map((mm: MouseEvent) => {

          top = (mm.clientY / zoom)
          left = (mm.clientX / zoom)

          if (proxy === undefined) {
            proxy = this.createProxy(element)
          }

          const newLeft = Math.round(left - startX)
          const newTop = Math.round(top - startY)

          proxy.style.left = newLeft + 'px'
          proxy.style.top = newTop + 'px'

          this.resetOutlineComponent(element, className)

          this.setOutlineComponent(proxy, className, left, top)

        }),
          takeUntil(this.mouseup),          
          finalize( () => {

            this.resetOutlineComponent(element, className)
            
            this.moveComponent(proxy!, element, className, left, top)

            this.removeProxy(proxy!)

            proxy = undefined
          }))
      })
    )

    this.subscription = mousedrag.subscribe()
  }

  moveComponent(proxy: HTMLElement, element: HTMLElement, className: string, left: number, top: number) {

    const under = this.getElementFromPoint(proxy, left, top)

    // Is container
    if(under?.classList.contains(className)) {
      under.appendChild(element)
    }

    // Is component
    if (under?.parentElement && under?.parentElement.classList.contains(className)) {
      under.insertAdjacentElement('beforebegin', element)
    }
  }

  resetOutlineComponent(element: HTMLElement, className: string) {

    const grandParent = element.parentElement?.parentElement

    const components = grandParent?.querySelectorAll(`.${className} *`)

    components?.forEach((component) => {
      (component as HTMLElement).style.marginTop = '0'
    })
  }

  setOutlineComponent(proxy: HTMLElement, className: string, left: number, top: number) {

    const under = this.getElementFromPoint(proxy, left, top)

    // Is component ?
    if (under?.parentElement && under?.parentElement.classList.contains(className)) {

      under.style.marginTop = '50px'
    }
  }

  getElementFromPoint(proxy: HTMLElement, left: number, top: number) {

    proxy.style.visibility = 'hidden'

    const under = document.elementFromPoint(left, top) as HTMLElement

    proxy.style.visibility = 'visible'

    return under
  }

  removeProxy(proxy: HTMLElement) {
    document.body.removeChild(proxy)
  }

  createProxy(element: HTMLElement) {

    const width = element.offsetWidth
    const height = element.offsetHeight

    const proxy = element.cloneNode(true) as HTMLElement

    proxy.style.position = 'absolute'
    proxy.style.width = width + 'px'
    proxy.style.height = height + 'px'
    proxy.style.opacity = '0.8'

    document.body.appendChild(proxy)

    return proxy
  }
}