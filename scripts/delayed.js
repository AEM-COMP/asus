// // add delayed functionality here

// // eslint-disable-next-line import/no-extraneous-dependencies
// // import $ from 'jquery';

// // eslint-disable-next-line no-debugger
// console.log('Swiper', $('body') , window.Swiper);
// // Constants
// const CUSTOM_EFFECT_NAME = 'creative';
// const CAROUSEL_SELECTOR = '.carousel:has(.cmp-carousel:not([data-init="false"]))';

// // Initialize Swiper on AEM Carousel
// window.initializeSwiperOnAEMCarousel = (carousel) => {
//   const carouselElement = carousel.querySelector('.cmp-carousel');
//   const {
//     slidesPerView = 1,
//     spaceBetween = 16,
//     slidesPerViewTablet = 1,
//     slidesPerViewDesktop = 1,
//     spaceBetweenTablet = 24,
//     spaceBetweenDesktop = 24,
//     loopSlides = false,
//     carouselEffect = 'slide',
//     cmpDelay: delay,
//     prevSlideMessage = 'Previous slide',
//     nextSlideMessage = 'Next slide',
//   } = carouselElement.dataset;

//   const parsedDelay = parseInt(delay, 10);
//   const isAutoplayEnabled = parsedDelay > 0;
//   const isCustomEffect = carouselEffect === CUSTOM_EFFECT_NAME;

//   // DOM elements
//   const contentContainer = carousel.querySelector('.cmp-carousel__content');
//   const items = [...carousel.querySelectorAll('.cmp-carousel__item')];
//   const indicators = carousel.querySelector('.cmp-carousel__indicators');
//   const mediaControls = carousel.querySelector('.cmp-carousel__media-controls');
//   const prevEl = carousel.querySelector('.cmp-carousel__action--previous');
//   const nextEl = carousel.querySelector('.cmp-carousel__action--next');
//   const actions = carouselElement.querySelector('.cmp-carousel__actions');

//   // To check if bullet key activation is used
//   // This is used to differentiate between slide changes via keyboard focus and other means
//   let bulletKeyActivated = false;

//   // Create Swiper structure
//   const swiperWrapper = document.createElement('div');
//   swiperWrapper.className = 'swiper-wrapper';

//   const fragment = document.createDocumentFragment();
//   items.forEach((item) => {
//     item.classList.add('swiper-slide');
//     fragment.appendChild(item);
//   });
//   swiperWrapper.appendChild(fragment);

//   const swiperContainer = document.createElement('div');
//   swiperContainer.className = 'swiper';
//   swiperContainer.appendChild(swiperWrapper);

//   contentContainer.replaceChildren(swiperContainer);

//   // Render navigation buttons
//   if (actions) {
//     swiperContainer.appendChild(actions);
//   }

//   // Check if pagination elements are present and create carousel footer element
//   const hasPagination = !!indicators;

//   const carouselFooter = document.createElement('div');
//   carouselFooter.className = 'cmp-carousel__footer';

//   // Create indicators group which will hold the indicators and autoplay toggle button
//   const indicatorsGroup = document.createElement('div');
//   indicatorsGroup.className = 'cmp-carousel__indicators-group';

//   if (hasPagination) {
//     // Append footer to the carousel content element
//     contentContainer.appendChild(carouselFooter);

//     indicators.classList.add('swiper-pagination');
//     indicatorsGroup.appendChild(indicators);
//     carouselFooter.appendChild(indicatorsGroup);

//     // Append media controls to carousel footer if available
//     if (mediaControls) {
//       carouselFooter.appendChild(mediaControls);
//     }
//   }

//   // Base Swiper configuration
//   const baseConfig = {
//     slidesPerView,
//     spaceBetween,
//     watchSlidesProgress: true,
//     loop: loopSlides !== 'false' && Boolean(loopSlides),
//     navigation: { prevEl, nextEl, disabledClass: 'cmp-carousel__action--disabled' },
//     pagination: {
//       el: indicators,
//       clickable: true,
//       bulletClass: 'cmp-carousel__indicator',
//       bulletActiveClass: 'cmp-carousel__indicator--active',

//       renderBullet: (index, className) => {
//         return `<li class="${className}" aria-label="Go to slide ${index + 1}" role="tab"></li>`;
//       },
//     },
//     autoplay: isAutoplayEnabled
//       ? { delay: parsedDelay, disableOnInteraction: false, waitForTransition: true }
//       : false,
//     breakpoints: {
//       768: {
//         slidesPerView: slidesPerViewTablet,
//         spaceBetween: spaceBetweenTablet,
//       },
//       1024: {
//         slidesPerView: slidesPerViewDesktop,
//         spaceBetween: spaceBetweenDesktop,
//       },
//     },
//     on: {
//       afterInit(swiper) {

//         swiper.slides.forEach((slide) => {
//           slide.setAttribute('tabindex', '-1');

//           // Set autoplay delay for each slide based on video duration
//           const slideVideo = slide?.querySelector('.hero-video');
//           if (slideVideo) {
//             if (slideVideo.readyState >= 1 && !isNaN(slideVideo.duration)) {
//               // Metadata is already loaded
//               slide.dataset.swiperAutoplay = (slideVideo.duration + 1) * 1000;
//             } else {
//               // Wait for metadata
//               slideVideo.addEventListener('loadedmetadata', () => {
//                 slide.dataset.swiperAutoplay = (slideVideo.duration + 1) * 1000;
//               });
//             }
//           }
//         });

//         // Set initial accessibility state for all slides
//         if (isCustomEffect || isAutoplayEnabled) {
//           swiper.slides.forEach((slide, index) => {
//             // updateSlideFocusability(slide, index === swiper.activeIndex);
//           });
//         }

//         // A11Y: Add event listener for pagination bullets
//         // Watch for keyboard activation on bullets
//         indicators?.addEventListener('keydown', function (e) {
//           const isBullet = e.target && e.target.classList.contains('swiper-pagination-bullet');
//           const isActivationKey = e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar';

//           if (isBullet && isActivationKey) {
//             e.preventDefault();
//             bulletKeyActivated = true;
//           }
//         });
//       },
//       autoplayTimeLeft(swiper, time, progress) {
//         swiper.pagination.bullets.forEach((bullet, idx) => {
//           bullet.style.setProperty('--slide-progress', idx === swiper.realIndex ? 1 - progress : 0);
//         });
//       },
//       slideChange(swiper) {
//         // Reset bullet progress bars without animation
//         swiper.pagination.bullets.forEach((bullet) => {
//           const progressEl = bullet.querySelector('.bullet-progress');
//           if (!progressEl) {
//             return;
//           }

//           progressEl.style.transition = 'none';
//           progressEl.style.transform = 'scaleX(0)';
//         });
//       },
//       autoplayStart(swiper) {
//         if (hasPagination) {
//           // Create autoplay toggle button
//           const playPauseBtn = document.createElement('button');
//           playPauseBtn.className = 'carousel-autoplay-toggle';
//           playPauseBtn.setAttribute('aria-label', 'Pause carousel auto-play');
//           playPauseBtn.setAttribute('type', 'button');

//           // Check if button already exists
//           const existingBtn = indicatorsGroup.querySelector('.carousel-autoplay-toggle');
//           if (existingBtn) {
//             indicatorsGroup.replaceChild(playPauseBtn, existingBtn);
//           } else {
//             indicatorsGroup.appendChild(playPauseBtn);
//           }
//           // playPauseBtn.addEventListener('click', () => toggleAutoplayHandler(swiper, playPauseBtn));
//         }

//         // Add autoplay class to swiper element
//         swiper.el.classList.add('is-autoplay-enabled');
//         swiper.el.classList.remove('is-autoplay-paused');
//       },
//       autoplayStop(swiper) {
//         swiper.el.classList.remove('is-autoplay-enabled', 'is-autoplay-paused');
//       },
//       autoplayPause(swiper) {
//         swiper.el.classList.add('is-autoplay-paused');

//         // Pause the video in the active slide
//         const activeVideo = swiper.slides[swiper.activeIndex]?.querySelector('.hero-video');
//         // manageVideoPlayback(activeVideo, 'pause');
//       },
//       autoplayResume(swiper) {
//         swiper.el.classList.remove('is-autoplay-paused');
//         // Resume the video in the active slide
//         const activeVideo = swiper.slides[swiper.activeIndex]?.querySelector('.hero-video');
//         // manageVideoPlayback(activeVideo, 'play');
//       },
//       slideChangeTransitionEnd: (swiper) => {
//         // Handle video playback on slide change
//         // handleVideoPlayback(swiper);

//         /**
//          * A11Y: Slide change is triggered by pagination
//          * Then remove aria-hidden attribute from the active slide and move focus on the active slide.
//          * This will allow the screen reader to read the content of the active slide.
//          */
//         if (bulletKeyActivated) {
//           swiper.slides[swiper.activeIndex].focus();
//         }
//         bulletKeyActivated = false; // Reset after each change

//         // Update accessibility for the new and previous slides
//         if (isCustomEffect || isAutoplayEnabled) {
//           // updateSlideFocusability(swiper.slides[swiper.previousIndex], false);
//           // updateSlideFocusability(swiper.slides[swiper.activeIndex], true);
//         }
//       },
//     },
//   };

//   // Merge custom effect settings
//   const finalConfig = isCustomEffect ? { ...baseConfig } : baseConfig;

//   // Initialize Swiper
//   const swiperInstance = new window.Swiper(swiperContainer, finalConfig);

//   // Store reference for the observer to use
//   swiperContainer.swiperInstance = swiperInstance;

//   // Handle autoplay observer
//   // swiperAutoplayObserver.observe(swiperContainer);

//   return swiperInstance;
// };

// // Initialize all carousels
// document.querySelectorAll(CAROUSEL_SELECTOR).forEach(window.initializeSwiperOnAEMCarousel);
