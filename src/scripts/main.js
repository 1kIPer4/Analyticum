import Anchors from '@modules/anchors'
import Header from '@modules/header'
import Modals from '@modules/modals'
import Forms from '@modules/forms'
import Accordion from '@modules/accordion'

import Swiper from 'swiper/bundle'
import 'swiper/css/bundle'
import TabsSwiperEvent from '@modules/events/tabsSwiperEvent'
import BulletsSwiperEvent from '@modules/events/bulletsSwiperEvent'

import YandexMap from '@modules/yandexMap'
import Parallax from '@modules/parallax'
import ScrollAnimation from './modules/events/scrollAnimation'
import ColorTheme from './modules/colorTheme'

window.addEventListener('DOMContentLoaded', () => {

    //Шапка (обработка меню в ней)
    new Header({
        burger: '#header .btn-burger',
        menu: '.header__menu',
        menuList: '#header .menu',
        menuLinkClass: '.menu__link',
        consultationBtn: '#header .btn-consultation',
        contactsContainer: '.header__contacts',
        modalOpenAttribute: 'data-modal-open'
    })





    //Якори
    new Anchors()





    //Яндекс карта
    new YandexMap(
        {
            key: 'https://api-maps.yandex.ru/2.1/?apikey=42841645-efc7-4bfe-889e-63adce6a1c09&lang=ru_RU',
            addressAttribute: 'data-address',
            addressClass: 'address__text',
            phoneClass: 'phone__text',
            addressRow: '.addresses__item',
            zoom: 17,
            sizeMark: [58, 70],
            defaultAddress: 'г. Челябинск, ул. Доватора, 9 оф.27',
            balloonContentHeader: 'Analyticum +',
            mapID: 'map'
        },
        //media params
        {
            // <= 1600 px
            laptopL: {
                zoom: 16,
                sizeMark: [42, 54]
            },
            // < 1180 px
            laptop: {
                zoom: 16,
                sizeMark: [38, 48]
            }
        }
    )




    
    window.addEventListener('load', () => {

        //Модальные окна
        const modal = new Modals({
            linkAttribute: 'data-modal-link',
            closeAttribute: 'data-close-modal',
            modalTransitionSelector: '.modal__body',
            modalLockClass: '_modal-lock'
        })





        //Формы
        new Forms({
            fieldsSelector: '.form__field, .confirmation',
            fieldErrorSelector: '.text-error',
            messageContainerSelector: '.modal__title',
            modalSuccessId: '#modal-success',
            modalMessageContainer: '.modal__title',
            modalInstance: modal
        })





        //Слайдер Technologies
        //слайдер с текстами
        const technologiesTexts = new Swiper('.technologies__texts', {
            direction: 'horizontal',
            loop: true,
            spaceBetween: 50,
            breakpoints: {
                1180: {
                    direction: 'vertical',
                    spaceBetween: 0,
                }
            },
            slidesPerView: 'auto',
            
        })

        //слайдер с картинками (главный)
        const technologiesImages = new Swiper('.technologies__images', {
            slidesPerView: 'auto',
            loop: true,
            autoplay: {
                delay: 5000,
                pauseOnMouseEnter: true
            },
            //навигация
            navigation: {
                nextEl: '#technologies .btn-arrow-next',
                prevEl: '#technologies .btn-arrow-prev'
            },
            //пагинация
            thumbs: {
                swiper: {
                    el: '#technologies .tabs__menu',
                    slidesPerView: 'auto'
                },
                slideThumbActiveClass: '_active'
            },
            keyboard: {
                enabled: true,
                onlyInViewport: true
            }
        })

        //скрепление слайдеров
        if (technologiesImages && technologiesTexts) {
            technologiesImages.controller.control = technologiesTexts
            technologiesTexts.controller.control = technologiesImages
        }

        //срабатывание на кнопку Enter по табам
        new TabsSwiperEvent(technologiesImages, '#technologies .tabs .swiper-wrapper')

        



        //Аккордеон
        new Accordion('#questions', {
            btnSelector: '.btn-plus',
            rowSelector: '.question__row',
            answerSelector: '.question__answer',
            openClass: 'open'
        })





        //Слайдер Team
        const mediaQueryLaptop = window.matchMedia('(max-width: 1179px)'),
            teamSliderMediaParams = {
                default: {
                    slidesPerView: 2
                },
                laptop: {
                    slidesPerView: 1
                }
            }

        //создание слайдера
        const teamSlider = new Swiper('#team .slider', {
            loop: true,
            slidesPerView: teamSliderMediaParams.laptop.slidesPerView,
            breakpoints: {
                1180: {
                    slidesPerView: teamSliderMediaParams.default.slidesPerView,
                }
            },
            spaceBetween: 20,
            autoplay: {
                delay: 5000
            },
            keyboard: {
                enabled: true,
                onlyInViewport: true
            }
        })

        //добавление bullet'ов
        const bulletsTeamSlider = new BulletsSwiperEvent(teamSlider, {
            quantityBullets: 4,
            bulletsContainer: '#team .bullets',
            bulletClass: 'bullet',
            bulletActiveClass: '_active'
        })

        //функция для изменения кол-ва слайдов (для bullets)
        const changeSlidesPerView = (mediaQueryMatches) => {
            const quantity = mediaQueryMatches 
                            ? teamSliderMediaParams.laptop.slidesPerView
                            : teamSliderMediaParams.default.slidesPerView

            if (bulletsTeamSlider)
                bulletsTeamSlider.setSlidesPerView(quantity)
        }

        //инициализируем
        changeSlidesPerView(mediaQueryLaptop.matches)

        // слушатель медиа-запроса
        // Laptop max 1179
        mediaQueryLaptop.addEventListener('change', (e) => {
            changeSlidesPerView(e.matches)
        })





        //Parallax
        //главная cat
        new Parallax('#welcome', [
            {
                item: '#paw-left',
                coefficientX: 30, coefficientY: 20,
                invertX: true
            },
            {
                item: '#paw-right',
                coefficientX: 30, coefficientY: 20,
                invertX: true
            },
            {
                item: '#cat-body',
                coefficientX: 40,
                invertX: true, invertY: true
            },
        ])
        
        //company надпись
        new Parallax('#company', [
            {
                item: '#illustration__row-1',
                coefficientX: 35, coefficientY: -1
            },
            {
                item: '#illustration__row-2',
                coefficientX: 35, coefficientY: -1,
                invertX: true
            },
            {
                item: '#illustration__row-3',
                coefficientX: 35, coefficientY: -1
            },
            {
                item: '#illustration__row-4',
                coefficientX: 35, coefficientY: -1,
                invertX: true
            },
            {
                item: '#illustration__row-5',
                coefficientX: 35, coefficientY: -1
            },
        ])

        //runner icon в секции advantages
        new Parallax('#advantages', [
            {
                item: '#runner',
                coefficientX: 1.5,
                invertX: true, invertY: true
            },
        ])




        new ScrollAnimation('._anim-items', {
            animationClass: '_show',
            noHideClass: '_anim-no-hide',
            hide: true
        })




      
        new ColorTheme('.theme__range', '.theme__color', '.theme__title',
            [
                '--clr-primary-100',
                '--clr-primary-200',
                '--clr-primary-300'
            ],
            [
                '--clr-button-colored',
                '--clr-button-light',
                '--clr-form-link'
            ]
        )
    })
})