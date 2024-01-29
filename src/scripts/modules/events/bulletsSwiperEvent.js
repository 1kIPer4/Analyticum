import {getElement} from '@actions/index'
import Swiper from "swiper"

export default class BulletsSwiperEvent {
    constructor(slider, options) {
        //Слайдер
        if (slider instanceof Swiper)
            this.slider = slider

        //Начальные значения
        let defaultConfig = {
            bulletsContainer: '.bullets',
            bulletClass: 'bullet',
            bulletActiveClass: '_active'
        }
        
        this.config = Object.assign(defaultConfig, options)

        //Контейнер Bullets
        this.bulletsContainer = getElement(this.config.bulletsContainer)
        
        this.init()
    }

    init() {
        if (this.slider && this.bulletsContainer) {
            //кол-во слайдов
            this.quantitySlides = this.slider.slides.length

            //в зависимости от loop используются разные методы параметры и свойсва в Swiper
            this.loop = this.slider.params.loop
            //определяем активный слайд
            this.findActiveIndex()
            //событие для обрабочтика
            this.event = this.loop ? 'realIndexChange' : 'activeIndexChange'
            this.slidesPerView = (this.loop && this.slider.params.slidesPerView > 1) 
                                ? this.slider.params.slidesPerView - 1 
                                : this.slider.params.slidesPerView

            //определяем кол-во bullets
            if (this.config.quantityBullets 
                && typeof this.config.quantityBullets === 'number' 
                && this.config.quantityBullets <= this.quantitySlides
                && this.config.quantityBullets > this.slider.params.slidesPerView)
                this.quantityBullets = this.config.quantityBullets
            else
                this.quantityBullets = this.quantitySlides

            //создаем bullets
            this.createBulets()

            //заносим созданные bullets в переменную
            this.bullets = this.bulletsContainer.querySelectorAll(`.${this.config.bulletClass}`)
            
            if (this.bullets.length > 0) {
                //находим центральный элемент
                this.centerBullet = Math.ceil(this.bullets.length / 2) - 1

                //задаем начальный активный bullet
                this.deleteActiveBullet()
                if (this.loop)
                    this.addActiveBullet(this.slider.realIndex)
                else
                    this.addActiveBullet(this.slider.activeIndex)

                this.events()
            }     
        }
    }

    events() {
        //привязка bullets к перелистыванию слайдов
        this.slider.on(this.event, () => {
            this.eventBulletsListener()
        })
        
        this.bulletsContainer.addEventListener('click', (e) => {
            this.eventBulletsClick(e)
        })
        
        this.bulletsContainer.addEventListener('keydown', (e) => {
            this.eventBulletsKeydown(e)
        })  
    }

    createBulets() {
        for (let i = 0; i < this.quantityBullets; i++) {
            const bullet = document.createElement('span')
            bullet.setAttribute('tabindex', '0')

            if (this.config.bulletClass) {
                if (this.config.bulletClass instanceof Array)
                    bullet.classList.add(...this.config.bulletClass)
                else if ( typeof this.config.bulletClass === 'string')
                    bullet.classList.add(this.config.bulletClass)
            }
            
            this.bulletsContainer.append(bullet)
        }
    }

    loopOptions() {
        this.findActiveIndex()
    }

    findActiveIndex() {
         this.activeIndex = this.loop 
                            ? this.slider.realIndex 
                            : this.slider.activeIndex
    }

    deleteActiveBullet() {
        //находим активный bullet
        const activeBullet = this.activeBulletIndex
                            ? this.bullets[this.activeBulletIndex] 
                            : this.bulletsContainer.querySelector(`.${this.config.bulletActiveClass}`)

        //если существует удаляем его
        if (activeBullet)
            activeBullet.classList.remove(this.config.bulletActiveClass)
    }

    addActiveBullet(numberBullet) {
        //назначаем новый активный bullet
        this.bullets[numberBullet].classList.add(this.config.bulletActiveClass)
        this.activeBulletIndex = numberBullet
    }

    eventBulletsListener() {
        this.deleteActiveBullet()

        //определяем активный слайд
        this.findActiveIndex()  

        //выбираем bullet
        let toIndex = this.centerBullet

        //если activeIndex меньше центрального элемента
        //то в toIndex без изменений передаем activeIndex
        if (this.activeIndex < this.centerBullet)
            toIndex = this.activeIndex
        //если activeIndex >= ("кол-во слайдов" - "кол-во слайдов на странице") - "центральный элемент"
        //то есть, условие для activeIndex, с которого начинают работать последние элем. пагинации, а не центральный
        else if (this.activeIndex >= (this.quantitySlides - this.slidesPerView) - this.centerBullet)
            //то index = ("кол-во элем. пагинации" - 1) - (("кол-во слайдов" - "кол-во слайдов на странице") - activeIndex)
            //то есть, "элементы пагинации" - "оставшееся кол-во слайдов"
            toIndex = (this.quantityBullets - 1) - ((this.quantitySlides - this.slidesPerView) - this.activeIndex)

        //делаем активаным
        this.addActiveBullet(toIndex)
    }

    eventBulletsSelect(e) {
        let bulletIndex = 0

        //находим index нажатого элемента
        while (bulletIndex < this.quantityBullets && e.target !== this.bullets[bulletIndex])
            bulletIndex++
        
        //если нажатый элемент не является активным
        if (bulletIndex !== this.activeBulletIndex) {
            let toIndex = 0
            
            //если листаем вперед
            if (bulletIndex > this.activeBulletIndex)
                //то toIndex = "индекс слайда" - ("нажатый bullet" - "активный bullet")
                toIndex = this.activeIndex + (bulletIndex - this.activeBulletIndex)
            //если листаем назад
            else if (bulletIndex < this.activeBulletIndex)
                //то toIndex = "индекс слайда" - ("активный bullet" - "нажатый bullet")
                toIndex = this.activeIndex - (this.activeBulletIndex - bulletIndex)

            //В зависимости от loop используем разные методы
            if (this.loop)
                this.slider.slideToLoop(toIndex)
            else
                this.slider.slideTo(toIndex)
        }
    }

    eventBulletsClick(e) {
        if (e.target.classList.contains(this.config.bulletClass)) {
            this.eventBulletsSelect(e)
        }
    }

    eventBulletsKeydown(e) {
        if (e.target.classList.contains(this.config.bulletClass) 
            && e.target.hasAttribute('tabindex') 
            && e.keyCode === 13) {
                this.eventBulletsSelect(e)
        }
    }

    setSlidesPerView(quantity) {
        if (quantity && quantity >= 1 && quantity !== this.slidesPerView) {
            this.slidesPerView = (this.loop && quantity > 1) 
                                ? quantity - 1 
                                : quantity
        }   
    }
}