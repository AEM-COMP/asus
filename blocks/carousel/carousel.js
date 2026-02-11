/**
 * Carousel Block with Hero Banner Slides
 * Supports authorable hero banner slides with video/image media, CTA buttons, and autoplay settings
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

// Configuration defaults
const DEFAULT_IMAGE_AUTOPLAY = 3000;
const DEFAULT_VIDEO_AUTOPLAY = 3000;

/**
 * Parse carousel configuration from block data
 */
function parseCarouselConfig(block) {
  const config = {
    imageAutoplayDuration: DEFAULT_IMAGE_AUTOPLAY,
    videoAutoplayDuration: DEFAULT_VIDEO_AUTOPLAY,
    slides: []
  };

  // Parse rows from the block
  const rows = [...block.children];
  
  if (rows.length === 0) return config;

  let slideStartIndex = 0;

  // Check if first two rows contain autoplay duration settings
  if (rows.length >= 2) {
    const firstRowCells = [...rows[0].children];
    const secondRowCells = [...rows[1].children];
    
    // Check if these are autoplay duration rows (single values)
    if (firstRowCells.length === 1 && secondRowCells.length === 1) {
      const imageAutoplayValue = parseInt(firstRowCells[0].textContent.trim(), 10);
      const videoAutoplayValue = parseInt(secondRowCells[0].textContent.trim(), 10);
      
      if (!isNaN(imageAutoplayValue)) {
        config.imageAutoplayDuration = imageAutoplayValue * 1000;
      }
      if (!isNaN(videoAutoplayValue)) {
        config.videoAutoplayDuration = videoAutoplayValue * 1000;
      }
      
      slideStartIndex = 2; // Skip first two rows
    }
  }

  // Parse slide data from remaining rows
  rows.slice(slideStartIndex).forEach((row, index) => {
    const cells = [...row.children];
    
    // Debug logging
    console.log(`Processing row ${index + slideStartIndex}:`, cells.length, 'cells');
    
    if (cells.length >= 7) {
      // Extract media information
      let media = '';
      let mediaAlt = '';
      let isVideo = false;

      // Check third cell for media content
      const mediaCell = cells[2];
      if (mediaCell) {
        const picture = mediaCell.querySelector('picture');
        const link = mediaCell.querySelector('a');
        const textContent = mediaCell.textContent?.trim();
        
        if (picture) {
          // Extract image source from picture element
          const img = picture.querySelector('img');
          if (img) {
            media = img.src;
            mediaAlt = img.alt || '';
          }
        } else if (link) {
          // Video or image link
          media = link.href;
          isVideo = media.match(/\.(mp4|webm|ogg)$/i) !== null;
        } else if (textContent) {
          // Direct media path in text content
          media = textContent;
          isVideo = media.match(/\.(mp4|webm|ogg)$/i) !== null;
        }
      }

      // Extract CTA link properly
      let ctaLink = '';
      const ctaLinkCell = cells[5];
      if (ctaLinkCell) {
        const linkElement = ctaLinkCell.querySelector('a');
        if (linkElement) {
          ctaLink = linkElement.href;
        } else {
          ctaLink = ctaLinkCell.textContent?.trim() || '';
        }
      }

      const slide = {
        id: `slide-${index}`,
        title: cells[0]?.textContent?.trim() || '',
        subtitle: cells[1]?.textContent?.trim() || '',
        media: media,
        mediaAlt: mediaAlt || 'Carousel slide media',
        ctaText: cells[3]?.textContent?.trim() || '',
        ctaLocation: cells[4]?.textContent?.trim() || 'center',
        ctaLink: ctaLink,
        openNewTab: cells[6]?.textContent?.toLowerCase().includes('true') || false,
        isVideo: isVideo,
        originalRow: row // Store reference to original row for instrumentation
      };
      
      // Debug logging
      console.log(`Created slide ${index}:`, slide);
      
      config.slides.push(slide);
    } else {
      console.warn(`Row ${index + slideStartIndex} has insufficient cells (${cells.length}), skipping`);
    }
  });

  console.log('Final config:', config);
  return config;
}


/**
 * Generate hero banner element for a slide
 */
function generateHeroBannerHTML(slide, config) {
  const ctaLocationClass = `hero-content--${slide.ctaLocation.toLowerCase()}`;
  const autoplayDuration = slide.isVideo ? config.videoAutoplayDuration : config.imageAutoplayDuration;

  // Create the main hero banner container
  const heroBanner = document.createElement('div');
  heroBanner.className = `hero-banner cmp-hero-banner ${ctaLocationClass}`;

  // Create media wrapper (video or image)
  if (slide.isVideo) {
    const videoWrapper = document.createElement('div');
    videoWrapper.className = 'hero-video-wrapper';
    
    const video = document.createElement('video');
    video.className = 'hero-video';
    video.loop = true;
    video.muted = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('data-autoplay-duration', autoplayDuration);
    
    const source = document.createElement('source');
    source.src = 'https://publish-p165753-e1767020.adobeaemcloud.com/content/dam/ROG/carousel/BigBuckBunny.mp4';
    source.type = 'video/mp4';
    
    video.appendChild(source);
    videoWrapper.appendChild(video);
    heroBanner.appendChild(videoWrapper);
  } else {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'hero-image-wrapper';
    
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = slide.media;
    img.alt = slide.mediaAlt;
    img.className = 'hero-image';
    img.loading = 'lazy';
    
    picture.appendChild(img);
    imageWrapper.appendChild(picture);
    heroBanner.appendChild(imageWrapper);
  }

  // Create hero content section
  const heroContent = document.createElement('div');
  heroContent.className = 'hero-content';

  if (slide.subtitle) {
    const productName = document.createElement('p');
    productName.className = 'product-name';
    productName.textContent = slide.subtitle;
    heroContent.appendChild(productName);
  }

  const headline = document.createElement('h2');
  headline.className = 'headline';
  headline.textContent = slide.title;
  heroContent.appendChild(headline);

  if (slide.ctaText && slide.ctaLink) {
    const ctaButton = document.createElement('a');
    ctaButton.href = slide.ctaLink;
    ctaButton.className = 'cta-button btn';
    ctaButton.textContent = slide.ctaText;
    ctaButton.setAttribute('aria-label', `${slide.ctaText} ${slide.subtitle}`);
    
    if (slide.openNewTab) {
      ctaButton.target = '_blank';
      ctaButton.rel = 'noopener noreferrer';
    }
    
    heroContent.appendChild(ctaButton);
  }

  heroBanner.appendChild(heroContent);
  return heroBanner;
}

/**
 * Manages video playback (play/pause) and handles promises to avoid uncaught errors.
 * @param {HTMLVideoElement} video - The video element to control.
 * @param {'play' | 'pause'} action - The action to perform.
 */
const manageVideoPlayback = (video, action) => {
  if (!video) {
    return;
  }

  let promise;
  if (action === 'play') {
    if (typeof video.play === 'function') {
      promise = video.play();
    }
  } else if (action === 'pause') {
    if (typeof video.pause === 'function') {
      promise = video.pause();
    }
  } else {
    console.error('Invalid video action:', action);
    return;
  }

  if (promise !== undefined) {
    promise.catch((e) => console.error(`Video ${action} failed:`, e));
  }
};

/**
 * Toggle video play/pause and manage paused class on media controls
 */
const toggleSliderVideo = (videoPlayPauseBtn) => {
  const activeSlide = document.querySelector('.swiper-slide-active');
  let activeSlideProdName = document.querySelector('.swiper-slide-active .product-name')?.textContent;

  const activeVideo = activeSlide?.querySelector('video');
  const mediaControls = document.querySelector('.cmp-carousel__media-controls');
  
  if (activeSlide && activeVideo) {
    if (activeVideo.paused) {
      manageVideoPlayback(activeVideo, 'play');
      videoPlayPauseBtn?.setAttribute('aria-label', 'Pause ' + activeSlideProdName);
      videoPlayPauseBtn?.setAttribute('title', 'Pause ' + activeSlideProdName);
      mediaControls?.classList.remove('paused');
    } else {
      manageVideoPlayback(activeVideo, 'pause');
      videoPlayPauseBtn?.setAttribute('aria-label', 'Play ' + activeSlideProdName);
      videoPlayPauseBtn?.setAttribute('title', 'Play ' + activeSlideProdName);
      mediaControls?.classList.add('paused');
    }
  }
};

/**
 * Detect if running in Universal Editor environment
 */
function isUniversalEditor() {
  // More comprehensive UE detection
  return (
    // URL-based detection
    window.location.pathname.includes('/editor.html') ||
    window.location.search.includes('editor') ||
    window.location.search.includes('aue_') ||
    // DOM-based detection
    document.body.hasAttribute('data-aue-behavior') ||
    document.body.classList.contains('editor') ||
    document.body.classList.contains('aem-authoring-enabled') ||
    document.querySelector('[data-aue-behavior]') ||
    document.querySelector('.aem-editor') ||
    // Framework detection
    window.hlx?.sidekickConfig ||
    document.querySelector('helix-sidekick') ||
    // Context detection
    window.parent !== window ||
    // Direct attribute checks
    document.documentElement.hasAttribute('data-authoring') ||
    document.documentElement.classList.contains('authoring-mode')
  );
}

/**
 * Initialize Swiper carousel
 */
function initializeSwiper(carouselElement, config) {
  const isUE = isUniversalEditor();
  
  //Force apply UE authoring class and attributes for CSS targeting
  if (isUE) {
    const carousel = carouselElement.querySelector('.cmp-carousel');
    if (carousel) {
      carousel.classList.add('ue-authoring');
      carousel.setAttribute('data-authoring', 'true');
      document.body.setAttribute('data-aue-behavior', 'true');
    }
  }
  
  // Swiper is already loaded via head.html, initialize directly
  const setupSwiper = () => {
    // Check if Swiper is available
    if (!window.Swiper) {
      console.warn('Swiper not available, activating fallback mode');
      carouselElement.querySelector('.swiper')?.classList.add('swiper-fallback');
      return;
    }
    
    try {
      const swiperConfig = {
        loop: true, // Disable loop in UE authoring
        autoplay: {
          delay: config.imageAutoplayDuration,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        },
        pagination: {
          el: '.cmp-carousel__indicators',
          clickable: true,
          bulletClass: 'cmp-carousel__indicator',
          bulletActiveClass: 'cmp-carousel__indicator--active',
          renderBullet: (index, className) => {
            return `<li class="${className}" aria-label="Go to slide ${index + 1}" role="tab"></li>`;
          },
        },
        navigation: {
          nextEl: '.cmp-carousel__action--next',
          prevEl: '.cmp-carousel__action--previous',
        },
        on: {
          slideChange: function() {
            // Update autoplay delay based on current slide media type
            const activeSlide = this.slides[this.activeIndex];
            const video = activeSlide?.querySelector('video');
            const newDelay = video ? config.videoAutoplayDuration : config.imageAutoplayDuration;
            
            // Remove paused class when switching slides
            const mediaControls = document.querySelector('.cmp-carousel__media-controls');
            mediaControls?.classList.remove('paused');
            
            if (this.autoplay && this.autoplay.stop) {
              this.autoplay.stop();
              this.params.autoplay.delay = newDelay;
              this.autoplay.start();
            }
          },
          slideChangeTransitionEnd: function() {
            const activeSlide = this.slides[this.activeIndex];
            const video = activeSlide?.querySelector('video');
            
            if (video) {
              manageVideoPlayback(video, 'play');
            }
            
            // Pause videos in other slides
            this.slides.forEach((slide, index) => {
              if (index !== this.activeIndex) {
                const slideVideo = slide.querySelector('video');
                if (slideVideo) {
                  manageVideoPlayback(slideVideo, 'pause');
                }
              }
            });
          },
          autoplayTimeLeft(swiper, time, progress) {
            swiper.pagination.bullets.forEach((bullet, idx) => {
              bullet.style.setProperty('--slide-progress', idx === swiper.realIndex ? 1 - progress : 0);
            });
          },
        }
      };

      const swiper = new window.Swiper(carouselElement.querySelector('.swiper'), swiperConfig);

      // Add media control functionality (only if not in UE)
      const playPauseBtn = carouselElement.querySelector('.cmp-carousel__media-control--play-pause');
      const autoplayToggle = carouselElement.querySelector('.carousel-autoplay-toggle');
      
      if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
          toggleSliderVideo(playPauseBtn);
        });
      }

      if (autoplayToggle) {
        autoplayToggle.addEventListener('click', () => {
          const activeSlide = document.querySelector('.swiper-slide-active');
          const activeVideo = activeSlide?.querySelector('video');
          const mediaControls = document.querySelector('.cmp-carousel__media-controls');
          const isVideoPaused = mediaControls?.classList.contains('paused');
          
          if (swiper.autoplay && swiper.autoplay.running) {
            swiper.autoplay.stop();
            swiper.el.classList.add('is-autoplay-paused');
            autoplayToggle.setAttribute('aria-label', 'Play');
            carouselElement.setAttribute('aria-live', 'polite');
            
            // Maintain video pause state when autoplay is paused
            if (isVideoPaused && activeVideo) {
              manageVideoPlayback(activeVideo, 'pause');
              mediaControls?.classList.add('paused');
            }
          } else if (swiper.autoplay) {
            swiper.autoplay.start();
            swiper.el.classList.remove('is-autoplay-paused');
            autoplayToggle.setAttribute('aria-label', 'Pause');
            carouselElement.setAttribute('aria-live', 'off');
            
            // Resume video if it wasn't manually paused
            if (!isVideoPaused && activeVideo) {
              manageVideoPlayback(activeVideo, 'play');
            }
          }
        });
      }
    } catch (error) {
      console.error('Error initializing Swiper carousel:', error);
      // Fallback: show static content
      carouselElement.querySelector('.swiper')?.classList.add('swiper-fallback');
    }
  };

  // Delay initialization to ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSwiper);
  } else {
    // Additional delay for UE environments
    setTimeout(setupSwiper, isUE ? 500 : 100);
  }
}

/**
 * Main decoration function
 */
export default function decorate(block) {
  const config = parseCarouselConfig(block);
  
  if (config.slides.length === 0) {
    // Fallback content if no slides configured
    block.innerHTML = '<div class="carousel-placeholder"><p>No carousel slides configured</p></div>';
    return;
  }

  // Generate carousel ID
  const carouselId = `carousel-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create wrapper elements
  const carouselWrapper = document.createElement('div');
  carouselWrapper.className = 'carousel panelcontainer';
  
  const carousel = document.createElement('div');
  carousel.id = carouselId;
  carousel.className = 'cmp-carousel';
  carousel.setAttribute('role', 'group');
  carousel.setAttribute('aria-live', 'off');
  carousel.setAttribute('aria-roledescription', 'carousel');
  carousel.setAttribute('data-cmp-delay', config.imageAutoplayDuration);
  carousel.setAttribute('data-placeholder-text', 'false');
  carousel.setAttribute('data-loop-slides', 'true');
  
  const carouselContent = document.createElement('div');
  carouselContent.className = 'cmp-carousel__content';
  
  const swiper = document.createElement('div');
  swiper.className = 'swiper swiper-initialized swiper-horizontal swiper-watch-progress swiper-backface-hidden is-autoplay-enabled';
  
  const swiperWrapper = document.createElement('div');
  swiperWrapper.className = 'swiper-wrapper';
  swiperWrapper.setAttribute('aria-live', 'off');

  // Generate slides as DOM elements with moveInstrumentation
  config.slides.forEach((slide, index) => {
    const slideElement = document.createElement('div');
    slideElement.id = `${carouselId}-item-${slide.id}-tabpanel`;
    slideElement.className = `cmp-carousel__item swiper-slide ${index === 0 ? 'cmp-carousel__item--active' : ''}`;
    slideElement.setAttribute('role', 'group');
    slideElement.setAttribute('aria-label', `Slide ${index + 1} of ${config.slides.length}`);
    slideElement.setAttribute('data-swiper-slide-index', index);
    slideElement.setAttribute('data-swiper-autoplay', slide.isVideo ? config.videoAutoplayDuration : config.imageAutoplayDuration);

    // Move instrumentation from original row to slide element
    if (slide.originalRow) {
      moveInstrumentation(slide.originalRow, slideElement);
    }

    // Generate and append hero banner
    const heroBanner = generateHeroBannerHTML(slide, config);
    slideElement.appendChild(heroBanner);
    
    swiperWrapper.appendChild(slideElement);
  });

  const swiperNotification = document.createElement('span');
  swiperNotification.className = 'swiper-notification';
  swiperNotification.setAttribute('aria-live', 'assertive');
  swiperNotification.setAttribute('aria-atomic', 'true');

  swiper.appendChild(swiperWrapper);
  swiper.appendChild(swiperNotification);
  carouselContent.appendChild(swiper);

  // Create carousel footer
  const carouselFooter = document.createElement('div');
  carouselFooter.className = 'cmp-carousel__footer';

  // Create indicators group
  const indicatorsGroup = document.createElement('div');
  indicatorsGroup.className = 'cmp-carousel__indicators-group';

  // Create indicators list
  const indicatorsList = document.createElement('ol');
  indicatorsList.className = 'cmp-carousel__indicators';
  indicatorsList.setAttribute('role', 'tablist');
  indicatorsList.setAttribute('aria-label', 'Choose a slide to display');

  // Generate indicator elements
  config.slides.forEach((slide, index) => {
    const indicator = document.createElement('li');
    indicator.className = `cmp-carousel__indicator ${index === 0 ? 'cmp-carousel__indicator--active' : ''}`;
    indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
    indicator.setAttribute('role', 'tab');
    indicator.setAttribute('tabindex', '0');
    if (index === 0) {
      indicator.setAttribute('aria-current', 'true');
    }
    indicatorsList.appendChild(indicator);
  });

  // Create autoplay toggle button
  const autoplayToggle = document.createElement('button');
  autoplayToggle.className = 'carousel-autoplay-toggle';
  autoplayToggle.setAttribute('aria-label', 'Pause');

  indicatorsGroup.appendChild(indicatorsList);
  indicatorsGroup.appendChild(autoplayToggle);

  // Create media controls
  const mediaControls = document.createElement('div');
  mediaControls.className = 'cmp-carousel__media-controls';

  const playPauseBtn = document.createElement('button');
  playPauseBtn.className = 'cmp-carousel__media-control cmp-carousel__media-control--play-pause';
  playPauseBtn.setAttribute('aria-label', `Play ${config.slides[0]?.subtitle || 'media'}`);

  mediaControls.appendChild(playPauseBtn);

  carouselFooter.appendChild(indicatorsGroup);
  carouselFooter.appendChild(mediaControls);

  carouselContent.appendChild(carouselFooter);
  carousel.appendChild(carouselContent);
  carouselWrapper.appendChild(carousel);

  // Replace block content
  block.textContent = '';
  block.appendChild(carouselWrapper);

  // Initialize Swiper carousel
  initializeSwiper(carouselWrapper, config);
}
