import {getElement} from '@actions/index'

export default class Parallax {
    constructor(parallaxBox, options) {
        //Скорость анимации
        this.defaultSpeed = 0.05

        //Элементы
        //контейнер
        this.parallaxBox = getElement(parallaxBox)

        //опции
        this.options = options

        //Объявление координат
        this.positionX = 0
        this.positionY = 0
        this.coordXprocent = 0
        this.coordYprocent = 0

        //Медиа-запрос (Адаптив)
        this.mediaQueryLaptop = window.matchMedia('(max-width: 1179px)')
        this.lock = false

        this.init()
    }

    init() {
        //сразу запускаем проверку медиа запроса
        this.changeLock(this.mediaQueryLaptop.matches)

        this.events()
    }

    events() {
        if (this.parallaxBox) {
            //Слушатель параллакса
            this.parallaxBox.addEventListener('mousemove', (e) => {
                this.parallaxListener(e)
            })
            
            //Слушатель медиа-запроса
            this.mediaQueryLaptop.addEventListener('change', (e) => {
                this.changeLock(e.matches)
            })
        }
    }

    parallaxListener(e) {
        if (!this.lock) {
            const
                parallaxWidth = this.parallaxBox.offsetWidth,
                parallaxHeight = this.parallaxBox.offsetHeight,

                //Координаты от середины
                coordX = e.clientX - parallaxWidth / 2,
                coordY = e.clientY - parallaxHeight / 2

            //Получаем проценты
            this.coordXprocent = coordX / parallaxWidth * 100
            this.coordYprocent = coordY / parallaxHeight * 100

            //Сдвиг
            const distX = this.coordXprocent - this.positionX
            const distY = this.coordYprocent - this.positionY

            this.options.forEach(option => {
                const
                    speed = option.speed ? Number(option.speed) : this.defaultSpeed,
                    invertX = option.invertX ? -1 : 1,
                    invertY = option.invertY ? -1 : 1,
                    coefficientX = Number(option.coefficientX ? option.coefficientX : option.coefficientY),
                    coefficientY = Number(option.coefficientY ? option.coefficientY : coefficientX),
                    parallaxItem = getElement(option.item)

                //Новая позиция элемента
                if (coefficientX >= 0)
                    this.positionX = this.positionX + (distX * speed)
                if (coefficientY >= 0)
                    this.positionY = this.positionY + (distY * speed)

                if (parallaxItem) {
                    if (coefficientX >= 0 && coefficientY >= 0)
                        parallaxItem.style.cssText = `transform: translate(${invertX * this.positionX / coefficientX}%, ${invertY * this.positionY / coefficientY}%)`
                    else if (coefficientX >= 0)
                        parallaxItem.style.cssText = `transform: translateX(${invertX * this.positionX / coefficientX}%)`
                    else if (coefficientY >= 0)
                        parallaxItem.style.cssText = `transform: translateY(${invertY * this.positionY / coefficientY}%)`
                }
            })
        }
    }

    changeLock(mediaQueryMatches) {
        this.lock = mediaQueryMatches ? true : false
        //удаляем добавленные через js свойства
        this.removeProperties()
    }

    removeProperties() {
        this.options.forEach(option => {
            const parallaxItem = getElement(option.item)

            parallaxItem.style.removeProperty("transform")
        })
    }
}