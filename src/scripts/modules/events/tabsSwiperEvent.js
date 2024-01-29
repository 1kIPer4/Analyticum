import {getElement} from '@actions/index'
import Swiper from "swiper"

export default class TabsSwiperEvent {
    constructor(slider, tabs) {
        this.slider = slider
        this.tabs = getElement(tabs)

        this.init()
    }

    init() {
        this.events()
    }

    events() {
        if (this.tabs) {
            this.tabs.addEventListener('keydown', (e) => {
                this.keydownEnter(e)
            })
        }
    }

    keydownEnter(e) {
        if (e.target.hasAttribute('tabindex') 
            && e.keyCode === 13) {

            let 
                index = 0, 
                count = this.tabs.children.length

            while (index < count && e.target !== this.tabs.children[index])
                index++
            
            if (this.slider && this.slider instanceof Swiper) {
                if (this.slider.params.loop)
                    this.slider.slideToLoop(index)
                else
                    this.slider.slideTo(index)
            }   
        }
    }
} 