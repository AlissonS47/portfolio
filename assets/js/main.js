// Hero header 
const header = document.querySelector("header");
// Header nav to be styled on scroll
const headerNav = document.querySelector(".js-top-header");
// All sections of the page
const sections = Array.from(document.querySelectorAll(".js-section"));
// Header menu navigation
const mobileNav = document.querySelector(".js-header-nav");
// Links for the page navigation
const navLinks = Array.from(document.querySelectorAll(".js-nav-link"));
// Mobile menu button
const mobileMenuBtn = document.querySelector(".js-mobile-menu-btn");
// Mobile menu icons to be toggled
const mobileMenuIcons = Array.from(mobileMenuBtn.children);
// Mobile menu background
const mobileMenuBtnBg = document.querySelector(".js-mobile-menu-bg");
// Elements to be animated on scroll
const animatedElements = Array.from(document.querySelectorAll(".js-animated"));

/**
 * Calculate a custom threshold based on the height of the element and the height of the window. When the height of 
 * an element is greater than the height of the window, a default threshold may not work properly,
 * since it is based only on the size of the window, using a custom threshold it will create a relationship between
 * the element and the window, ensuring its proper operation.
 * @param {object} threshold desired threshold
 * @param {number} elementHeight element Height
 * @param {number} windowHeight window Height
 * @return {number} threshold based on the target
 */
 function customThreshold(threshold, elementHeight, windowHeight){
    if(elementHeight > windowHeight){
        return parseFloat(((windowHeight/elementHeight)*threshold).toFixed(2));
    } else {
        return threshold;
    }
}

/**
 * Scrolls the page to the target. Since the scrolling speed cannot be changed, it will be done
 * in steps, where on each step it will be scrolled a fraction of the total distance. Each step will have
 * a delay, a fraction of the total scrolling time desired, visually looking like a continuous scrolling
 * @param {object} targetElement target element
 * @param {number} steps defines how smooth the scrolling will be, the more steps, the smoother it will be
 * @param {number} time total time desired for scrolling, in seconds
 * @param {number} margin sets a margin for the target, a negative value will stop the scroll before the target
 */
 function scrollToTarget(targetElement, steps, time, margin){
    const targetLocation = targetElement.offsetTop + margin >= 0 ? targetElement.offsetTop + margin : 0;
    let windowLocation = window.pageYOffset;
    const distance = targetLocation - windowLocation;
    const step = distance/steps;
    const stepTime = (time/steps)*1000;
    let currentStep = 1;
    const interval = setInterval(() => {
        // to correct any rounding of the steps and ensure that the scrolling will stop exactly 
        // where desired, the last step will pick up the remaining distance and use it for the final scrolling
        if(currentStep == steps) {
            windowLocation += targetLocation - windowLocation;
            clearInterval(interval);
        } else {
            windowLocation += step;
        }
        window.scroll(0, windowLocation);
        currentStep++;
    }, stepTime);
}

/**
 * Creates a typing effect by adding one letter at a time
 * @param {object} element HTML element where the text will be added
 * @param {string} text desired text for the effect
 */
function typingEffect(element, text){
    return new Promise((resolve, reject) => {
        const textArray = Array.from(text);
        let i = 0;
        const interval = setInterval(() => {
            if(i == textArray.length - 1){
                clearInterval(interval);
                resolve();
            };
            element.textContent += textArray[i];
            i++
        }, 80);
    });
}

/**
 * Removes the preloader. First wait 1,5s to avoid a weird ending of the animation, then add the
 * class to animate the remove of the preloader, wait 0.8s to end the animation and then finally 
 * removes the preloader from the dom
 * @param {object} preloaderElement preloader element
 */
function preloader(preloaderElement){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            preloaderElement.classList.add("preloader--end");
            setTimeout(() => {
                preloaderElement.remove();
                resolve();
            }, 800);
        }, 1500);
    });
}

/**
 * Setup the startup of the page, removing the preloader and starting the
 * header animations
 */
async function setUp(){
    const body = document.querySelector("body");
    body.classList.add("show-preloader");
    const preloaderElement = document.querySelector(".preloader");
    const title = Array.from(document.querySelectorAll(".js-tittle"));
    title[0].textContent = "";
    title[1].textContent = "";
    await preloader(preloaderElement);
    body.classList.remove("show-preloader");
    header.classList.add("show-animation");
    await typingEffect(title[0], "Olá, eu sou o ");
    await typingEffect(title[1], "Alisson");
}

// Set up the startup of the page when it load
window.addEventListener("load", () => {
    setUp();
})

// Show/Hide the mobile navigation when mobile menu button is clicked
mobileMenuBtn.addEventListener("click", () => {
    // Used to know when the mobile navigation is being displayed
    mobileNav.dataset.navShown = mobileNav.dataset.navShown == "true"? "false": "true";
    // Toggle between the hamburguer and close icons
    mobileMenuIcons.forEach(icon => {
        icon.classList.toggle("mobile-show");
    });
    // Toggle the navigation background and links list
    mobileMenuBtnBg.classList.toggle("mobile-menu__bg--show");
    mobileNav.classList.toggle("top-header__nav--show");
});

// Observer to style the header nav on scroll
const headerObserser = new IntersectionObserver(intersections => {
    intersections.forEach(intersection => {
        headerNav.classList.toggle("top-header--scrolled", !intersection.isIntersecting);
    });
}, {threshold: 0.9});
headerObserser.observe(header);

// Style the nav links acording to the current section on the viewport
sections.forEach(section => {
    const sectionTreshold = customThreshold(0.82, section.offsetHeight, window.innerHeight);
    // Condition to aply the style
    let styleCondition;
    // The observer is set here to be able to use a variable treshold
    new IntersectionObserver(intersections => {
        intersections.forEach(intersection => {
            if(intersection.isIntersecting){
                navLinks.forEach(link => {
                    // Style if the link href and the section id are the same, except for the logo link who refers the header
                    styleCondition = link.getAttribute("href") == ("#" + intersection.target.getAttribute("id")) &&
                                        link.getAttribute("href") != "#header";
                    link.classList.toggle("active-link", styleCondition);
                });
            };
        });
    }, {threshold: sectionTreshold}).observe(section);
});

// Start elements animation on scroll
animatedElements.forEach(element => {
    const elementTreshold = customThreshold(0.5, element.offsetHeight, window.innerHeight);
    const elementObserver = new IntersectionObserver(intersections => {
        intersections.forEach(intersection => {
            if(intersection.isIntersecting){
                intersection.target.classList.add("show-animation");
                elementObserver.unobserve(intersection.target);
            };
        });
    }, {threshold: elementTreshold});
    elementObserver.observe(element);
});

// Scroll the page to the navigation link href
navLinks.forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        // If the mobile navigation is displayed, simulate a click to close it
        if(mobileNav.dataset.navShown == "true"){
            mobileMenuBtn.click();
        }
        const targetId = event.currentTarget.getAttribute("href");
        const target = document.querySelector(targetId);
        scrollToTarget(target, 25, 0.5, -25);
    });
});
