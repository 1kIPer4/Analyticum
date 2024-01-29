import {getElement} from '@actions/index'
import {focusContol, focusCatcher} from '@actions/focus'

export default class Header {
    constructor(options) {
        //Начальные значения
        let defaultConfig = {
            burger: '#header .btn-burger',
            menu: '#header__menu',
            menuList: '#header .menu',
            menuLinkClass: '.menu__link',
            consultationBtn: '.btn-consultation',
            contactsContainer: '.header__contacts',
            modalOpenAttribute: 'data-modal-open',
        }
        
        this.config = Object.assign(defaultConfig, options)

        //Получаем элементы
        this.burger = getElement(this.config.burger)
        this.menu = getElement(this.config.menu)
        this.menuList = getElement(this.config.menuList)
        this.consultationBtn = getElement(this.config.consultationBtn)
        this.contactsContainer = getElement(this.config.contactsContainer)

        //медиа запроосы (Адаптив)
        this.mediaQueryLaptop = window.matchMedia('(max-width: 1179px)')
        this.mediaQueryMobileL = window.matchMedia('(max-width: 428px)')

        this.mediaQueryLaptopMatches = this.mediaQueryLaptop.matches
        this.mediaQueryMobileLMatches = this.mediaQueryMobileL.matches

        //блокировка скролла
        this.doBodyLock = false

        this.init()
    }

    init() {
        //меняем шапку в зависимости от ширины экрана (Адаптив)
        this.changeHeader(this.mediaQueryLaptop.matches)

        //меняем блокировку прокрутки в зависимости от ширины экрана (Адаптив)
        this.changeBodyLock(this.mediaQueryMobileL.matches)

        this.events()   
    }

    events() {
        if (this.burger) {
            //слушатель для открытия/закрытия меню по клику
            this.burger.addEventListener('click', () => {
                this.menuToggle(this.menu)
            })
             
            //слушатель для открытия/закрытия меню по кнопке
            document.addEventListener('keydown', (e) => {
                this.keydownListener(e)
            })
        }
        
        //слушатель для закрытия меню, при клике по пункту
        this.menuList.addEventListener('click', (e) => {
            this.menuListener(e)
        })


        // Laptop max 1179
        this.mediaQueryLaptop.addEventListener('change', (e) => {
            this.mediaQueryLaptopMatches = e.matches
            //изменяем шапку
            this.changeHeader(e.matches)
        })

        //Mobile max 428
        this.mediaQueryMobileL.addEventListener('change', (e) => {
            this.mediaQueryMobileLMatches = e.matches
            //включаеми блокировку прокрута страницы (при открытом меню)
            this.changeBodyLock(e.matches)
        })
    }

    //открытие меню по кнопке
    menuToggle(menu) {
        if (menu) {
            menu.classList.toggle('open')

            //если меню закрыто
            if (!menu.classList.contains('open')) {
                //фокусируем на открывающем его элементе
                focusContol(menu, false, this.burger)

                //если блокировали скролл - снимаем блокировку
                if (this.doBodyLock)
                    this.bodyLock(false)
            } //если окно открыто и нужно блокировать скролл - блокируем
            else if (this.doBodyLock)
                this.bodyLock(true)
        }
    }

    //функция для закрытия меню, при клике по пункту
    menuListener(e) {
        //Если есть меню
        if(this.menuList 
            //если планешет или мобильный экран
            && (this.mediaQueryLaptopMatches || this.mediaQueryMobileLMatches)
            //если попали по ссылке меню
            && (e.target.closest(this.config.menuLinkClass))) {
            this.menuToggle(this.menu)
        }
    }

    //функция изменения класса кнопки
    changeClassBtn(consultationBtn, removeClass, addClass) {
        if(consultationBtn) {
            consultationBtn.classList.remove(removeClass)
            consultationBtn.classList.add(addClass)
        }
    }

    //функция изменения порядка элементов
    changeOrder(element, toStart) {
        if(element) {
            const parentElement = element.parentNode
            //меняем порядок
            if (toStart)
                parentElement.insertBefore(element, parentElement.firstChild)
            else
                parentElement.appendChild(element)
        }
    }

    //функция изменения шапки (Адаптив)
    changeHeader(mediaQueryMatches) {
        let 
            addClass = mediaQueryMatches ? 'btn-purple' : 'btn-empty',
            removeClass = mediaQueryMatches ? 'btn-empty' : 'btn-purple'

        //Меняем класс кнопке в мобильном меню
        this.changeClassBtn(this.consultationBtn, removeClass, addClass)
        
        //меняем порядок
        this.changeOrder(this.consultationBtn, mediaQueryMatches)
        this.changeOrder(this.contactsContainer, !mediaQueryMatches)
    }

    //функция блокировки прокрутки, если открыто меню
    bodyLock(lock) {
        if (lock)
            document.body.classList.add('_lock')
        else
            document.body.classList.remove('_lock')
    }

    //функция изменения состояния body (lock / unlock)
    changeBodyLock(mediaQueryMatches) {
        this.doBodyLock = mediaQueryMatches ? true : false

        if(this.doBodyLock) {
            if (this.menu && this.menu.classList.contains('open'))
                this.bodyLock(true)
        } else
            this.bodyLock(false)
    }

    //функция обработки keydown
    keydownListener(e) {
         //ищем открытое модальное окно
         let modalOpen = document.querySelector(`[${this.config.modalOpenAttribute}]`)
    
         //если не открыто модальное окно и существует меню
         if (e.key === 'Escape' && !modalOpen && this.menu) {
             e.preventDefault()
             this.menuToggle(this.menu)
         }

         if (e.key === 'Tab' 
             && !modalOpen //исли не открыто модальное окно
             && this.menu  //и существует меню
             && this.menu.classList.contains('open')) //и меню открыто
             focusCatcher(e, this.menu)
    }
}