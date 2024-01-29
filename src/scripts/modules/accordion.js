import {getElement} from '@actions/index'

export default class Accordion {
    constructor(accordion, options) {
        let defaultConfig = {
            btnSelector: 'button',
            rowSelector: 'li',
            answerSelector: '.answer',
            openClass: 'open',
        }
        
        this.config = Object.assign(defaultConfig, options)

        this.accordion = getElement(accordion)

        this.events()
    }

    events() {
        if (this.accordion) {
            this.accordion.addEventListener('click', (e) => {
                const btn = e.target.closest(this.config.btnSelector)
                if(btn)
                    this.accordionFunc(btn)
            })
        }
    }

    toggleElem(row, doOpen = true) {
        const 
            btn = row.querySelector(this.config.btnSelector),
            answer = row.querySelector(this.config.answerSelector)

        row.classList.toggle(this.config.openClass)
        btn.toggleAttribute('aria-expanded')
        answer.toggleAttribute('aria-hidden')
        
        if (doOpen)
            answer.style.maxHeight = answer.scrollHeight + 'px'
        else
            answer.style.maxHeight = 0
    }

    accordionFunc(btn) {
        const row = btn.closest(this.config.rowSelector)

        //если строка уже открыта
        if (row.classList.contains(`${this.config.openClass}`))
            this.toggleElem(row, false)
        else {
            //ищем открытую строку
            const elemOpen = this.accordion.querySelector(`${this.config.rowSelector}.${this.config.openClass}`)
            if (elemOpen)
                this.toggleElem(elemOpen, false)
            this.toggleElem(row)
        }
    }
}