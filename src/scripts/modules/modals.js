import {getStyle} from '@actions/index'
import {focusContol, focusCatcher} from '@actions/focus'

export default class Modals {
    static _lockPadding = document.querySelectorAll('[data-lock-padding]')
    static _unlock = true
    static _isOpened = false
    static _focusTiming = 600

    constructor(options) {

        //Начальные значения
        let defaultConfig = {
            linkAttribute: 'data-modal-link',
            closeAttribute: 'data-close-modal',
            modalOpenAttribute: 'data-modal-open',
            modalTransitionSelector: '.modal__body',
            modalLockClass: '_modal-lock'
        }
        
        this.config = Object.assign(defaultConfig, options)

        this.init()
    }

    init() {
        this.events()   
    }

    events() {
        document.addEventListener('click', (e) => {
            //попали по ссылке
            if (e.target.hasAttribute(this.config.linkAttribute)) {
                e.preventDefault()

                this.modalLink = e.target
                this.modal = document.querySelector(this.modalLink.getAttribute(this.config.linkAttribute))

                this.open(this.modal)
            }
        })

        //Обработка закрытия
        document.addEventListener('mousedown', (e) => {
            if (e.target.hasAttribute(this.config.closeAttribute) && e.button === 0) {
                e.preventDefault()
                this._elemClicked = e.target
            }
        })

        //Обработка закрытия
        document.addEventListener('mouseup', (e) => {
            if (e.target === this._elemClicked && e.button === 0) {
                e.preventDefault()
                this.close()
                this._elemClicked = undefined
            }
        })

        document.addEventListener('keydown', (e) => {   
            //закрытие окна или по Enter в фокусе
            if ((e.key === 'Escape' || this.keyOnFocus(e, 'Enter')) && Modals._isOpened && Modals._unlock) {
                e.preventDefault()
                this.close()
            }

            //фокус по Tab
            if (e.key === 'Tab' && Modals._isOpened && Modals._unlock)
                focusCatcher(e, this.modal)
        })
    }

    keyOnFocus(e, key) {
        return e.key === key && e.target.hasAttribute(this.config.closeAttribute)
    }

    open(modal) {
        if (modal && Modals._unlock) {
            //ищем открытое модальное окно
            const modalActive = document.querySelector(`[${this.config.modalOpenAttribute}]`)
            if (modalActive)
                this.close(modalActive, false)
            
            this._bodyLock(modal)
            modal.setAttribute(this.config.modalOpenAttribute, '')
            modal.classList.add('open')
            Modals._isOpened = true
            //меняем фокус
            focusContol(modal, Modals._isOpened, this.modalLink, Modals._focusTiming)
        }
    }

    close(modal = document.querySelector(`[${this.config.modalOpenAttribute}]`), doUnlock = true) {
        if (modal && Modals._unlock) {
            modal.classList.remove('open')
            modal.removeAttribute(this.config.modalOpenAttribute)
            if (doUnlock)
                this._bodyUnlock(modal)
            Modals._isOpened = false
            //меняем фокус
            focusContol(modal, Modals._isOpened, this.modalLink, Modals._focusTiming)
        }
    }

    _bodyLock(modal) {
        //получаем из стилей длительность анимации
        this.timeout = getStyle(modal.querySelector(this.config.modalTransitionSelector), 'transition-duration') ?? 0

        let lockPaddingValue = window.innerWidth - document.body.offsetWidth + 'px'

        if (lockPaddingValue !== '0px') {
            if (Modals._lockPadding.length > 0) {
                Modals._lockPadding.forEach(el => {
                    el.style.paddingRight = lockPaddingValue
                })
            }
            document.body.style.paddingRight = lockPaddingValue
            document.body.classList.add(this.config.modalLockClass)
        }

        Modals._unlock = false
        setTimeout(() => {
            Modals._unlock = true
        }, this.timeout)
    }

    _bodyUnlock(modal) {
        //получаем из стилей длительность анимации
        this.timeout = getStyle(modal.querySelector(this.config.modalTransitionSelector), 'transition-duration') ?? 0

        setTimeout(() => {
            if (Modals._lockPadding.length > 0) {
                Modals._lockPadding.forEach(el => {
                    el.style.paddingRight = '0px'
                })
            }
            document.body.style.paddingRight = '0px'
            document.body.classList.remove(this.config.modalLockClass)
        }, this.timeout)

        Modals._unlock = false
        setTimeout(() => {
            Modals._unlock = true
        }, this.timeout)
    }
}